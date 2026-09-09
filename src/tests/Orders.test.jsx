import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Orders from '../admin/pages/Orders';

const mockGetOrders = vi.fn();
const mockUpdateStatus = vi.fn();
const mockDelete = vi.fn();

vi.mock('../services/api', () => ({
  orderAPI: {
    getAll: (...args) => mockGetOrders(...args),
    updateStatus: (...args) => mockUpdateStatus(...args),
    delete: (...args) => mockDelete(...args),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAdmin: true, loading: false, user: null }),
}));

vi.mock('../utils/apiUrl', () => ({
  resolveImageUrl: vi.fn((url) => url || ''),
}));

vi.mock('../utils/formatters', () => ({
  formatCurrency: (v) => `₹ ${Number(v || 0).toLocaleString('en-IN')}`,
  formatDate: (v) => new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  formatDateTime: (v) => new Date(v).toLocaleString('en-US'),
}));

vi.mock('../utils/excelExport', () => ({
  exportToExcel: vi.fn(),
}));

const mockOrder = {
  _id: '65a1b2c3d4e5f6a7b8c9d0e1',
  orderNumber: 'ORD-2025-000001',
  invoiceNumber: 'INV-2025-000001',
  user: { name: 'John Doe', email: 'john@test.com' },
  shippingAddress: {
    fullName: 'John Doe',
    address: '123 Main St',
    city: 'NYC',
    state: 'NY',
    phone: '+1234567890',
    pincode: '10001',
  },
  items: [
    { name: 'Diamond Ring', image: 'img.jpg', quantity: 1, price: 10500 },
  ],
  itemsPrice: 10000,
  taxPrice: 500,
  shippingPrice: 0,
  totalPrice: 10500,
  status: 'new',
  paymentStatus: 'pending',
  shippingStatus: 'not_shipped',
  paymentMethod: 'cod',
  createdAt: '2025-01-15T10:00:00Z',
  trackingNumber: 'TRK123',
  statusHistory: [
    { status: 'new', timestamp: '2025-01-15T10:00:00Z' },
  ],
};

const mockOrdersResponse = {
  data: {
    success: true,
    data: [
      mockOrder,
      {
        ...mockOrder,
        _id: '65a1b2c3d4e5f6a7b8c9d0e2',
        orderNumber: 'ORD-2025-000002',
        user: { name: 'Jane Smith', email: 'jane@test.com' },
        status: 'delivered',
        paymentStatus: 'paid',
        shippingStatus: 'delivered',
      },
    ],
    pagination: { currentPage: 1, totalPages: 3, total: 50, limit: 10 },
  },
};

describe('Orders Page', () => {
  beforeEach(() => {
    mockGetOrders.mockReset();
    mockUpdateStatus.mockReset();
    mockDelete.mockReset();
  });

  it('renders page heading', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeDefined();
      expect(screen.getByText('Manage customer orders, track shipments, and view order history.')).toBeDefined();
    });
  });

  it('renders search input', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by Order ID or Customer...')).toBeDefined();
    });
  });

  it('renders status filter dropdown', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeDefined();
    });
  });

  it('renders order list with customer name, status, amount', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    });
  });

  it('renders status badges for each order', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText('New').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
    });
  });

  it('opens order detail modal when view button is clicked', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByTitle('View Details').length).toBeGreaterThan(0);
    });
    const viewButtons = screen.getAllByTitle('View Details');
    fireEvent.click(viewButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/Order #/)).toBeDefined();
      expect(screen.getByText('Customer Details')).toBeDefined();
      expect(screen.getByText('Product Details')).toBeDefined();
    });
  });

  it('renders customer details in order modal', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByTitle('View Details').length).toBeGreaterThan(0);
    });
    const viewButtons = screen.getAllByTitle('View Details');
    fireEvent.click(viewButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('john@test.com')).toBeDefined();
      expect(screen.getByText('Payment Details')).toBeDefined();
      expect(screen.getByText('Shipping Details')).toBeDefined();
    });
  });

  it('updates order status from detail modal', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    mockUpdateStatus.mockResolvedValue({ data: { success: true, data: { ...mockOrder, status: 'confirmed' } } });
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByTitle('View Details').length).toBeGreaterThan(0);
    });
    const viewButtons = screen.getAllByTitle('View Details');
    fireEvent.click(viewButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Update Order')).toBeDefined();
    });
    const statusSelect = screen.getByDisplayValue('New');
    fireEvent.change(statusSelect, { target: { value: 'confirmed' } });
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalled();
    });
  });

  it('filters orders by status client-side', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });
    const statusFilter = screen.getByRole('combobox');
    fireEvent.change(statusFilter, { target: { value: 'delivered' } });
    expect(screen.queryAllByText('John Doe').length).toBe(0);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
  });

  it('filters orders by search term client-side', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });
    const searchInput = screen.getByPlaceholderText('Search by Order ID or Customer...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    expect(screen.queryAllByText('John Doe').length).toBe(0);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
  });

  it('renders loading state initially', () => {
    mockGetOrders.mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><Orders /></BrowserRouter>);
    expect(screen.getByText('Loading orders...')).toBeDefined();
  });

  it('renders empty state when no orders found', async () => {
    mockGetOrders.mockResolvedValue({
      data: { success: true, data: [], pagination: { currentPage: 1, totalPages: 0, total: 0, limit: 10 } },
    });
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('No orders found.')).toBeDefined();
    });
  });

  it('renders error state on API failure', async () => {
    mockGetOrders.mockRejectedValue(new Error('Network error'));
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch orders')).toBeDefined();
    });
  });

  it('renders export button', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByTitle('Download Excel')).toBeDefined();
    });
  });

  it('opens delete confirmation modal when delete is clicked', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByTitle('Delete Order').length).toBeGreaterThan(0);
    });
    const deleteButtons = screen.getAllByTitle('Delete Order');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeDefined();
    });
  });

  it('deletes order when delete confirmed', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    mockDelete.mockResolvedValue({ data: { success: true } });
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByTitle('Delete Order').length).toBeGreaterThan(0);
    });
    const deleteButtons = screen.getAllByTitle('Delete Order');
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeDefined();
    });
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('65a1b2c3d4e5f6a7b8c9d0e1');
    });
  });

  it('calls getAll with no params on initial load', async () => {
    mockGetOrders.mockResolvedValue(mockOrdersResponse);
    render(<BrowserRouter><Orders /></BrowserRouter>);
    await waitFor(() => {
      expect(mockGetOrders).toHaveBeenCalledWith();
    });
  });
});
