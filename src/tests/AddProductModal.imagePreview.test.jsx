import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProductModal from '../admin/components/AddProductModal';

vi.mock('../services/api', () => ({
  productAPI: {
    getAll: vi.fn(() => Promise.resolve({ data: { data: [] } })),
    create: vi.fn(() => Promise.resolve({ data: { success: true, data: { _id: 'newid', images: ['https://placehold.co/400x400'] } } })),
    update: vi.fn(() => Promise.resolve({ data: { success: true, data: { _id: 'x', images: ['https://placehold.co/400x400'] } } })),
  },
  categoryAPI: {
    getAll: vi.fn(() => Promise.resolve({ data: { success: true, data: [
      { _id: 'cat1', name: 'Rings', slug: 'rings', isActive: true },
      { _id: 'cat2', name: 'Necklaces', slug: 'necklaces', isActive: true },
    ] } })),
  },
}));

const renderModal = (props = {}) => render(
  <AddProductModal isOpen={true} onClose={() => {}} onSaved={() => {}} {...props} />
);

describe('AddProductModal — image preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows image preview after selecting image files', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Add New Jewellery Product')).toBeInTheDocument();
    });

    const fileInput = document.getElementById('imageUpload');
    expect(fileInput).toBeInTheDocument();

    const file = new File(['dummy content'], 'test-image.jpg', {
      type: 'image/jpeg',
      lastModified: 0,
    });

    await fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const images = document.querySelectorAll('img[alt^="Product"]');
      expect(images.length).toBe(1);
      expect(images[0].src).toMatch(/^blob:/);
    });
  });

  it('shows image preview for existing image objects from API (edit product)', async () => {
    const product = {
      _id: 'p1',
      name: 'Test Product',
      sku: 'TEST-001',
      price: 1000,
      stock: 5,
      category: 'Rings',
      metal: 'Gold',
      images: [
        { url: 'https://example.com/image1.jpg', public_id: 'img1' },
        'https://example.com/image2.jpg',
      ],
    };

    renderModal({ product });
    await waitFor(() => {
      expect(screen.getByText('Edit Product')).toBeInTheDocument();
    });

    await waitFor(() => {
      const images = document.querySelectorAll('img[alt^="Product"]');
      expect(images.length).toBe(2);
      expect(images[0].src).toBe('https://example.com/image1.jpg');
      expect(images[1].src).toBe('https://example.com/image2.jpg');
    });
  });

  it('shows image preview after adding image URL', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText('Add New Jewellery Product')).toBeInTheDocument();
    });

    const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
    fireEvent.change(urlInput, { target: { value: 'https://example.com/my-product.jpg' } });

    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    await waitFor(() => {
      const images = document.querySelectorAll('img[alt^="Product"]');
      expect(images.length).toBe(1);
      expect(images[0].src).toBe('https://example.com/my-product.jpg');
    });
  });
});
