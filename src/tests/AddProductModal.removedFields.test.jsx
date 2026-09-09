import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProductModal from '../admin/components/AddProductModal';

vi.mock('../services/api', () => ({
  productAPI: {
    getAll: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    create: vi.fn(() => Promise.resolve({ data: { success: true, data: { _id: 'newid' } } })),
    update: vi.fn(() => Promise.resolve({ data: { success: true, data: { _id: 'x' } } })),
  },
  categoryAPI: {
    getAll: vi.fn(() => Promise.resolve({ data: { success: true, data: [] } })),
  },
}));

const FORBIDDEN_LABELS = [
  'Purity',
  'Weight',
  'Stone Weight',
  'Stone Shape',
  'Stone Clarity',
  'Stone Color',
  'Tags',
];

const REQUIRED_LABELS = [
  'Product Name',
  'SKU',
  'Category',
  'Metal',
  'Price',
  'Discount Price',
  'Stock Quantity',
  'Status',
  'Subcategory',
  'Description',
  'Product Images',
  'Collection',
  'Occasion',
];

const labelStartsWith = (text) => {
  const labels = Array.from(document.querySelectorAll('label'));
  return labels.some((l) => {
    const t = l.textContent.trim();
    const stripped = t.replace(/\s*\*\s*(\([^)]*\))?$/, '').trim();
    return stripped === text || t.startsWith(text);
  });
};

const renderModal = (props = {}) => render(
  <AddProductModal isOpen onClose={() => {}} onSaved={() => {}} {...props} />
);

describe('Add New Jewellery Product — removed fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does NOT render any of the 7 removed fields in the Add modal', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Add New Jewellery Product')).toBeInTheDocument();
    });
    for (const label of FORBIDDEN_LABELS) {
      expect(labelStartsWith(label), `Field "${label}" should be removed but is still rendered as a <label>`).toBe(false);
    }
  });

  it('does NOT render any of the 7 removed fields in the Edit modal', async () => {
    const product = {
      _id: 'p1',
      name: 'Test',
      sku: 'X-1',
      category: 'Rings',
      subcategory: 'Cocktail Rings',
      metal: 'Gold',
      price: 1000,
      stock: 1,
      images: [],
    };
    renderModal({ product });
    await waitFor(() => {
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });
    for (const label of FORBIDDEN_LABELS) {
      expect(labelStartsWith(label), `Field "${label}" should be removed in Edit but is still rendered`).toBe(false);
    }
  });

  it('KEEPS all required fields including Subcategory, Collection, Occasion', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Add New Jewellery Product')).toBeInTheDocument();
    });
    for (const label of REQUIRED_LABELS) {
      expect(labelStartsWith(label), `Required field "${label}" must be present`).toBe(true);
    }
  });

  it('API payload does not include any of the 7 removed field keys', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Add New Jewellery Product')).toBeInTheDocument();
    });

    const inputs = Array.from(document.querySelectorAll('form input, form select, form textarea'));
    const inputNames = inputs.map((el) => el.getAttribute('name')).filter(Boolean);

    const forbiddenKeys = [
      'jewelleryCollection', 'purity', 'weight',
      'diamondWeight', 'diamondShape', 'diamondClarity', 'diamondColor',
      'tags',
      'stoneWeight', 'stoneShape', 'stoneClarity', 'stoneColor',
    ];
    for (const key of forbiddenKeys) {
      expect(inputNames, `Modal must not contain input/select with name="${key}"`).not.toContain(key);
    }
  });
});
