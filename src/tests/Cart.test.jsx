import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from '../pages/Cart';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCartItems = [
  {
    id: '1',
    name: 'Test Product',
    price: 10000,
    quantity: 2,
    image: 'https://placehold.co/400x400',
    description: 'Test description',
    SKU: 'SKU001',
    metal: 'Gold',
  },
];

vi.mock('../context/CartContext', async () => {
  const actual = await vi.importActual('../context/CartContext');
  return {
    ...actual,
    useCart: () => ({
      cartItems: mockCartItems,
      updateQuantity: vi.fn(),
      removeFromCart: vi.fn(),
      totalItems: 2,
      subtotal: 20000,
      validationErrors: [],
      validateCart: vi.fn().mockResolvedValue({ valid: true }),
    }),
  };
});

describe('Cart Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders cart items', async () => {
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeDefined();
    });
  });
});
