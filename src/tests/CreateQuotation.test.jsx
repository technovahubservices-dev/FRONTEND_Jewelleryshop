import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateQuotation from '../admin/pages/CreateQuotation';

const mockNavigate = vi.fn();

const mockData = vi.hoisted(() => ({
  MOCK_LOCAL_PRODUCTS: [
    { _id: '1', name: 'Test Product', sku: 'SKU001', metal: 'Gold', price: 10000 },
    { _id: '2', name: 'Another Product', sku: 'SKU002', metal: 'Silver', price: 5000 },
  ],
  MOCK_BACKEND_PRODUCT: {
    _id: '99',
    name: 'Backend Lookup Product',
    sku: 'SKU009',
    metal: 'Gold',
    purity: '22K',
    price: 25000,
    discountPrice: 0,
    category: 'Necklaces',
  },
  MOCK_BACKEND_PRODUCT_2: {
    _id: '100',
    name: 'Second Backend Product',
    sku: 'SKU010',
    metal: 'Silver',
    purity: 'Sterling Silver',
    price: 15000,
    discountPrice: 0,
    category: 'Earrings',
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  };
});

vi.mock('../services/api', () => ({
  productAPI: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: mockData.MOCK_LOCAL_PRODUCTS,
      },
    }),
    getBySku: vi.fn().mockImplementation((sku) => {
      if (sku === 'SKU009') {
        return Promise.resolve({ data: { success: true, data: mockData.MOCK_BACKEND_PRODUCT } });
      }
      if (sku === 'SKU010') {
        return Promise.resolve({ data: { success: true, data: mockData.MOCK_BACKEND_PRODUCT_2 } });
      }
      return Promise.reject(new Error('Not found'));
    }),
    transform: (p) => ({
      id: p._id,
      name: p.name,
      SKU: p.sku,
      price: p.discountPrice > 0 ? p.discountPrice : p.price,
      metal: p.metal || '',
    }),
  },
  quotationAPI: {
    create: vi.fn().mockResolvedValue({ data: { success: true, data: { _id: 'q1', quotationNumber: 'QT-2026-101' } } }),
    update: vi.fn().mockResolvedValue({ data: { success: true, data: { _id: 'q1' } } }),
  },
}));

import { productAPI, quotationAPI } from '../services/api';

const addProductItemAndWait = async (container) => {
  await waitFor(() => {
    expect(screen.getByText('Add Product')).toBeDefined();
  });
  fireEvent.click(screen.getByText('Add Product'));
  await waitFor(() => {
    const options = container.querySelectorAll('select option');
    expect(options.length).toBeGreaterThan(1);
  });
};

const getSkuInput = (container) => {
  return container.querySelector('input[type="text"][placeholder="Auto-filled"]');
};

const getPriceInput = (container) => {
  return container.querySelector('input[type="number"][placeholder="Auto-filled"]');
};

const getDiscountInput = (container) => {
  return container.querySelector('input[type="number"][placeholder="0"]');
};

const getQtyInput = (container) => {
  return container.querySelector('input[type="number"]:not([placeholder="0"]):not([placeholder="Auto-filled"]):not([placeholder="18"])');
};

const getProductSelect = (container) => {
  return container.querySelector('select');
};

const getLastItemPriceInput = () => {
  const priceInputs = document.querySelectorAll('input[type="number"][placeholder="Auto-filled"]');
  return priceInputs[priceInputs.length - 1];
};

const getLastItemSkuInput = (container) => {
  const skuInputs = container.querySelectorAll('input[type="text"][placeholder="Auto-filled"]');
  return skuInputs[skuInputs.length - 1];
};

describe('Admin Create Quotation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    productAPI.getAll.mockClear();
    productAPI.getBySku.mockClear();
    quotationAPI.create.mockClear();
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

  /* =====================================================
   * SKU Lookup Tests
   * ===================================================== */

  describe('SKU Lookup', () => {
    it('auto-populates product details when a valid SKU is entered', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'SKU009' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(productAPI.getBySku).toHaveBeenCalledWith('SKU009');
      });

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('25000');
      });

      const skuInput = getLastItemSkuInput(container);
      expect(skuInput.value).toBe('SKU009');
    });

    it('shows validation message and clears stale data for invalid SKU', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'SKU009' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('25000');
      });

      const input2 = getLastItemSkuInput(container);
      fireEvent.change(input2, { target: { value: 'INVALIDSKU' } });
      fireEvent.blur(input2);

      await waitFor(() => {
        expect(screen.getByText('SKU not found. Please check the SKU and try again.')).toBeDefined();
      });

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('0');
      });
    });

    it('clears stale product data when an invalid SKU is entered', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'SKU009' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('25000');
      });

      const input2 = getLastItemSkuInput(container);
      fireEvent.change(input2, { target: { value: 'INVALID999' } });
      fireEvent.blur(input2);

      await waitFor(() => {
        expect(screen.getByText(/SKU not found/)).toBeDefined();
      });

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('0');
      });
    });

    it('changes from one SKU to another and updates product details', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'SKU009' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('25000');
      });

      await waitFor(() => {
        expect(productAPI.getBySku).toHaveBeenCalledWith('SKU009');
      });

      const input2 = getLastItemSkuInput(container);
      fireEvent.change(input2, { target: { value: 'SKU010' } });
      fireEvent.blur(input2);

      await waitFor(() => {
        expect(productAPI.getBySku).toHaveBeenCalledWith('SKU010');
      });

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('15000');
      });
    });

    it('clears SKU error when a valid SKU is subsequently entered', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'INVALID' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/SKU not found/)).toBeDefined();
      });

      const input2 = getLastItemSkuInput(container);
      fireEvent.change(input2, { target: { value: 'SKU009' } });
      fireEvent.blur(input2);

      await waitFor(() => {
        expect(screen.queryByText(/SKU not found/)).toBeNull();
      });

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('25000');
      });
    });

    it('still auto-fills product details for SKUs found in locally loaded products', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const select = getProductSelect(container);
      expect(select).toBeTruthy();

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'SKU001' } });

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('10000');
      });

      const skuInput = getLastItemSkuInput(container);
      expect(skuInput.value).toBe('SKU001');
    });
  });

  /* =====================================================
   * Editable Fields Tests
   * ===================================================== */

  describe('Quotation Fields Editable After SKU Lookup', () => {
    it('allows editing qty, price, discount, and GST after auto-population', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'SKU009' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('25000');
      });

      const qtyInput = getQtyInput(container);
      fireEvent.change(qtyInput, { target: { value: '3' } });
      expect(qtyInput.value).toBe('3');

      const priceInput = getLastItemPriceInput();
      fireEvent.change(priceInput, { target: { value: '22000' } });
      expect(priceInput.value).toBe('22000');

      const discountInput = getDiscountInput(container);
      fireEvent.change(discountInput, { target: { value: '500' } });
      expect(discountInput.value).toBe('500');

      const gstInputs = container.querySelectorAll('input[type="number"][placeholder="18"]');
      const gstInput = gstInputs[gstInputs.length - 1];
      fireEvent.change(gstInput, { target: { value: '12' } });
      expect(gstInput.value).toBe('12');
    });
  });

  /* =====================================================
   * General Product Search Tests
   * ===================================================== */

  describe('General Product Search (Dropdown)', () => {
    it('still allows selecting products from the dropdown', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const select = getProductSelect(container);
      fireEvent.change(select, { target: { value: '1' } });

      await waitFor(() => {
        const select2 = getProductSelect(container);
        expect(select2.value).toBe('1');
      });

      expect(getLastItemPriceInput().value).toBe('10000');
    });
  });

  /* =====================================================
   * Quotation Payload Tests
   * ===================================================== */

  describe('Quotation Payload', () => {
    it('generates correct quotation payload after SKU lookup', async () => {
      const { container } = render(
        <BrowserRouter>
          <CreateQuotation />
        </BrowserRouter>
      );

      await addProductItemAndWait(container);

      const input = getLastItemSkuInput(container);
      fireEvent.change(input, { target: { value: 'SKU009' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(getLastItemPriceInput().value).toBe('25000');
      });

      const qtyInput = getQtyInput(container);
      fireEvent.change(qtyInput, { target: { value: '2' } });

      const saveButton = screen.getByText('Save Quotation');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(quotationAPI.create).toHaveBeenCalled();
        const callArgs = quotationAPI.create.mock.calls[0][0];
        expect(callArgs.items).toBeDefined();
        expect(callArgs.items[0].sku).toBe('SKU009');
        expect(callArgs.items[0].productName).toBe('Backend Lookup Product');
        expect(callArgs.items[0].price).toBe(25000);
        expect(callArgs.items[0].qty).toBe(2);
      });
    });
  });
});
