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
    getAll: vi.fn(() => Promise.resolve({ data: { success: true, data: [
      { _id: 'cat1', name: 'Rings', slug: 'rings', isActive: true },
      { _id: 'cat2', name: 'Necklaces', slug: 'necklaces', isActive: true },
    ] } })),
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

 describe('AddProductModal — Edit Product sync', () => {
   beforeEach(() => {
     vi.clearAllMocks();
   });

   it('populates form fields with product details when editing', async () => {
     const product = {
       _id: 'p1',
       name: 'Diamond Ring',
       sku: 'RING-001',
       description: 'A beautiful ring',
       price: 5000,
       discountPrice: 4500,
       stock: 10,
       category: 'Rings',
       subcategory: 'Engagement Rings',
       metal: 'Gold',
       collection: 'Heritage',
       occasion: 'Bridal',
       bridal: true,
       wedding: false,
       status: 'active',
       isFeatured: true,
       isBestSeller: false,
       isNewArrival: true,
       images: ['https://example.com/ring1.jpg', 'https://example.com/ring2.jpg'],
     };
     renderModal({ product });
     await waitFor(() => {
       expect(screen.getByText('Edit Product')).toBeInTheDocument();
     });

     expect(screen.getByDisplayValue('Diamond Ring')).toBeInTheDocument();
     expect(screen.getByDisplayValue('RING-001')).toBeInTheDocument();
     expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
     expect(screen.getByDisplayValue('4500')).toBeInTheDocument();
     expect(screen.getByDisplayValue('10')).toBeInTheDocument();
     expect(screen.getByDisplayValue('Engagement Rings')).toBeInTheDocument();
     expect(screen.getByDisplayValue('A beautiful ring')).toBeInTheDocument();

     const categorySelect = screen.getByDisplayValue('Rings');
     expect(categorySelect).toBeInTheDocument();

     const metalSelect = screen.getByDisplayValue('Gold');
     expect(metalSelect).toBeInTheDocument();

     const collectionSelect = screen.getByDisplayValue('Heritage');
     expect(collectionSelect).toBeInTheDocument();

     const occasionSelect = screen.getByDisplayValue('Bridal');
     expect(occasionSelect).toBeInTheDocument();

      const statusSelect = document.querySelector('select[name="status"]');
      expect(statusSelect).toBeInTheDocument();
      expect(statusSelect.value).toBe('active');

      const bridalCheckbox = document.querySelector('input[name="bridal"]');
     expect(bridalCheckbox).toBeChecked();

     const weddingCheckbox = document.querySelector('input[name="wedding"]');
     expect(weddingCheckbox).not.toBeChecked();

     const featuredCheckbox = document.querySelector('input[name="isFeatured"]');
     expect(featuredCheckbox).toBeChecked();

     const bestSellerCheckbox = document.querySelector('input[name="isBestSeller"]');
     expect(bestSellerCheckbox).not.toBeChecked();

     const newArrivalCheckbox = document.querySelector('input[name="isNewArrival"]');
     expect(newArrivalCheckbox).toBeChecked();

     const images = document.querySelectorAll('img[alt^="Product"]');
     expect(images.length).toBe(2);
   });

   it('updates form fields when switching to a different product while modal is open', async () => {
     const productA = {
       _id: 'p1',
       name: 'Ring A',
       sku: 'RING-A',
       price: 1000,
       stock: 5,
       category: 'Rings',
       metal: 'Gold',
       collection: 'Heritage',
       occasion: 'Bridal',
       status: 'active',
       images: ['https://example.com/ringA.jpg'],
     };
     const { rerender } = render(
       <AddProductModal isOpen onClose={() => {}} onSaved={() => {}} product={productA} />
     );
     await waitFor(() => {
       expect(screen.getByText('Edit Product')).toBeInTheDocument();
     });
     expect(screen.getByDisplayValue('Ring A')).toBeInTheDocument();
     expect(screen.getByDisplayValue('RING-A')).toBeInTheDocument();

     const productB = {
       _id: 'p2',
       name: 'Necklace B',
       sku: 'NECK-B',
       price: 3000,
       stock: 20,
       category: 'Necklaces',
       metal: 'Silver',
       collection: 'Eternal',
       occasion: 'Festive',
       status: 'inactive',
       images: ['https://example.com/neckB.jpg'],
     };
     rerender(<AddProductModal isOpen onClose={() => {}} onSaved={() => {}} product={productB} />);
     await waitFor(() => {
       expect(screen.getByDisplayValue('Necklace B')).toBeInTheDocument();
     });

     expect(screen.getByDisplayValue('NECK-B')).toBeInTheDocument();
     expect(screen.getByDisplayValue('3000')).toBeInTheDocument();
     expect(screen.getByDisplayValue('20')).toBeInTheDocument();
     expect(screen.getByDisplayValue('Necklaces')).toBeInTheDocument();
     expect(screen.getByDisplayValue('Silver')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Eternal')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Festive')).toBeInTheDocument();

      const statusSelect = document.querySelector('select[name="status"]');
      expect(statusSelect.value).toBe('inactive');
    });
 });
