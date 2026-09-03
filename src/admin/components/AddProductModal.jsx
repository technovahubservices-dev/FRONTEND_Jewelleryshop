import { useState, useEffect, useCallback } from 'react';
import { productAPI, categoryAPI } from '../../services/api';

const METALS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'];
const SUBCATEGORIES = [
  'Engagement Rings',
  'Wedding Bands',
  'Cocktail Rings',
  'Promise Rings',
  'Diamond Necklaces',
  'Gold Chains',
  'Pendant Sets',
  'Diamond Earrings',
  'Gold Earrings',
  'Hoop Earrings',
  'Stud Earrings',
  'Bracelets',
  'Bangles',
  'Cuffs',
  'Chain Bracelets',
];
const STATUS_OPTIONS = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Disabled' }, { value: 'draft', label: 'Draft' }];
const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const initialFormState = {
  name: '',
  sku: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  category: '',
  subcategory: '',
  metal: '',
  status: 'active',
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
};

export default function AddProductModal({ isOpen, onClose, product = null, onSaved }) {
  const isEdit = !!product;

  const [formData, setFormData] = useState(
    isEdit
      ? {
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          price: product.price || '',
          discountPrice: product.discountPrice || '',
          stock: product.stock || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          metal: product.metal || '',
          status: product.status || 'active',
          isFeatured: product.isFeatured || false,
          isBestSeller: product.isBestSeller || false,
          isNewArrival: product.isNewArrival || false,
        }
      : { ...initialFormState }
  );

  const [imageState, setImageState] = useState({
    files: [],
    existingImages: product ? [...(product.images || [])] : [],
    previews: [],
    primaryIndex: 0,
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [skuLoading, setSkuLoading] = useState(false);
  const [existingSkus, setExistingSkus] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        if (response.data.success) {
          setCategories(response.data.data.filter(c => c.isActive) || []);
        }
      } catch (err) {
        // Silently fail — category dropdown will show the select with empty options
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Cache existing SKUs once per modal session so we can validate the SKU
    // field against duplicates on demand without a round-trip per keystroke.
    const fetchExistingSkus = async () => {
      try {
        const response = await productAPI.getAll({ limit: 1000 });
        const items = response.data.data || [];
        const currentId = product?._id || product?.id;
        const skus = items
          .map((p) => p.sku)
          .filter((s) => typeof s === 'string' && s.trim().length > 0);
        // Build a map of SKU -> owning product id so we can allow the
        // current product to keep its existing SKU during edits.
        const skuMap = {};
        items.forEach((p) => {
          if (p.sku && typeof p.sku === 'string') {
            const id = p._id || p.id;
            skuMap[p.sku.toLowerCase()] = id;
          }
        });
        setExistingSkus({
          list: skus,
          map: skuMap,
          currentProductId: currentId ? String(currentId) : null,
        });
      } catch (err) {
        setExistingSkus({ list: [], map: {}, currentProductId: null });
      }
    };
    if (isOpen) {
      fetchExistingSkus();
    }
  }, [isOpen, product]);

  const generateSkuPrefix = useCallback((name, category, metal) => {
    const metalMap = {
      Gold: 'GOLD',
      Silver: 'SILV',
      Platinum: 'PLAT',
      'Rose Gold': 'RPG',
      'White Gold': 'WGLD',
    };

    const categoryMap = {
      Rings: 'RNG',
      Necklaces: 'NEC',
      Earrings: 'ERG',
      Bracelets: 'BRC',
      Bangles: 'BNG',
      Chains: 'CHN',
      Sets: 'SET',
    };

    const metalCode = metalMap[metal] || 'PRD';
    const categoryCode = categoryMap[category] || 'PRD';

    return `${metalCode}-${categoryCode}`;
  }, []);

  const autoGenerateSku = useCallback(async (name, category, metal) => {
    if (isEdit) return;
    if (!name || !category) return;

    setSkuLoading(true);
    const prefix = generateSkuPrefix(name, category, metal);
    try {
      let allItems = [];
      // Prefer the cached product list; fall back to a fresh API call if
      // the cache has not loaded yet.
      if (Array.isArray(existingSkus?.list)) {
        // We need full items (not just SKUs), so do a focused fetch anyway.
      }
      try {
        const broad = await productAPI.getAll({ limit: 1000 });
        allItems = broad.data.data || [];
      } catch (e) {
        const existing = await productAPI.getAll({ search: prefix });
        allItems = existing.data.data || [];
      }

      const regex = new RegExp(`^${prefix}-(\\d{3,})$`);
      const usedNumbers = allItems
        .map((p) => p.sku)
        .filter((s) => s && regex.test(s))
        .map((s) => parseInt(s.match(regex)[1], 10))
        .filter((n) => Number.isFinite(n));

      const nextNum = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
      const nextSku = `${prefix}-${nextNum.toString().padStart(3, '0')}`;
      setFormData((prev) => ({
        ...prev,
        sku: nextSku,
      }));
      setErrors((prev) => ({ ...prev, sku: '' }));
    } catch (err) {
      // Final fallback — use a timestamp-suffixed SKU so we never block the
      // admin with an empty field on transient API failures.
      const fallback = `${prefix}-${Date.now().toString().slice(-4)}`;
      setFormData((prev) => ({
        ...prev,
        sku: fallback,
      }));
      setErrors((prev) => ({ ...prev, sku: '' }));
    } finally {
      setSkuLoading(false);
    }
  }, [isEdit, generateSkuPrefix, existingSkus]);

  useEffect(() => {
    if (!isEdit && formData.name && formData.category && formData.metal) {
      autoGenerateSku(formData.name, formData.category, formData.metal);
    }
  }, [formData.name, formData.category, formData.metal, isEdit, autoGenerateSku]);

  const toggleCheckbox = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newErrors = { ...errors };
    delete newErrors.fileType;
    delete newErrors.fileSize;
    delete newErrors.fileCount;

    const validFiles = [];

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.fileType = `Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.`;
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.fileSize = `File ${file.name} exceeds 5MB limit.`;
        return;
      }
      validFiles.push(file);
    });

    const totalFiles = imageState.files.length + validFiles.length;
    if (totalFiles > MAX_FILES) {
      newErrors.fileCount = `Maximum ${MAX_FILES} images allowed.`;
    }

    setErrors(newErrors);

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImageState((prev) => ({
        files: [...prev.files, ...validFiles],
        existingImages: prev.existingImages,
        previews: [...prev.previews, ...newPreviews],
        primaryIndex: prev.files.length === 0 && prev.existingImages.length === 0 ? 0 : prev.primaryIndex,
      }));
    }
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i;
    if (!urlPattern.test(url)) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: 'Please enter a valid image URL (jpg, png, webp, gif, svg)',
      }));
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.imageUrl;
      return newErrors;
    });

    setImageState((prev) => {
      const newExisting = [...prev.existingImages, url];
      return {
        files: prev.files,
        existingImages: newExisting,
        previews: prev.previews,
        primaryIndex: prev.existingImages.length === 0 && prev.files.length === 0 ? 0 : prev.primaryIndex,
      };
    });
    setImageUrlInput('');
  };

  const removeFile = (index) => {
    const offset = imageState.existingImages.length;
    if (index < offset) {
      removeExistingImage(index);
    } else {
      const fileIndex = index - offset;
      setImageState((prev) => {
        const newFiles = [...prev.files];
        const newPreviews = [...prev.previews];
        newFiles.splice(fileIndex, 1);
        newPreviews.splice(fileIndex, 1);

        let newPrimary = prev.primaryIndex;
        if (newFiles.length === 0 && newPreviews.length === 0 && prev.existingImages.length === 0) {
          newPrimary = 0;
        } else {
          newPrimary = Math.min(prev.primaryIndex, prev.existingImages.length + newFiles.length - 1);
        }

        return {
          files: newFiles,
          existingImages: prev.existingImages,
          previews: newPreviews,
          primaryIndex: newPrimary,
        };
      });
    }
  };

  const removeExistingImage = (index) => {
    setImageState((prev) => ({
      files: prev.files,
      existingImages: prev.existingImages.filter((_, i) => i !== index),
      previews: prev.previews,
      primaryIndex: 0,
    }));
  };

  const setPrimary = (index) => {
    setImageState((prev) => ({ ...prev, primaryIndex: index }));
  };

  const getAllImages = () => {
    return [...imageState.existingImages, ...imageState.previews];
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }

    // SKU validation: required and must not collide with another product.
    // The currently-edited product is allowed to keep its existing SKU.
    const trimmedSku = String(formData.sku || '').trim();
    if (!trimmedSku) {
      newErrors.sku = 'SKU is required';
    } else if (existingSkus && existingSkus.map && existingSkus.map[trimmedSku.toLowerCase()]) {
      const ownerId = existingSkus.map[trimmedSku.toLowerCase()];
      const isOwnSku = existingSkus.currentProductId && String(ownerId) === existingSkus.currentProductId;
      if (!isOwnSku) {
        newErrors.sku = 'SKU already exists. Please enter a unique SKU.';
      }
    }

    if (formData.price && formData.discountPrice) {
      const priceVal = parseFloat(formData.price);
      const discountVal = parseFloat(formData.discountPrice);
      if (!isNaN(priceVal) && !isNaN(discountVal) && discountVal >= priceVal) {
        newErrors.discountPrice = 'Discount price must be less than regular price';
      }
    }

    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }

    if (formData.stock && isNaN(parseInt(formData.stock, 10))) {
      newErrors.stock = 'Stock must be a valid number';
    }

    const allImages = getAllImages();
    if (allImages.length === 0) {
      newErrors.images = 'At least one product image is required (upload or URL)';
    }

    setApiError('');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const formDataPayload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          formDataPayload.append(key, value);
        } else if (value !== null && value !== undefined) {
          formDataPayload.append(key, value);
        }
      });

      imageState.files.forEach((file) => {
        formDataPayload.append('images', file);
      });

      const existingImageUrls = [...imageState.existingImages];
      formDataPayload.append('imageUrls', JSON.stringify(existingImageUrls));

      if (isEdit) {
        await productAPI.update(product._id || product.id, formDataPayload);
      } else {
        await productAPI.create(formDataPayload);
      }

      onSaved && onSaved(isEdit ? 'Product updated successfully' : 'Product created successfully');
      onClose();
    } catch (error) {
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('An error occurred while saving the product');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const allImages = getAllImages();
  const offset = imageState.existingImages.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-deep-emerald">
            {isEdit ? 'Edit Product' : 'Add New Jewellery Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-deep-emerald transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {apiError && (
            <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.name ? 'border-error' : 'border-outline-variant'
                } rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                SKU * <span className="text-outline-variant normal-case">(auto-generated, editable)</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={(e) => {
                  const next = e.target.value;
                  setFormData((prev) => ({ ...prev, sku: next }));
                  if (errors.sku) {
                    setErrors((prev) => ({ ...prev, sku: '' }));
                  }
                }}
                className={`w-full px-4 py-2.5 border ${
                  errors.sku ? 'border-error' : 'border-outline-variant'
                } rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md font-mono`}
                placeholder={isEdit ? '' : 'Auto-generated — you may edit before saving'}
              />
              {errors.sku && <p className="text-error text-xs mt-1">{errors.sku}</p>}
              {!isEdit && formData.category && formData.metal ? (
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  {skuLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                      Generating unique SKU...
                    </>
                  ) : formData.sku ? (
                    <>
                      <span className="material-symbols-outlined text-[14px] text-deep-emerald">check_circle</span>
                      Auto-generated SKU: <span className="font-mono font-semibold text-charcoal-text">{formData.sku}</span>
                      <span className="text-outline-variant"> — you can edit it</span>
                    </>
                  ) : (
                    'SKU will be generated when name, category, and metal are filled'
                  )}
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant mt-1">
                  SKU auto-generates when name, category, and metal are filled
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.category ? 'border-error' : 'border-outline-variant'
                } rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-error text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Metal
              </label>
              <select
                name="metal"
                value={formData.metal}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
              >
                <option value="">Select Metal</option>
                {METALS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-error text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.discountPrice ? 'border-error' : 'border-outline-variant'
                } rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.discountPrice && (
                <p className="text-error text-xs mt-1">{errors.discountPrice}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder="0"
                min="0"
              />
              {errors.stock && <p className="text-error text-xs mt-1">{errors.stock}</p>}
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Status (Active / Disabled)
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-on-surface-variant mt-1">
                Active = visible in store | Disabled = hidden but not deleted
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                Subcategory *
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${
                  errors.subcategory ? 'border-error' : 'border-outline-variant'
                } rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none`}
              >
                <option value="">Select Subcategory</option>
                {SUBCATEGORIES.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              {errors.subcategory && <p className="text-error text-xs mt-1">{errors.subcategory}</p>}
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
              placeholder="Enter product description"
            ></textarea>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={() => toggleCheckbox('isFeatured')}
                className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
              />
              <span className="font-body-md text-on-surface">Featured Product</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={() => toggleCheckbox('isBestSeller')}
                className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
              />
              <span className="font-body-md text-on-surface">Best Seller</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={() => toggleCheckbox('isNewArrival')}
                className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
              />
              <span className="font-body-md text-on-surface">New Arrival</span>
            </label>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
              Product Images *
            </label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-outline-variant rounded-lg p-4 text-center hover:border-deep-emerald transition-colors">
                <input
                  type="file"
                  name="images"
                  accept={ALLOWED_TYPES.join(',')}
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="imageUpload"
                  disabled={allImages.length >= MAX_FILES}
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">
                    upload
                  </span>
                  <p className="text-sm font-body-md text-on-surface mb-1">
                    Click to upload images from device
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Up to {MAX_FILES} images, max 5MB each (JPEG, PNG, WebP, GIF)
                  </p>
                </label>
              </div>

              <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-low">
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Or enter Image URL(s)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    disabled={!imageUrlInput.trim() || allImages.length >= MAX_FILES}
                    className="px-4 py-2 bg-deep-emerald text-surface-white font-label-caps text-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {errors.imageUrl && <p className="text-error text-xs mt-1">{errors.imageUrl}</p>}
              </div>
            </div>

            {errors.images && <p className="text-error text-xs mt-1">{errors.images}</p>}
            {errors.fileType && <p className="text-error text-xs mt-1">{errors.fileType}</p>}
            {errors.fileSize && <p className="text-error text-xs mt-1">{errors.fileSize}</p>}
            {errors.fileCount && <p className="text-error text-xs mt-1">{errors.fileCount}</p>}

            {allImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {allImages.map((img, idx) => {
                  const isPrimary = idx === imageState.primaryIndex;
                  return (
                    <div
                      key={`${isEdit ? (product._id || product.id) : 'new'}-${idx}`}
                      className={`relative group border-2 rounded overflow-hidden ${
                        isPrimary ? 'border-deep-emerald' : 'border-outline-variant'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-24 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPrimary ? (
                          <span className="text-white text-xs font-label-caps bg-deep-emerald px-2 py-1 rounded">
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimary(idx)}
                            className="p-1 text-white hover:text-deep-emerald transition-colors"
                            title="Set as primary"
                          >
                            <span className="material-symbols-outlined text-sm">star</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 text-white hover:text-error transition-colors"
                          title="Remove"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-outline-variant mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
