import { resolveImageUrl } from './apiUrl'

export const getRecordId = (record) => record?._id || record?.id || ''

export const getImageValue = (image) => {
  if (!image) return ''
  if (typeof image === 'string') return image
  return image.url || image.src || image.path || ''
}

export const getAccessoryImages = (item) => {
  const images = Array.isArray(item?.images)
    ? item.images.map(getImageValue).filter(Boolean)
    : []

  const primary = getImageValue(item?.primaryImage || item?.image)
  return primary && !images.includes(primary) ? [primary, ...images] : images
}

export const getAccessoryImage = (item, fallback = 'https://placehold.co/600x750?text=Accessory') => {
  return getAccessoryImages(item)[0] || fallback
}

export const getAccessoryStatus = (item) => item?.status || (item?.isActive === false ? 'inactive' : 'active')

export const isAccessoryActive = (item) => {
  const status = getAccessoryStatus(item)
  return item?.isActive !== false && status !== 'inactive' && status !== 'draft'
}

export const getCategoryLabel = (category) => {
  if (!category) return ''
  if (typeof category === 'string') return category
  return category.name || category.title || ''
}

export const getCategoryId = (category) => {
  if (!category) return ''
  if (typeof category === 'string') return category
  return category._id || category.id || ''
}

export const getCategorySlug = (category) => {
  if (!category) return ''
  if (typeof category === 'string') {
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  return category.slug || getCategoryLabel(category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const transformAccessoryProduct = (item) => {
  const images = getAccessoryImages(item)
  const price = Number(item?.price || 0)
  const stock = Number(item?.stockQuantity ?? item?.stock ?? 0)

  return {
    id: getRecordId(item),
    raw: item,
    type: 'accessory',
    name: item?.name || '',
    brand: item?.brand || '',
    category: getCategoryLabel(item?.category) || item?.categoryName || '',
    categoryId: getCategoryId(item?.category) || item?.categoryId || item?.accessory || '',
    description: item?.description || '',
    attributes: item?.attributes || {},
    price,
    originalPrice: item?.originalPrice ? Number(item.originalPrice) : null,
    stock,
    status: getAccessoryStatus(item),
    isAvailable: stock > 0 && isAccessoryActive(item),
    image: images[0] || '',
    images,
    SKU: item?.sku || item?.SKU || '',
  }
}

export const resolveAccessoryImage = (item, fallback) =>
  resolveImageUrl(getAccessoryImage(item, fallback))
