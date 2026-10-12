import { useEffect, useState } from 'react'
import { accessoryProductAPI } from '../../services/api'
import { getAccessoryImages, getRecordId } from '../../utils/accessoryProducts'
import { resolveImageUrl } from '../../utils/apiUrl'

const MAX_FILES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

const initialForm = {
  name: '',
  brand: '',
  description: '',
  price: '',
  stockQuantity: '',
  status: 'active',
  color: '',
  size: '',
  material: '',
  fragranceType: '',
}

export default function AccessoryProductModal({
  isOpen,
  onClose,
  category,
  product,
  onSaved,
}) {
  const isEdit = Boolean(product)
  const [formData, setFormData] = useState(initialForm)
  const [imageState, setImageState] = useState({
    files: [],
    existingImages: [],
    previews: [],
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')

  useEffect(() => {
    if (!isOpen) return

    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        price: product.price ?? '',
        stockQuantity: product.stockQuantity ?? product.stock ?? '',
        status: product.status || 'active',
        color: product.attributes?.color || product.color || '',
        size: product.attributes?.size || product.size || '',
        material: product.attributes?.material || product.material || '',
        fragranceType: product.attributes?.fragranceType || product.fragranceType || '',
      })
      setImageState({
        files: [],
        existingImages: getAccessoryImages(product),
        previews: [],
      })
    } else {
      setFormData(initialForm)
      setImageState({ files: [], existingImages: [], previews: [] })
    }

    setErrors({})
    setApiError('')
    setUploadStatus('')
  }, [isOpen, product])

  useEffect(() => {
    if (isOpen) return undefined

    imageState.previews.forEach((preview) => URL.revokeObjectURL(preview))
    return undefined
  }, [isOpen])

  if (!isOpen) return null

  const allImages = [...imageState.existingImages, ...imageState.previews]

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || [])
    const nextErrors = { ...errors }
    delete nextErrors.images
    delete nextErrors.fileType
    delete nextErrors.fileSize
    delete nextErrors.fileCount

    const validFiles = []
    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        nextErrors.fileType = 'Only JPEG, PNG, WebP, and GIF images are allowed.'
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        nextErrors.fileSize = `${file.name} is larger than 5MB.`
        return
      }
      validFiles.push(file)
    })

    if (allImages.length + validFiles.length > MAX_FILES) {
      nextErrors.fileCount = `Maximum ${MAX_FILES} images allowed.`
      setErrors(nextErrors)
      return
    }

    setErrors(nextErrors)
    if (!validFiles.length) return

    setImageState((prev) => ({
      files: [...prev.files, ...validFiles],
      existingImages: prev.existingImages,
      previews: [...prev.previews, ...validFiles.map((file) => URL.createObjectURL(file))],
    }))
  }

  const removeImage = (index) => {
    const existingCount = imageState.existingImages.length
    if (index < existingCount) {
      setImageState((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, imageIndex) => imageIndex !== index),
      }))
      return
    }

    const fileIndex = index - existingCount
    setImageState((prev) => {
      URL.revokeObjectURL(prev.previews[fileIndex])
      return {
        files: prev.files.filter((_, idx) => idx !== fileIndex),
        existingImages: prev.existingImages,
        previews: prev.previews.filter((_, idx) => idx !== fileIndex),
      }
    })
  }

  const validate = () => {
    const nextErrors = {}
    if (!formData.name.trim()) nextErrors.name = 'Product name is required.'
    if (!formData.price || Number(formData.price) < 0) nextErrors.price = 'Enter a valid price.'
    if (formData.stockQuantity === '' || Number(formData.stockQuantity) < 0) {
      nextErrors.stockQuantity = 'Enter a valid stock quantity.'
    }
    if (allImages.length === 0) nextErrors.images = 'Upload at least one product image.'
    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    const categoryId = getRecordId(category)
    setSaving(true)
    setApiError('')
    setUploadStatus(imageState.files.length ? 'Uploading images...' : 'Saving product...')

    try {
      const payload = new FormData()
      payload.append('name', formData.name.trim())
      payload.append('brand', formData.brand.trim())
      payload.append('description', formData.description.trim())
      payload.append('price', formData.price)
      payload.append('stockQuantity', formData.stockQuantity)
      payload.append('status', formData.status)
      payload.append('category', categoryId)
      payload.append('categoryId', categoryId)
      payload.append('categoryName', category?.name || '')
      payload.append('attributes', JSON.stringify({
        color: formData.color,
        size: formData.size,
        material: formData.material,
        fragranceType: formData.fragranceType,
      }))
      payload.append('imageUrls', JSON.stringify(imageState.existingImages))
      imageState.files.forEach((file) => payload.append('images', file))

      const config = {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadStatus(`Uploading images... ${percent}%`)
        },
      }

      if (isEdit) {
        await accessoryProductAPI.update(getRecordId(product), payload, config)
      } else {
        await accessoryProductAPI.create(payload, config)
      }

      setUploadStatus('Saved')
      onSaved(isEdit ? 'Accessory product updated successfully' : 'Accessory product created successfully')
      onClose()
    } catch (error) {
      setApiError(error.response?.data?.message || error.message || 'Failed to save accessory product')
      setUploadStatus('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-surface-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <h2 className="font-headline-md text-headline-md text-deep-emerald">
              {isEdit ? 'Edit Accessory Product' : 'Add Accessory Product'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">{category?.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-deep-emerald transition-colors">
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
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Product Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Brand</label>
              <input name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Price *</label>
              <input type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
              {errors.price && <p className="text-error text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Stock Quantity *</label>
              <input type="number" min="0" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
              {errors.stockQuantity && <p className="text-error text-xs mt-1">{errors.stockQuantity}</p>}
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm">
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Description</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm resize-y" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Color</label>
              <input name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Size / Volume</label>
              <input name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Material</label>
              <input name="material" value={formData.material} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Fragrance / Type</label>
              <input name="fragranceType" value={formData.fragranceType} onChange={handleChange} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Product Images *</label>
            <div className="border-2 border-dashed border-outline-variant rounded-lg p-5 text-center hover:border-deep-emerald transition-colors">
              <input id="accessoryProductImages" type="file" accept={ALLOWED_TYPES.join(',')} multiple onChange={handleFileChange} className="hidden" disabled={allImages.length >= MAX_FILES} />
              <label htmlFor="accessoryProductImages" className="cursor-pointer block">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">upload</span>
                <p className="text-sm text-on-surface">Upload images from device</p>
                <p className="text-xs text-on-surface-variant mt-1">Up to {MAX_FILES} images, max 5MB each</p>
              </label>
            </div>
            {errors.images && <p className="text-error text-xs mt-1">{errors.images}</p>}
            {errors.fileType && <p className="text-error text-xs mt-1">{errors.fileType}</p>}
            {errors.fileSize && <p className="text-error text-xs mt-1">{errors.fileSize}</p>}
            {errors.fileCount && <p className="text-error text-xs mt-1">{errors.fileCount}</p>}

            {allImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                {allImages.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative group border border-outline-variant rounded overflow-hidden bg-surface-container-low">
                    <img
                      src={image.startsWith('blob:') ? image : resolveImageUrl(image)}
                      alt={`Accessory product ${index + 1}`}
                      className="w-full h-28 object-cover"
                      onError={(event) => {
                        event.currentTarget.src = 'https://placehold.co/240x240?text=No+Image'
                      }}
                    />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Remove image">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                    {index === 0 && (
                      <span className="absolute left-2 bottom-2 text-[10px] uppercase tracking-wide bg-deep-emerald text-white px-2 py-1 rounded">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-t border-outline-variant">
          <p className="text-sm text-on-surface-variant min-h-[20px]">{uploadStatus}</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors flex items-center gap-2 disabled:opacity-50">
              {saving && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
              {isEdit ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
