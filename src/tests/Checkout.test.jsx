import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../pages/Checkout';

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
      cartItems: [
        {
          id: '1',
          name: 'Test Product',
          price: 10000,
          quantity: 2,
          image: 'https://placehold.co/400x400',
        },
      ],
      subtotal: 20000,
      finalTotal: 20000,
      couponDiscount: 0,
      appliedCoupon: null,
      placeOrder: vi.fn(),
      validateCart: vi.fn().mockResolvedValue({ valid: true }),
    }),
  };
});

vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { name: 'Test User', email: 'test@test.com' },
    }),
  };
});

describe('Checkout Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders checkout form', async () => {
    render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Shipping Address')).toBeDefined();
    });
  });

  it('shows payment method options', async () => {
    render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cash on Delivery')).toBeDefined();
      expect(screen.getByText('Card / UPI / Net Banking')).toBeDefined();
    });
  });
});
