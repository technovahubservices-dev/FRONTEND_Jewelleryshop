import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Shop from '../pages/Shop';
import { AuthProvider } from '../context/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return {
    ...actual,
    productAPI: {
      getAll: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: [],
        },
      }),
      transform: actual.productAPI.transform,
    },
    categoryAPI: {
      getAll: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: [],
        },
      }),
    },
    contentAPI: {
      getActive: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: [],
        },
      }),
    },
  };
});

vi.mock('../components/products/ProductCard', () => ({
  default: ({ product }) => <div data-testid="product-card">{product.name}</div>,
}));

describe('Shop Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders shop heading', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Shop />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Fine Jewellery Collection')).toBeDefined();
    });
  });

  it('renders no products found state when no products match filters', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Shop />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Jewellery Found')).toBeDefined();
    });
  });
});
