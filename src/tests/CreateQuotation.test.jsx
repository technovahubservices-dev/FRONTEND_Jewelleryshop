import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateQuotation from '../admin/pages/CreateQuotation';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  };
});

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual('../../services/api');
  return {
    ...actual,
    productAPI: {
      getAll: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: [
            { _id: '1', name: 'Test Product', sku: 'SKU001', metal: 'Gold', price: 10000 },
          ],
        },
      }),
    },
    quotationAPI: {
      create: vi.fn().mockResolvedValue({ data: { success: true, data: { _id: 'q1' } } }),
      update: vi.fn().mockResolvedValue({ data: { success: true, data: { _id: 'q1' } } }),
    },
  };
});

describe('Admin Create Quotation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders quotation form', async () => {
    render(
      <BrowserRouter>
        <CreateQuotation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create Quotation')).toBeDefined();
    });
  });

  it('shows customer details section', async () => {
    render(
      <BrowserRouter>
        <CreateQuotation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Customer Details')).toBeDefined();
    });
  });
});
