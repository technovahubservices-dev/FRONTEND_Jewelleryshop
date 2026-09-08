import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const {
  mockGetOrders,
  mockNavigate,
} = vi.hoisted(() => ({
  mockGetOrders: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  orderAPI: {
    getAll: (...args) => mockGetOrders(...args),
    downloadInvoice: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
    logout: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  }),
}));

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [],
    itemCount: 0,
    subtotal: 0,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  }),
}));

vi.mock('../context/WishlistContext', () => ({
  useWishlist: () => ({
    ids: [],
    count: 0,
    add: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn(),
    isInWishlist: vi.fn().mockReturnValue(false),
    clear: vi.fn(),
  }),
  WishlistProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock('../utils/apiUrl', () => ({
  resolveImageUrl: vi.fn((url) => url || ''),
}));

vi.mock('../components/products/ProductCard', () => ({
  default: ({ product }) => <div data-testid="product-card">{product.name}</div>,
}));

import OrdersHistory from '../pages/OrdersHistory';

const renderOrdersHistory = () => {
  render(
    <MemoryRouter>
      <OrdersHistory />
    </MemoryRouter>
  );
};

const mockOrderData = {
  _id: 'order123',
  orderNumber: 'ORD-2025-000001',
  items: [
    {
      name: 'Diamond Ring',
      image: 'test-image.jpg',
      quantity: 1,
      price: 10000,
    },
  ],
  totalPrice: 10600,
  status: 'new',
  paymentMethod: 'cod',
  paymentStatus: 'pending',
  createdAt: '2025-01-15T10:00:00Z',
};

describe('OrdersHistory Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOrders.mockResolvedValue({ data: { success: true, data: [] } });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders heading', async () => {
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('My Orders', { selector: 'h1' })).toBeDefined();
    });
  });

  it('renders loading state initially', () => {
    mockGetOrders.mockImplementation(() => new Promise(() => {}));
    renderOrdersHistory();

    expect(screen.getByText('Loading orders...')).toBeDefined();
  });

  it('renders empty state when no orders', async () => {
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('No Orders Yet')).toBeDefined();
    });
  });

  it('renders "Start Shopping" link in empty state', async () => {
    renderOrdersHistory();

    await waitFor(() => {
      const link = screen.getByText('Start Shopping').closest('a');
      expect(link?.getAttribute('href')).toBe('/shop');
    });
  });

  it('renders order cards when orders exist', async () => {
    mockGetOrders.mockResolvedValue({ data: { success: true, data: [mockOrderData] } });
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('ORD-2025-000001')).toBeDefined();
    });
  });

  it('renders View Order link to order detail page', async () => {
    mockGetOrders.mockResolvedValue({ data: { success: true, data: [mockOrderData] } });
    renderOrdersHistory();

    await waitFor(() => {
      const viewOrderLink = screen.getByText('View Order').closest('a');
      expect(viewOrderLink?.getAttribute('href')).toBe('/account/orders/order123');
    });
  });

  it('renders Download Invoice button', async () => {
    mockGetOrders.mockResolvedValue({ data: { success: true, data: [mockOrderData] } });
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('Invoice')).toBeDefined();
    });
  });

  it('renders order status badge', async () => {
    mockGetOrders.mockResolvedValue({
      data: {
        success: true,
        data: [{ ...mockOrderData, status: 'delivered' }],
      },
    });
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('Delivered')).toBeDefined();
    });
  });

  it('renders total amount', async () => {
    mockGetOrders.mockResolvedValue({ data: { success: true, data: [mockOrderData] } });
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('₹ 10,600')).toBeDefined();
    });
  });

  it('renders error message on API failure', async () => {
    mockGetOrders.mockResolvedValue({ data: { success: false, message: 'Failed to fetch orders' } });
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch orders')).toBeDefined();
    });
  });

  it('renders payment status for non-COD orders', async () => {
    mockGetOrders.mockResolvedValue({
      data: {
        success: true,
        data: [{ ...mockOrderData, paymentMethod: 'card', paymentStatus: 'paid' }],
      },
    });
    renderOrdersHistory();

    await waitFor(() => {
      expect(screen.getByText('Paid')).toBeDefined();
    });
  });
});
