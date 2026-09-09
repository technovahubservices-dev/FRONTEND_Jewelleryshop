import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactEnquiries from '../admin/pages/ContactEnquiries';

const mockGetEnquiries = vi.fn();
const mockUpdateStatus = vi.fn();
const mockReply = vi.fn();
const mockGetStatuses = vi.fn();

vi.mock('../services/api', () => ({
  contactAPI: {
    getAll: (...args) => mockGetEnquiries(...args),
    updateStatus: (...args) => mockUpdateStatus(...args),
    reply: (...args) => mockReply(...args),
    getStatuses: (...args) => mockGetStatuses(...args),
    getStats: vi.fn(),
  },
}));

vi.mock('../utils/apiUrl', () => ({
  resolveImageUrl: vi.fn((url) => url || ''),
}));

vi.mock('../utils/formatters', () => ({
  formatDateTime: (v) => new Date(v).toLocaleString('en-US'),
  formatDate: (v) => new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
}));

const mockEnquiry = {
  _id: 'c1',
  name: 'Jane Smith',
  email: 'jane@test.com',
  phone: '+1234567890',
  subject: 'Product Inquiry',
  message: 'I would like to know more about your diamond rings.',
  status: 'new',
  isRead: false,
  adminNote: '',
  delivered: false,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
};

const mockEnquiriesResponse = {
  data: {
    success: true,
    data: [
      mockEnquiry,
      { ...mockEnquiry, _id: 'c2', name: 'Bob Wilson', email: 'bob@test.com', status: 'replied', isRead: true },
    ],
    total: 2,
    pages: 3,
    stats: { new: 1, read: 0, replied: 1, archived: 0 },
  },
};

const renderWithRouter = (initialEntries = ['/']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <ContactEnquiries />
    </MemoryRouter>
  );

describe('Contact Enquiries Page', () => {
  beforeEach(() => {
    mockGetEnquiries.mockReset();
    mockUpdateStatus.mockReset();
    mockReply.mockReset();
    mockGetStatuses.mockReset();
    mockGetStatuses.mockResolvedValue({ data: { success: true, data: [] } });
  });

  it('renders page heading', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Contact Us Enquiries')).toBeDefined();
    });
  });

  it('renders search input and filters', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by name, email, phone, or message...')).toBeDefined();
    });
  });

  it('renders status filter dropdown', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeDefined();
    });
  });

  it('renders enquiry list with name, email, status, and actions', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeDefined();
      expect(screen.getByText('jane@test.com')).toBeDefined();
    });
  });

  it('renders status badges for each enquiry', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getAllByText('New').length).toBeGreaterThan(0);
    });
  });

  it('opens detail modal when view button is clicked', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getAllByTitle('View Details').length).toBeGreaterThan(0);
    });
    const viewButton = screen.getAllByTitle('View Details')[0];
    await act(async () => {
      fireEvent.click(viewButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/Enquiry from Jane Smith/)).toBeDefined();
      expect(screen.getAllByText('I would like to know more about your diamond rings.').length).toBeGreaterThan(0);
    });
  });

  it('renders contact info, delivery info, and full message in modal', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getAllByTitle('View Details').length).toBeGreaterThan(0);
    });
    const viewButton = screen.getAllByTitle('View Details')[0];
    await act(async () => {
      fireEvent.click(viewButton);
    });
    await waitFor(() => {
      expect(screen.getByText('Contact Information')).toBeDefined();
      expect(screen.getByText('Delivery Information')).toBeDefined();
      expect(screen.getByText('Full Message')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Send Reply' })).toBeDefined();
    });
  });

  it('calls updateStatus when status button is clicked in modal', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    mockUpdateStatus.mockResolvedValue({ data: { success: true, data: { ...mockEnquiry, status: 'read' } } });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getAllByTitle('View Details').length).toBeGreaterThan(0);
    });
    const viewButton = screen.getAllByTitle('View Details')[0];
    await act(async () => {
      fireEvent.click(viewButton);
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Update Status' })).toBeDefined();
    });
    const readButton = screen.getByRole('button', { name: 'Read' });
    await act(async () => {
      fireEvent.click(readButton);
    });
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith('c1', { status: 'read' });
    });
  });

  it('sends reply via backend API when reply button is clicked', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    mockReply.mockResolvedValue({ data: { success: true, data: { ...mockEnquiry, status: 'replied' } } });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getAllByTitle('View Details').length).toBeGreaterThan(0);
    });
    const viewButton = screen.getAllByTitle('View Details')[0];
    await act(async () => {
      fireEvent.click(viewButton);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send Reply' })).toBeDefined();
    });
    const replyTextarea = screen.getByPlaceholderText('Type your reply message here...');
    await act(async () => {
      fireEvent.change(replyTextarea, { target: { value: 'Thank you for your inquiry.' } });
    });
    const sendButton = screen.getByRole('button', { name: 'Send Reply' });
    await act(async () => {
      fireEvent.click(sendButton);
    });
    await waitFor(() => {
      expect(mockReply).toHaveBeenCalledWith('c1', {
        replyMessage: 'Thank you for your inquiry.',
        subject: expect.stringContaining('Re:'),
      });
    });
  });

  it('renders pagination controls with page info', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText(/Showing/)).toBeDefined();
    });
  });

  it('navigates to next page correctly', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeDefined();
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Next'));
    });
    await waitFor(() => {
      expect(mockGetEnquiries).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });

  it('renders loading state initially', () => {
    mockGetEnquiries.mockImplementation(() => new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByText('Loading enquiries...')).toBeDefined();
  });

  it('renders empty state when no enquiries found', async () => {
    mockGetEnquiries.mockResolvedValue({
      data: { success: true, data: [], total: 0, pages: 1, stats: {} },
    });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('No customer enquiries yet.')).toBeDefined();
    });
  });

  it('renders error state on API failure', async () => {
    mockGetEnquiries.mockRejectedValue(new Error('Network error'));
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch enquiries')).toBeDefined();
      expect(screen.getByTitle('Refresh')).toBeDefined();
    });
  });

  it('updates search params when search input changes', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeDefined();
    });
    const searchInput = screen.getByPlaceholderText('Search by name, email, phone, or message...');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
    });
    await waitFor(() => {
      expect(mockGetEnquiries).toHaveBeenCalledWith(expect.objectContaining({ search: 'Jane' }));
    });
  });

  it('updates status filter when status dropdown changes', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeDefined();
    });
    const statusFilter = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(statusFilter, { target: { value: 'replied' } });
    });
    await waitFor(() => {
      expect(mockGetEnquiries).toHaveBeenCalledWith(expect.objectContaining({ status: 'replied' }));
    });
  });

  it('renders status counts in the header', async () => {
    mockGetEnquiries.mockResolvedValue(mockEnquiriesResponse);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeDefined();
    });
    expect(screen.getAllByText(/New:/).length).toBeGreaterThan(0);
  });
});
