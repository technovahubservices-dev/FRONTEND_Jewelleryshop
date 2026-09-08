import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecentlyViewed, { trackProductView } from '../components/products/RecentlyViewed';
import { WishlistProvider } from '../context/WishlistContext';

const mockGetById = vi.fn();

vi.mock('../services/api', () => ({
  productAPI: {
    getById: (...args) => mockGetById(...args),
    transform: (data) => ({
      id: data._id || data.id,
      name: data.name,
      price: data.price,
      image: data.images?.[0]?.url || data.image,
      images: data.images || [],
      originalPrice: data.originalPrice,
      discount: data.discount,
    }),
  },
}));

vi.mock('../utils/apiUrl', () => ({
  resolveImageUrl: vi.fn((url) => url || ''),
  resolveVideoUrl: vi.fn((url) => url || ''),
}));

const STORAGE_KEY = 'jkr_recently_viewed';

const mockProduct = (overrides = {}) => ({
  _id: overrides._id || 'prod-1',
  name: overrides.name || 'Test Ring',
  price: overrides.price || 5000,
  images: overrides.images || [{ url: 'test-image.jpg' }],
  ...overrides,
});

const renderWithProviders = (component) => {
  render(
    <BrowserRouter>
      <WishlistProvider>
        {component}
      </WishlistProvider>
    </BrowserRouter>
  );
};

describe('trackProductView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores product ID in localStorage', () => {
    trackProductView('prod-1');
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBe(JSON.stringify(['prod-1']));
  });

  it('adds new IDs to the front of the list', () => {
    trackProductView('prod-1');
    trackProductView('prod-2');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual(['prod-2', 'prod-1']);
  });

  it('moves existing ID to the front instead of duplicating', () => {
    trackProductView('prod-1');
    trackProductView('prod-2');
    trackProductView('prod-1');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toEqual(['prod-1', 'prod-2']);
  });

  it('limits to 10 items', () => {
    for (let i = 1; i <= 12; i++) {
      trackProductView(`prod-${i}`);
    }
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(10);
    expect(stored).toContain('prod-12');
    expect(stored).not.toContain('prod-1');
  });

  it('does not throw on corrupted localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    expect(() => trackProductView('prod-1')).not.toThrow();
  });
});

describe('RecentlyViewed Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockGetById.mockResolvedValue({
      data: { success: true, data: mockProduct() },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when no products viewed', async () => {
    renderWithProviders(<RecentlyViewed />);
    await waitFor(() => {
      expect(screen.queryByText('Recently Viewed')).toBeNull();
    });
  });

  it('renders section title and products when items exist', async () => {
    trackProductView('prod-1');

    renderWithProviders(<RecentlyViewed />);

    await waitFor(() => {
      expect(screen.getByText('Recently Viewed')).toBeDefined();
    });
    expect(mockGetById).toHaveBeenCalledWith('prod-1');
  });

  it('excludes current product from list', async () => {
    trackProductView('prod-1');
    trackProductView('prod-current');

    renderWithProviders(<RecentlyViewed currentProductId="prod-current" />);

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith('prod-1');
      expect(mockGetById).not.toHaveBeenCalledWith('prod-current');
    });
  });

  it('renders "View All" link to shop', async () => {
    trackProductView('prod-1');

    renderWithProviders(<RecentlyViewed />);

    await waitFor(() => {
      expect(screen.getByText('Recently Viewed')).toBeDefined();
    });

    const viewAllLink = screen.getByText('View All').closest('a');
    expect(viewAllLink?.getAttribute('href')).toBe('/shop');
  });

  it('handles API failure gracefully', async () => {
    trackProductView('prod-1');
    mockGetById.mockResolvedValue({
      data: { success: false },
    });

    renderWithProviders(<RecentlyViewed />);

    await waitFor(() => {
      expect(screen.queryByText('Recently Viewed')).toBeNull();
    });
  });

  it('renders product cards with correct key', async () => {
    trackProductView('prod-1');
    trackProductView('prod-2');

    mockGetById.mockImplementation((id) =>
      Promise.resolve({
        data: {
          success: true,
          data: mockProduct({ _id: id, name: `Product ${id}` }),
        },
      })
    );

    renderWithProviders(<RecentlyViewed />);

    await waitFor(() => {
      expect(screen.getByText('Product prod-1')).toBeDefined();
      expect(screen.getByText('Product prod-2')).toBeDefined();
    });
  });
});
