import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

const mockGetItem = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: {} }),
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { _id: 'u1', email: 'test@test.com' }, isAdmin: false }),
  AuthProvider: ({ children }) => children,
}));

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [],
    itemCount: 0,
    subtotal: 0,
    addItem: vi.fn(),
    clearCart: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
  }),
  CartProvider: ({ children }) => children,
}));

vi.mock('../context/WishlistContext', () => ({
  useWishlist: () => ({
    isInWishlist: vi.fn().mockReturnValue(false),
    toggle: vi.fn(),
    items: [],
  }),
  WishlistProvider: ({ children }) => children,
}));

vi.mock('../services/api', () => {
  const actualTransform = (p) => ({
    id: p._id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory || '',
    metal: p.metal || '',
    collection: p.collection || '',
    occasion: p.occasion || '',
    bridal: p.bridal || false,
    wedding: p.wedding || false,
    price: p.discountPrice > 0 ? p.discountPrice : p.price,
    originalPrice: p.price > 0 && p.discountPrice > 0 ? p.price : null,
    discount: p.discountPrice > 0 && p.price > 0
      ? `${Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF`
      : null,
    discountAmount: p.price > 0 && p.discountPrice > 0
      ? Math.round(p.price - p.discountPrice)
      : 0,
    isOnSale: p.discountPrice > 0 && p.price > 0,
    image:
      typeof p.primaryImage === 'string'
        ? p.primaryImage
        : p.primaryImage?.url ||
          (Array.isArray(p.images)
            ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)
            : '') ||
          'https://placehold.co/400x400',
    images: Array.isArray(p.images)
      ? p.images
          .map((img) => (typeof img === 'string' ? img : img?.url))
          .filter(Boolean)
      : [],
    video: p.video || '',
    description: p.description || '',
    fullDescription: p.description || '',
    isNew: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    isFeatured: p.isFeatured,
    SKU: p.sku,
    weight: p.weight || '',
    purity: p.purity || '',
    metalColor: p.metal || '',
    diamondWeight: p.diamondWeight || 'N/A',
    diamondShape: p.diamondShape || 'N/A',
    diamondClarity: p.diamondClarity || 'N/A',
    diamondColor: p.diamondColor || 'N/A',
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    status: p.status || 'active',
    tags: p.tags || [],
    slug: p.slug,
  });

  return {
    productAPI: {
      getAll: vi.fn(),
      getById: vi.fn(),
      getBySku: vi.fn(),
      transform: actualTransform,
    },
    categoryAPI: {
      getAll: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    },
    contentAPI: {
      getActive: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
      getHomepageSettings: vi.fn().mockResolvedValue({ data: { data: {} } }),
    },
  };
});

import { productAPI } from '../services/api';
import { calculateLineItem, hasAnyDiscount, parseNumber } from '../utils/formatters';

const BACKEND_PRODUCT = {
  _id: 'prod1',
  name: 'Elegant Gold Pendant',
  sku: 'SKU001',
  category: 'Necklaces',
  metal: 'Gold',
  price: 50000,
  discountPrice: 45000,
  stock: 10,
  status: 'active',
  primaryImage: 'https://example.com/image.jpg',
  images: ['https://example.com/image.jpg'],
  description: 'A beautiful gold pendant.',
  isFeatured: true,
  isBestSeller: false,
  isNewArrival: true,
};

const BACKEND_PRODUCT_NO_DISCOUNT = {
  _id: 'prod2',
  name: 'Silver Bangle',
  sku: 'SKU002',
  category: 'Bracelets',
  metal: 'Silver',
  price: 8500,
  discountPrice: 0,
  stock: 5,
  status: 'active',
  primaryImage: 'https://example.com/bangle.jpg',
  images: ['https://example.com/bangle.jpg'],
  description: 'A silver bangle.',
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
};

describe('Product Price Accuracy', () => {
  beforeEach(() => {
    productAPI.getAll.mockReset();
    productAPI.getById.mockReset();
    productAPI.getBySku.mockReset();
  });

  describe('productAPI.transform — authoritative price mapping', () => {
    it('returns discountPrice when discountPrice > 0', () => {
      const transformed = productAPI.transform(BACKEND_PRODUCT);
      expect(transformed.price).toBe(45000);
      expect(transformed.originalPrice).toBe(50000);
      expect(transformed.discount).toBe('10% OFF');
      expect(transformed.discountAmount).toBe(5000);
      expect(transformed.isOnSale).toBe(true);
    });

    it('returns regular price when no discount', () => {
      const transformed = productAPI.transform(BACKEND_PRODUCT_NO_DISCOUNT);
      expect(transformed.price).toBe(8500);
      expect(transformed.originalPrice).toBeNull();
      expect(transformed.discount).toBeNull();
      expect(transformed.discountAmount).toBe(0);
      expect(transformed.isOnSale).toBe(false);
    });

    it('uses backend price field as the single source of truth', () => {
      const customProduct = {
        _id: 'custom1',
        name: 'Custom Ring',
        sku: 'CUST001',
        category: 'Rings',
        price: 99999,
        discountPrice: 0,
        stock: 3,
        status: 'active',
        primaryImage: '',
        images: [],
        description: 'Custom product',
      };
      const transformed = productAPI.transform(customProduct);
      expect(transformed.price).toBe(99999);
    });
  });

  describe('ProductCard price rendering', () => {
    it('displays discounted price from backend transform', async () => {
      const transformed = productAPI.transform(BACKEND_PRODUCT);
      const ProductCard = (await import('../components/products/ProductCard')).default;

      render(
        <MemoryRouter>
          <ProductCard product={transformed} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('₹ 45,000')).toBeDefined();
        expect(screen.getByText('₹ 50,000')).toBeDefined();
        expect(screen.getByText('10% OFF')).toBeDefined();
      });
    });

    it('displays regular price when no discount from backend transform', async () => {
      const transformed = productAPI.transform(BACKEND_PRODUCT_NO_DISCOUNT);
      const ProductCard = (await import('../components/products/ProductCard')).default;

      render(
        <MemoryRouter>
          <ProductCard product={transformed} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('₹ 8,500')).toBeDefined();
      });
    });
  });

  describe('Product Details price display', () => {
    it('displays the actual saved backend price (discounted)', async () => {
      productAPI.getById.mockResolvedValue({
        data: { success: true, data: BACKEND_PRODUCT },
      });
      productAPI.getAll.mockResolvedValue({
        data: { success: true, data: [BACKEND_PRODUCT_NO_DISCOUNT] },
      });

      const ProductDetails = (await import('../pages/ProductDetails')).default;

      render(
        <MemoryRouter initialEntries={['/product/prod1']}>
          <ProductDetails />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('₹ 45,000')).toBeDefined();
        expect(screen.getByText('₹ 50,000')).toBeDefined();
        expect(screen.getByText('10% OFF')).toBeDefined();
      });
    });

    it('displays regular price when no discount from backend', async () => {
      productAPI.getById.mockResolvedValue({
        data: { success: true, data: BACKEND_PRODUCT_NO_DISCOUNT },
      });
      productAPI.getAll.mockResolvedValue({
        data: { success: true, data: [BACKEND_PRODUCT] },
      });

      const ProductDetails = (await import('../pages/ProductDetails')).default;

      render(
        <MemoryRouter initialEntries={['/product/prod2']}>
          <ProductDetails />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('₹ 8,500')).toBeDefined();
      });
    });
  });

  describe('Create Quotation price from backend', () => {
    it('receives backend price via SKU lookup', async () => {
      productAPI.getAll.mockResolvedValue({
        data: {
          success: true,
          data: [{ _id: 'local1', name: 'Local Product', sku: 'LOCAL001', price: 1000, discountPrice: 0, category: 'Rings' }],
        },
      });
      productAPI.getBySku.mockResolvedValue({
        data: { success: true, data: BACKEND_PRODUCT },
      });

      const CreateQuotation = (await import('../admin/pages/CreateQuotation')).default;
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Add Product')).toBeDefined();
      });

      fireEvent.click(screen.getByText('Add Product'));

      await waitFor(() => {
        const skuInput = container.querySelector('input[type="text"][placeholder="Auto-filled"]');
        expect(skuInput).toBeTruthy();
        fireEvent.change(skuInput, { target: { value: 'SKU001' } });
        fireEvent.blur(skuInput);
      });

      await waitFor(() => {
        expect(productAPI.getBySku).toHaveBeenCalledWith('SKU001');
      });

      await waitFor(() => {
        const priceInputs = container.querySelectorAll('input[type="number"][placeholder="Auto-filled"]');
        const lastPriceInput = priceInputs[priceInputs.length - 1];
        expect(lastPriceInput.value).toBe('45000');
      });
    });

    it('receives backend price when selecting from dropdown', async () => {
      productAPI.getAll.mockResolvedValue({
        data: { success: true, data: [BACKEND_PRODUCT, BACKEND_PRODUCT_NO_DISCOUNT] },
      });

      const CreateQuotation = (await import('../admin/pages/CreateQuotation')).default;
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Add Product')).toBeDefined();
      });

      fireEvent.click(screen.getByText('Add Product'));

      await waitFor(() => {
        const select = container.querySelector('select');
        expect(select).toBeTruthy();
      });

      const select = container.querySelector('select');
      fireEvent.change(select, { target: { value: 'prod1' } });

      await waitFor(() => {
        const priceInputs = container.querySelectorAll('input[type="number"][placeholder="Auto-filled"]');
        const lastPriceInput = priceInputs[priceInputs.length - 1];
        expect(lastPriceInput.value).toBe('45000');
      });
    });
  });

  describe('Discount and GST Calculations', () => {
    it('calculates line item with discount and GST correctly', () => {
      const item = { qty: 2, price: 45000, discount: 5000, gst: 18 };
      const result = calculateLineItem(item);

      expect(result.qty).toBe(2);
      expect(result.price).toBe(45000);
      expect(result.discountAmount).toBe(5000);
      expect(result.basePriceTotal).toBe(90000);
      expect(result.taxableValue).toBe(85000);
      expect(result.gstAmount).toBe(15300);
      expect(result.lineTotal).toBe(100300);
    });

    it('calculates line item without discount', () => {
      const item = { qty: 1, price: 8500, discount: 0, gst: 18 };
      const result = calculateLineItem(item);

      expect(result.basePriceTotal).toBe(8500);
      expect(result.taxableValue).toBe(8500);
      expect(result.gstAmount).toBe(1530);
      expect(result.lineTotal).toBe(10030);
    });

    it('hasAnyDiscount detects when discount > 0', () => {
      const items = [
        { discount: 0, price: 1000, qty: 1, gst: 18 },
        { discount: 500, price: 5000, qty: 2, gst: 18 },
      ];
      expect(hasAnyDiscount(items)).toBe(true);
    });

    it('hasAnyDiscount returns false when no discounts', () => {
      const items = [
        { discount: 0, price: 1000, qty: 1, gst: 18 },
        { discount: 0, price: 5000, qty: 2, gst: 18 },
      ];
      expect(hasAnyDiscount(items)).toBe(false);
    });

    it('parseNumber handles string prices correctly', () => {
      expect(parseNumber('45000')).toBe(45000);
      expect(parseNumber('45,000')).toBe(45000);
      expect(parseNumber(45000)).toBe(45000);
      expect(parseNumber('abc')).toBe(0);
    });
  });
});
