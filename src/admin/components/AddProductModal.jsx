import { useState, useEffect, useCallback, useRef } from 'react';
import { productAPI, categoryAPI } from '../../services/api';

const METALS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'];
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
  const [skuCheckLoading, setSkuCheckLoading] = useState(false);
  const [skuError, setSkuError] = useState('');
  const skuDebounceRef = useRef(null);
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
    return () => {
      if (skuDebounceRef.current) {
        clearTimeout(skuDebounceRef.current);
      }
    };
  }, []);

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
      const existing = await productAPI.getAll({ search: prefix });
      let num = 1;
      const items = existing.data.data || [];
      const regex = new RegExp(`^${prefix}-(\\d{3})$`);
      const skus = items
        .map((p) => p.sku)
        .filter((s) => s && regex.test(s))
        .map((s) => parseInt(s.match(regex)[1], 10));
      if (skus.length > 0) {
        num = Math.max(...skus) + 1;
      }
      const nextSku = `${prefix}-${num.toString().padStart(3, '0')}`;
      setFormData((prev) => ({
        ...prev,
        sku: nextSku,
      }));
    } catch (err) {
      setFormData((prev) => ({
        ...prev,
        sku: `${prefix}-001`,
      }));
    } finally {
      setSkuLoading(false);
    }
  }, [isEdit, generateSkuPrefix]);

  useEffect(() => {
    if (!isEdit && formData.name && formData.category && formData.metal) {
      autoGenerateSku(formData.name, formData.category, formData.metal);
    }
   }, [formData.name, formData.category, formData.metal, isEdit, autoGenerateSku]);

  /* =========================================================
     SKU AVAILABILITY CHECK
     ========================================================= */

  const checkSkuAvailability = useCallback(async (sku) => {
    const trimmed = sku?.trim() || '';
    if (!trimmed || isEdit) {
      setSkuError('');
      return;
    }

    setSkuCheckLoading(true);
    setSkuError('');

    try {
      const response = await productAPI.checkSku(trimmed);
      if (response.data?.exists) {
        setSkuError('This SKU is already taken.');
      } else {
        setSkuError('');
      }
    } catch {
      setSkuError('');
    } finally {
      setSkuCheckLoading(false);
    }
  }, [isEdit]);

  const debouncedCheckSku = useCallback((sku) => {
    if (skuDebounceRef.current) {
      clearTimeout(skuDebounceRef.current);
    }
    skuDebounceRef.current = setTimeout(() => {
      checkSkuAvailability(sku);
    }, 500);
  }, [checkSkuAvailability]);

  const handleSkuBlur = (e) => {
    const value = e.target.value;
    if (skuDebounceRef.current) {
      clearTimeout(skuDebounceRef.current);
    }
    void checkSkuAvailability(value);
  };

  /* =========================================================
     EVENT HANDLERS
     ========================================================= */

  const toggleCheckbox = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'sku' && !isEdit) {
      debouncedCheckSku(newValue);
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
    if (e && e.preventDefault) e.preventDefault();
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
                SKU * (Editable)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                onBlur={handleSkuBlur}
                className={`w-full px-4 py-2.5 border ${
                  errors.sku || skuError ? 'border-error' : 'border-outline-variant'
                } rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md font-mono`}
                placeholder="Enter or edit SKU"
              />
              {errors.sku && <p className="text-error text-xs mt-1">{errors.sku}</p>}
              {!errors.sku && skuError && (
                <p className="text-error text-xs mt-1">{skuError}</p>
              )}
              {!errors.sku && skuCheckLoading && (
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="animate-spin w-3 h-3 border-2 border-on-surface-variant border-t-transparent rounded-full"></span>
                  Checking SKU availability...
                </p>
              )}
              {!isEdit && formData.category && formData.metal ? (
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  {skuLoading ? 'Generating...' : `Auto-generated: ${formData.sku}`}
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
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder="e.g., Engagement Rings"
              />
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
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-outline-variant">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || skuCheckLoading || !!skuError}
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
      </div>
    </div>
  );
}