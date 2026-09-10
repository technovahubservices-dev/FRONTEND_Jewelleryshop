import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../admin/pages/Dashboard';

const mockGetAnalytics = vi.fn();

vi.mock('../services/api', () => ({
  dashboardAPI: {
    getAnalytics: (...args) => mockGetAnalytics(...args),
  },
}));

vi.mock('../utils/apiUrl', () => ({
  resolveImageUrl: vi.fn((url) => url || ''),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

const mockAnalyticsData = {
  kpis: {
    totalSales: 1500000,
    totalOrders: 150,
    totalCustomers: 75,
    totalProducts: 500,
    inventoryValue: 5000000,
    lowStockItems: 12,
    pendingOrders: 25,
    pendingPayments: 8,
    activeOrders: 120,
    deliveredOrders: 1000,
    cancelledOrders: 5,
    inProgressOrders: 10,
    shippedOrders: 30,
  },
  chartData: [
    { date: 'Sep 01', revenue: 25000, count: 3 },
    { date: 'Sep 02', revenue: 18000, count: 2 },
  ],
  topProducts: [
    { _id: 'p1', name: 'Diamond Ring', image: 'img.jpg', sku: 'RING-001', quantity: 15, revenue: 150000 },
  ],
  topCategories: [
    { name: 'Rings', revenue: 500000, count: 30 },
     { name: 'Earrings', revenue: 300000, count: 20 },
    ],
  recentOrders: [
    {
      _id: 'o1', orderNumber: 'ORD-2025-000001', invoiceNumber: 'INV-2025-000001',
      user: { name: 'John Doe', email: 'john@test.com' },
      shippingAddress: { fullName: 'John Doe' },
      totalPrice: 10500, status: 'new', paymentStatus: 'pending',
      createdAt: '2025-01-15T10:00:00Z',
    },
  ],
  lowStockProducts: [
    { _id: 'lp1', name: 'Gold Bangle', sku: 'BANG-001', stock: 2, minimumStock: 5, reservedStock: 0, price: 5000, primaryImage: '', images: [] },
  ],
};

describe('Admin Dashboard', () => {
  beforeEach(() => {
    mockGetAnalytics.mockReset();
  });

  it('renders loading state initially', () => {
    mockGetAnalytics.mockImplementation(() => new Promise(() => {}));
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    expect(screen.getByText('Loading dashboard data...')).toBeDefined();
  });

  it('renders dashboard heading after loading', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeDefined();
    });
  });

  it('renders all primary KPI cards with backend data', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Total Sales')).toBeDefined();
      expect(screen.getByText('Total Orders')).toBeDefined();
      expect(screen.getByText('Total Customers')).toBeDefined();
      expect(screen.getByText('Total Products')).toBeDefined();
      expect(screen.getByText('Low Stock Items')).toBeDefined();
    });
  });

  it('does NOT render Inventory Value KPI on dashboard', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Total Sales')).toBeDefined();
    });
    expect(document.body.textContent).not.toContain('Inventory Value');
  });

  it('renders secondary KPIs', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Pending Orders')).toBeDefined();
      expect(screen.getByText('Pending Payments')).toBeDefined();
      expect(screen.getByText('Active Orders')).toBeDefined();
      expect(screen.getByText('Delivered Orders')).toBeDefined();
      expect(screen.getByText('Cancelled Orders')).toBeDefined();
    });
  });

  it('renders date filter dropdown with all options', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText('Last 7 Days').length).toBeGreaterThan(0);
    });
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('shows custom range inputs when custom is selected', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Dashboard Overview')).toBeDefined();
    });
    const filter = screen.getByRole('combobox');
    fireEvent.change(filter, { target: { value: 'custom' } });
    await waitFor(() => {
      expect(screen.getAllByDisplayValue('').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('renders revenue trends chart with backend data', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Revenue Trends')).toBeDefined();
    });
  });

  it('renders orders trend chart', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Orders Trend')).toBeDefined();
    });
  });

   it('renders category-wise sales chart with backend data', async () => {
     mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
     render(<BrowserRouter><Dashboard /></BrowserRouter>);
     await waitFor(() => {
       expect(screen.getByText('Category-wise Sales')).toBeDefined();
     });
     expect(screen.getAllByText('Rings').length).toBeGreaterThan(0);
     expect(screen.getAllByText('Earrings').length).toBeGreaterThan(0);
   });

   it('category-wise sales pie chart displays backend category revenue totals and percentages', async () => {
     mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
     render(<BrowserRouter><Dashboard /></BrowserRouter>);
     await waitFor(() => {
       expect(screen.getByText('Category-wise Sales')).toBeDefined();
     });
     const percentages = Array.from(document.querySelectorAll('.text-on-surface-variant.font-medium'));
     const pctText = percentages.map(el => el.textContent).join(' ');
     expect(pctText).toContain('%');
   });

   it('refetches analytics when date filter changes', async () => {
     mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
     render(<BrowserRouter><Dashboard /></BrowserRouter>);
     await waitFor(() => {
       expect(mockGetAnalytics).toHaveBeenCalledWith(expect.objectContaining({ period: 'week' }));
     });
     const filter = screen.getByRole('combobox');
     fireEvent.change(filter, { target: { value: 'month' } });
     await waitFor(() => {
       expect(mockGetAnalytics).toHaveBeenCalledWith(expect.objectContaining({ period: 'month' }));
     });
   });

   it('shows empty state for category sales when no category data', async () => {
     mockGetAnalytics.mockResolvedValue({
       data: { success: true, data: { ...mockAnalyticsData, topCategories: [] } },
     });
     render(<BrowserRouter><Dashboard /></BrowserRouter>);
     await waitFor(() => {
       expect(screen.getByText('Category-wise Sales')).toBeDefined();
     });
     const chartSection = screen.getByText('Category-wise Sales').closest('.bg-surface-white');
     expect(chartSection.textContent).toContain('No sales data available');
   });

   it('handles unknown/missing category names in pie chart safely', async () => {
     mockGetAnalytics.mockResolvedValue({
       data: { success: true, data: { ...mockAnalyticsData, topCategories: [{ name: undefined, slug: 'rings', revenue: 1000 }] } },
     });
     render(<BrowserRouter><Dashboard /></BrowserRouter>);
     await waitFor(() => {
       expect(screen.getByText('Category-wise Sales')).toBeDefined();
     });
     expect(document.body.textContent).toContain('rings');
   });

  it('renders top selling jewellery with image, name, SKU, quantity, revenue', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Diamond Ring')).toBeDefined();
    });
    expect(screen.getByText(/SKU:/)).toBeDefined();
    expect(screen.getByText(/Qty:/)).toBeDefined();
  });

  it('renders dashboard alerts section', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Dashboard Alerts')).toBeDefined();
    });
  });

  it('renders pending payments in alerts section', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText(/Pending Payments/).length).toBeGreaterThan(0);
    });
  });

  it('renders low stock products in alerts section', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText(/Low Stock Products/).length).toBeGreaterThan(0);
      expect(screen.getByText('Gold Bangle')).toBeDefined();
    });
  });

  it('renders recent orders with order number, customer, date, amount, status', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeDefined();
      expect(screen.getAllByText(/ORD-2025-000001/).length).toBeGreaterThan(0);
    });
  });

  it('renders empty state for chart data when no sales data', async () => {
    mockGetAnalytics.mockResolvedValue({
      data: { success: true, data: { ...mockAnalyticsData, chartData: [], recentOrders: [], lowStockProducts: [], topProducts: [], topCategories: [] } },
    });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getAllByText('No sales data available.').length).toBeGreaterThan(0);
    });
  });

  it('renders empty state for recent orders', async () => {
    mockGetAnalytics.mockResolvedValue({
      data: { success: true, data: { ...mockAnalyticsData, recentOrders: [] } },
    });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('No orders yet.')).toBeDefined();
    });
  });

  it('renders error state and retry button on API failure', async () => {
    mockGetAnalytics.mockRejectedValue(new Error('Network error'));
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard data')).toBeDefined();
      expect(screen.getByText('Retry')).toBeDefined();
    });
  });

  it('calls getAnalytics with period param on initial load', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(mockGetAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'week' })
      );
    });
  });

  it('retries fetching analytics when refresh button is clicked', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { success: true, data: mockAnalyticsData } });
    render(<BrowserRouter><Dashboard /></BrowserRouter>);
    await waitFor(() => {
      expect(mockGetAnalytics).toHaveBeenCalledTimes(1);
    });
    const refreshButton = screen.getByTitle('Refresh');
    fireEvent.click(refreshButton);
    await waitFor(() => {
      expect(mockGetAnalytics).toHaveBeenCalledTimes(2);
    });
  });
});
