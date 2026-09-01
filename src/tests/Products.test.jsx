import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../admin/pages/Products';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
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
            { _id: '1', name: 'Test Product', sku: 'SKU001', category: 'Rings', price: 10000, stock: 10, status: 'active' },
          ],
        },
      }),
      delete: vi.fn().mockResolvedValue({ data: { success: true } }),
    },
  };
});

describe('Admin Products Page', () => {
  it('renders products page heading', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product Management')).toBeDefined();
    });
  });

  it('renders add product button', async () => {
    render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Add New Product')).toBeDefined();
    });
  });
});
