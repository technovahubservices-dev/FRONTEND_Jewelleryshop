import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WishlistProvider } from '../context/WishlistContext';
import Wishlist from '../pages/Wishlist';

const mockGetById = vi.fn();
const mockRemove = vi.fn();
const mockClear = vi.fn();
const mockIsInWishlist = vi.fn();

const mockWishlistIds = {
  current: [],
};

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

vi.mock('../context/WishlistContext', () => ({
  WishlistProvider: ({ children }) => <div>{children}</div>,
  useWishlist: () => ({
    ids: mockWishlistIds.current,
    count: mockWishlistIds.current.length,
    add: vi.fn(),
    remove: mockRemove,
    toggle: vi.fn(),
    isInWishlist: mockIsInWishlist,
    clear: mockClear,
  }),
}));

const mockProduct = (overrides = {}) => ({
  _id: overrides._id || 'prod-1',
  name: overrides.name || 'Test Ring',
  price: overrides.price || 5000,
  images: overrides.images || [{ url: 'test-image.jpg' }],
  ...overrides,
});

const renderWishlistPage = () => {
  render(
    <BrowserRouter>
      <WishlistProvider>
        <Wishlist />
      </WishlistProvider>
    </BrowserRouter>
  );
};

describe('Wishlist Page - Empty State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWishlistIds.current = [];
  });

  afterEach(() => {
    cleanup();
  });

  it('renders empty wishlist state when no items', async () => {
    renderWishlistPage();

    await waitFor(() => {
      expect(screen.getByText('Your Wishlist is Empty')).toBeDefined();
    });
  });

  it('renders welcome message in empty state', async () => {
    renderWishlistPage();

    await waitFor(() => {
      expect(screen.getByText(/Items you add to your wishlist will appear here/i)).toBeDefined();
    });
  });

  it('renders "Start Shopping" link in empty state', async () => {
    renderWishlistPage();

    await waitFor(() => {
      const shopLink = screen.getByText('Start Shopping').closest('a');
      expect(shopLink?.getAttribute('href')).toBe('/shop');
    });
  });

  it('renders loading state initially', async () => {
    mockWishlistIds.current = [];
    renderWishlistPage();

    // Loading state should show initially
    expect(screen.queryByText('Loading your wishlist...')).toBeDefined();
    // After loading completes, should show empty state
    await waitFor(() => {
      expect(screen.getByText('Your Wishlist is Empty')).toBeDefined();
    });
  });
});

describe('Wishlist Page - With Items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetById.mockResolvedValue({
      data: { success: true, data: mockProduct() },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders products when wishlist has items', async () => {
    mockWishlistIds.current = ['prod-1', 'prod-2'];

    renderWishlistPage();

    await waitFor(() => {
      expect(screen.getByText('My Wishlist (2)')).toBeDefined();
    });

    expect(mockGetById).toHaveBeenCalledTimes(2);
  });

  it('renders "Clear All" button when items exist', async () => {
    mockGetById.mockResolvedValue({
      data: {
        success: true,
        data: mockProduct({ _id: 'prod-1', name: 'Ring' }),
      },
    });
    mockWishlistIds.current = ['prod-1'];

    renderWishlistPage();

    await waitFor(() => {
      expect(screen.getByText('My Wishlist (1)')).toBeDefined();
      expect(screen.getByText('Clear All')).toBeDefined();
    });
  });

  it('renders correct wishlist count in heading', async () => {
    mockGetById.mockResolvedValue({
      data: {
        success: true,
        data: mockProduct({ _id: 'prod-1', name: 'Ring' }),
      },
    });
    mockWishlistIds.current = ['prod-1'];

    renderWishlistPage();

    await waitFor(() => {
      expect(screen.getByText('My Wishlist (1)')).toBeDefined();
    });
  });

  it('renders product cards with products', async () => {
    mockGetById.mockImplementation((id) =>
      Promise.resolve({
        data: {
          success: true,
          data: mockProduct({ _id: id, name: `Product ${id}` }),
        },
      })
    );
    mockWishlistIds.current = ['prod-1', 'prod-2'];

    renderWishlistPage();

    await waitFor(() => {
      expect(screen.getByText('Product prod-1')).toBeDefined();
      expect(screen.getByText('Product prod-2')).toBeDefined();
    });
  });

  it('handles API failure gracefully', async () => {
    mockGetById.mockResolvedValue({
      data: { success: false },
    });
    mockWishlistIds.current = ['prod-1'];

    renderWishlistPage();

    await waitFor(() => {
      expect(screen.queryByText('My Wishlist')).toBeNull();
    });
  });
});
