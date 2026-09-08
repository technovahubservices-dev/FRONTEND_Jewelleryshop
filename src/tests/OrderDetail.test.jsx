import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockGetById = vi.fn();
const mockDownloadInvoice = vi.fn();
const mockNavigate = vi.fn();
const mockUseParams = vi.fn().mockReturnValue({ orderId: 'order123' });

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock('../services/api', () => ({
  orderAPI: {
    getById: (...args) => mockGetById(...args),
    downloadInvoice: (...args) => mockDownloadInvoice(...args),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
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

import OrderDetail from '../pages/OrderDetail';

const mockOrder = {
  _id: 'order123',
  orderNumber: 'ORD-2025-000001',
  invoiceNumber: 'INV-2025-000001',
  items: [
    {
      name: 'Diamond Ring',
      image: 'test-image.jpg',
      quantity: 1,
      price: 10000,
      sku: 'RING-001',
      gst: 5,
    },
  ],
  itemsPrice: 10000,
  taxPrice: 500,
  shippingPrice: 0,
  discount: 0,
  totalPrice: 10500,
  status: 'new',
  paymentMethod: 'cod',
  paymentStatus: 'pending',
  shippingAddress: {
    fullName: 'Test User',
    phone: '1234567890',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  billingAddress: {
    fullName: 'Test User',
    address: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  user: {
    name: 'Test User',
    email: 'test@example.com',
  },
  createdAt: '2025-01-15T10:00:00Z',
  statusHistory: [
    {
      status: 'new',
      timestamp: '2025-01-15T10:00:00Z',
      note: 'Order placed',
    },
  ],
};

const renderOrderDetail = () => {
  render(
    <MemoryRouter initialEntries={['/account/orders/order123']}>
      <OrderDetail />
    </MemoryRouter>
  );
};

describe('OrderDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ orderId: 'order123' });
    mockGetById.mockResolvedValue({ data: { success: true, data: mockOrder } });
    mockDownloadInvoice.mockResolvedValue({
      data: new Blob(['fake-pdf'], { type: 'application/pdf' }),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders order heading with order number', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getAllByText('ORD-2025-000001').length).toBeGreaterThan(0);
    });
  });

  it('renders order details section', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Order Details')).toBeDefined();
    });
  });

  it('renders ordered products', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Ordered Products')).toBeDefined();
    });
  });

  it('renders product name', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getAllByText('Diamond Ring').length).toBeGreaterThan(0);
    });
  });

  it('renders product quantity', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText(/Qty: 1/)).toBeDefined();
    });
  });

  it('renders price summary section', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Price Summary')).toBeDefined();
    });
  });

  it('renders grand total', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('₹ 10,500')).toBeDefined();
    });
  });

  it('renders shipping address', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Shipping Address')).toBeDefined();
    });
  });

  it('renders customer information', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Customer Information')).toBeDefined();
    });
  });

  it('renders view invoice button', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('View Invoice')).toBeDefined();
    });
  });

  it('renders download invoice button', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Download Invoice')).toBeDefined();
    });
  });

  it('renders back to orders link', async () => {
    renderOrderDetail();

    await waitFor(() => {
      const link = screen.getByText('Back to Orders').closest('a');
      expect(link?.getAttribute('href')).toBe('/account/orders');
    });
  });

  it('renders order timeline section', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Order Timeline')).toBeDefined();
    });
  });

  it('renders status history entries', async () => {
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Order placed')).toBeDefined();
    });
  });

  it('renders cancelled state for cancelled orders', async () => {
    mockGetById.mockResolvedValue({
      data: {
        success: true,
        data: { ...mockOrder, status: 'cancelled', cancelledAt: '2025-01-20T10:00:00Z' },
      },
    });
    renderOrderDetail();

    await waitFor(() => {
      expect(screen.getByText('Order Cancelled')).toBeDefined();
    });
  });

  it('shows loading state initially', () => {
    mockGetById.mockImplementation(() => new Promise(() => {}));
    renderOrderDetail();

    expect(screen.getByText('Loading order details...')).toBeDefined();
  });
});
