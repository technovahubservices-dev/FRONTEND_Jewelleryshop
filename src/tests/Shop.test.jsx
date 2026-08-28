import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Shop from '../pages/Shop';
import { AuthProvider } from '../context/AuthContext';
import { WishlistProvider } from '../context/WishlistContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/CartContext', async () => {
  const actual = await vi.importActual('../context/CartContext');
  return {
    ...actual,
    useCart: () => ({
      cartItems: [],
      addToCart: vi.fn(),
      totalItems: 0,
      subtotal: 0,
    }),
  };
});

vi.mock('../context/WishlistContext', async () => {
  const actual = await vi.importActual('../context/WishlistContext');
  return {
    ...actual,
    useWishlist: () => ({
      isInWishlist: vi.fn(),
      addToWishlist: vi.fn(),
      removeFromWishlist: vi.fn(),
      wishlistItems: [],
    }),
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
    },
  };
});

describe('Shop Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders shop heading', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <WishlistProvider>
            <Shop />
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Fine Jewellery Collection')).toBeDefined();
    });
  });
});
