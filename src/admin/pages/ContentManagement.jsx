import { useState, useEffect, useRef } from 'react'
import { contentAPI, productAPI } from '../../services/api'

const CONTENT_TYPES = [
  { key: 'heroBanners', label: 'Hero Banners', icon: 'campaign' },
  { key: 'featuredProducts', label: 'Featured Products', icon: 'star' },
  { key: 'collections', label: 'Collections', icon: 'collections' },
  { key: 'promoBanners', label: 'Promo Banners', icon: 'campaign' },
  { key: 'blogs', label: 'Blogs', icon: 'article' },
  { key: 'testimonials', label: 'Testimonials', icon: 'rate_review' },
]

const POSITIONS = ['top', 'bottom', 'sidebar', 'featured']

const BLOG_STATUS = [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]

export default function ContentManagement() {
  const [activeSection, setActiveSection] = useState('heroBanners')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [imagePreview, setImagePreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const fileInputRef = useRef(null)

  const [draggedItem, setDraggedItem] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [activeSection])

  useEffect(() => {
    if (activeSection === 'featuredProducts') {
      productAPI.getAll().then((res) => {
        if (res.data.success) setProducts(res.data.data || [])
      }).catch(() => {})
    }
  }, [activeSection])

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await contentAPI.getAll(activeSection)
      if (response.data.success) {
        setItems(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch content')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    const isBlog = activeSection === 'blogs'
    const isTestimonial = activeSection === 'testimonials'
    const isPromo = activeSection === 'promoBanners'
    const isHero = activeSection === 'heroBanners'
    const isFeatured = activeSection === 'featuredProducts'

    setFormData({
      ...(isBlog && {
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image: '',
        author: 'Admin',
        tags: [],
        category: '',
        status: 'draft',
        publishedAt: '',
        isActive: true,
        seoTitle: '',
        seoDescription: '',
      }),
      ...(isTestimonial && {
        name: '',
        title: '',
        image: '',
        content: '',
        rating: 5,
        isActive: true,
        sortOrder: 0,
      }),
      ...(isPromo && {
        title: '',
        description: '',
        image: '',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        position: 'top',
        bgColor: '#F9F8F6',
        isActive: true,
        sortOrder: 0,
        startDate: '',
        endDate: '',
      }),
      ...(isHero && {
        title: '',
        subtitle: '',
        image: '',
        mobileImage: '',
        ctaText: 'View Collection',
        ctaLink: '/shop',
        isActive: true,
        sortOrder: 0,
        startDate: '',
        endDate: '',
      }),
      ...(isFeatured && {
        product: '',
        title: '',
        description: '',
        image: '',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        isActive: true,
        sortOrder: 0,
        startDate: '',
        endDate: '',
      }),
      ...(!isBlog && !isTestimonial && !isPromo && !isHero && !isFeatured && {
        title: '',
        description: '',
        image: '',
        ctaText: 'Shop Now',
        ctaLink: '/shop',
        isActive: true,
        sortOrder: 0,
        startDate: '',
        endDate: '',
      }),
    })
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddClick = () => {
    setEditingItem(null)
    resetForm()
    setShowModal(true)
  }

  const handleEditClick = (item) => {
    setEditingItem(item)
    setFormData({
      ...item,
      tags: item.tags || [],
      product: item.product?._id || item.product || '',
      image: '',
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : '',
    })
    setImagePreview(item.image || '')
    setShowModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreview(ev.target.result)
        setFormData((prev) => ({ ...prev, image: file }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const submitData = { ...formData }

      const isNew = !submitData._id

      if (submitData.image instanceof File) {
        const formObj = new FormData()
        Object.keys(submitData).forEach((key) => {
          if (key === 'image') {
            formObj.append('image', submitData[key])
          } else if (key === 'tags') {
            formObj.append('tags', JSON.stringify(submitData[key]))
          } else if (key === 'isActive' || key === 'sortOrder' || key === 'rating') {
            formObj.append(key, String(submitData[key]))
          } else {
            formObj.append(key, submitData[key])
          }
        })

        if (editingItem) {
          const response = await contentAPI.update(activeSection, editingItem._id, formObj)
          if (response.data.success) {
            setSuccessMessage(`${getContentLabel()} updated successfully`)
          }
        } else {
          const response = await contentAPI.create(activeSection, formObj)
          if (response.data.success) {
            setSuccessMessage(`${getContentLabel()} created successfully`)
          }
        }
      } else {
        if (submitData.image === '' ) {
          delete submitData.image
        }
        if (isNew && submitData._id) {
          delete submitData._id
        }
        if (submitData.__v) {
          delete submitData.__v
        }

        if (editingItem) {
          const response = await contentAPI.update(activeSection, editingItem._id, submitData)
          if (response.data.success) {
            setSuccessMessage(`${getContentLabel()} updated successfully`)
          }
        } else {
          const response = await contentAPI.create(activeSection, submitData)
          if (response.data.success) {
            setSuccessMessage(`${getContentLabel()} created successfully`)
          }
        }
      }

      setShowModal(false)
      fetchItems()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save content')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${getContentLabel().toLowerCase()}?`)) return
    try {
      await contentAPI.delete(activeSection, id)
      setSuccessMessage(`${getContentLabel()} deleted successfully`)
      setError('')
      setItems(items.filter((i) => i._id !== id))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete content')
    }
  }

  const handleToggleActive = async (item) => {
    try {
      const res = await contentAPI.toggleActive(activeSection, item._id)
      if (res.data.success) {
        setItems(items.map((i) => (i._id === item._id ? res.data.data : i)))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleReorder = async (newItems) => {
    const sorted = newItems.map((item, index) => ({
      id: item._id,
      sortOrder: index,
    }))
    try {
      await contentAPI.reorder(activeSection, sorted)
      setItems(newItems)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reorder')
    }
  }

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effect = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetItem) => {
    e.preventDefault()
    if (!draggedItem || draggedItem._id === targetItem._id) return

    const newItems = [...items]
    const draggedIndex = newItems.findIndex((i) => i._id === draggedItem._id)
    const targetIndex = newItems.findIndex((i) => i._id === targetItem._id)

    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    handleReorder(newItems)
    setDraggedItem(null)
  }

  const getContentLabel = () => {
    const type = CONTENT_TYPES.find((t) => t.key === activeSection)
    return type ? type.label.slice(0, -1) : 'Content item'
  }

  const getLabel = (item) => {
    if (item.title) return item.title
    if (item.name) return item.name
    return `#${item._id?.toString().slice(-6).toUpperCase()}`
  }

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-primary-fixed-dim/20 text-on-primary-fixed-variant border border-primary-fixed-dim/30">
          <span className="w-1.5 h-1.5 rounded-full bg-deep-emerald"></span>
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-error-container/20 text-error border border-error-container/30">
        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
        Inactive
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      getLabel(item).toLowerCase().includes(term) ||
      (activeSection === 'testimonials' && item.content?.toLowerCase().includes(term)) ||
      (activeSection === 'heroBanners' && item.subtitle?.toLowerCase().includes(term))
    )
  }).filter((item) => {
    if (statusFilter === 'all') return true
    return statusFilter === 'active' ? item.isActive : !item.isActive
  })

  const getFormFields = () => {
    const isBlog = activeSection === 'blogs'
    const isTestimonial = activeSection === 'testimonials'
    const isPromo = activeSection === 'promoBanners'
    const isHero = activeSection === 'heroBanners'
    const isFeatured = activeSection === 'featuredProducts'

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isTestimonial ? (
            <>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="e.g. Verified Buyer"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">{isHero ? 'Title *' : isFeatured ? 'Title *' : 'Title *'}</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={`Enter ${getContentLabel().toLowerCase()}`}
                required
              />
            </div>
          )}

          {(isHero || isFeatured || isPromo || isTestimonial) && (
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                {isHero ? 'Subtitle' : isFeatured ? 'Description' : isPromo ? 'Description' : 'Designation'}
              </label>
              <input
                type="text"
                value={formData.subtitle || formData.description || formData.title || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={isHero ? 'Subtitle for the banner' : isFeatured ? 'Short description' : isPromo ? 'Promo description' : 'Job title'}
              />
            </div>
          )}
        </div>

        {isFeatured && (
          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Product</label>
            <select
              value={formData.product || ''}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
        )}

        {isBlog && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="URL-friendly slug"
                />
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Author name"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Excerpt</label>
              <textarea
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                placeholder="Short summary for blog preview"
              />
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Content *</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y font-mono"
                placeholder="Full blog content"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Tags</label>
                <input
                  type="text"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Comma-separated tags"
                />
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="e.g. Jewellery Care"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Status</label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                >
                  {BLOG_STATUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Published At</label>
                <input
                  type="date"
                  value={formData.publishedAt || ''}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">SEO Title</label>
              <input
                type="text"
                value={formData.seoTitle || ''}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder="SEO title for search engines"
              />
            </div>

            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">SEO Description</label>
              <textarea
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                placeholder="SEO meta description (max 320 characters)"
              />
            </div>
          </>
        )}

        {isTestimonial && (
          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Content *</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
              placeholder="Customer testimonial"
              required
            />
          </div>
        )}

        {!isBlog && !isTestimonial && (
          <>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Description</label>
              <textarea
                value={formData.description || formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value, subtitle: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                placeholder="Description"
              />
            </div>

            {isPromo && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Text</label>
                    <input
                      type="text"
                      value={formData.ctaText || ''}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                      placeholder="e.g. Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Link</label>
                    <input
                      type="text"
                      value={formData.ctaLink || ''}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                      placeholder="e.g. /shop"
                    />
                  </div>
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Position</label>
                    <select
                      value={formData.position || 'top'}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Background Color</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={formData.bgColor || '#F9F8F6'}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="w-12 h-10 p-0 border border-outline-variant rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.bgColor || ''}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                      placeholder="#F9F8F6"
                    />
                  </div>
                </div>
              </>
            )}

            {isHero && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(
                  <>
                    <div>
                      <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Text</label>
                      <input
                        type="text"
                        value={formData.ctaText || ''}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                        placeholder="e.g. View Collection"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Link</label>
                      <input
                        type="text"
                        value={formData.ctaLink || ''}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                        placeholder="e.g. /shop"
                      />
                    </div>
                    <div>
                      <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Mobile Image URL</label>
                      <input
                        type="text"
                        value={formData.mobileImage || ''}
                        onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                        className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                        placeholder="Optional mobile banner URL"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {!isHero && !isPromo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={formData.ctaText || ''}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="e.g. Shop Now"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink || ''}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="e.g. /shop"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {!isBlog && !isTestimonial && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder !== undefined && formData.sortOrder !== null ? formData.sortOrder : ''}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
              />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
              />
            </div>
          </div>
        )}

        {isTestimonial && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder !== undefined && formData.sortOrder !== null ? formData.sortOrder : ''}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Rating</label>
              <select
                value={formData.rating || 5}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} Stars</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isBlog && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder !== undefined && formData.sortOrder !== null ? formData.sortOrder : ''}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder="0"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive !== undefined ? formData.isActive : true}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
          />
          <label htmlFor="isActive" className="font-body-md text-on-surface">
            Active / Visible on Website
          </label>
        </div>
      </>
    )
  }

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="w-full space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Content Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage website content: hero banners, featured products, collections, promo banners, blogs, and testimonials.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6 overflow-x-auto custom-scrollbar">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => {
                setActiveSection(type.key)
                setItems([])
                setSearchTerm('')
                setStatusFilter('all')
                fetchItems()
              }}
              className={`flex items-center gap-3 px-6 py-3 font-label-caps text-label-caps text-sm rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                activeSection === type.key
                  ? 'text-deep-emerald border-deep-emerald bg-surface-white'
                  : 'text-on-surface-variant border-transparent hover:text-deep-emerald hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        <div className="bg-surface-white p-4 rounded border border-outline-variant shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
              placeholder={`Search ${getContentLabel().toLowerCase()}s...`}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[140px]">
              <select
                className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps text-sm rounded transition-all duration-200 hover:bg-deep-emerald/90 active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add {getContentLabel()}
            </button>
          </div>
        </div>

        <div className="bg-surface-white rounded shadow-sm border border-outline-variant overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
                progress_activity
              </span>
              <p className="font-body-md text-sm text-on-surface-variant mt-2">
                Loading content...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                {CONTENT_TYPES.find((t) => t.key === activeSection)?.icon || 'article'}
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                No {getContentLabel().toLowerCase()}s found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">#</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Image</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Title</th>
                    {activeSection === 'promoBanners' && <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Position</th>}
                    {activeSection === 'blogs' && <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Status</th>}
                    {activeSection === 'testimonials' && <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Rating</th>}
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Active</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Sort</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Created</th>
                    <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                  {filteredItems.map((item, index) => (
                    <tr
                      key={item._id}
                      className="table-row-hover bg-surface-white group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item)}
                    >
                      <td className="py-4 pl-6 pr-4 text-on-surface-variant cursor-move">
                        <span className="material-symbols-outlined text-sm">drag_indicator</span>
                        {index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 rounded bg-soft-cream border border-outline-variant/30 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img
                              className="w-full h-full object-cover"
                              alt={getLabel(item)}
                              src={item.image}
                              onError={(e) => { e.target.src = 'https://placehold.co/48x48'; }}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant/30">image</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-deep-emerald truncate max-w-[200px]">{getLabel(item)}</span>
                          {item.subtitle && (
                            <span className="text-xs text-on-surface-variant truncate max-w-[200px]">{item.subtitle}</span>
                          )}
                        </div>
                      </td>
                      {activeSection === 'promoBanners' && (
                        <td className="py-4 px-4">{item.position || '-'}</td>
                      )}
                      {activeSection === 'blogs' && (
                        <td className="py-4 px-4">
                          {item.status === 'published' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-label-caps bg-primary-fixed-dim/20 text-on-primary-fixed-variant border border-primary-fixed-dim/30">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-label-caps bg-surface-container/50 text-on-surface-variant border border-outline-variant">
                              Draft
                            </span>
                          )}
                        </td>
                      )}
                      {activeSection === 'testimonials' && (
                        <td className="py-4 px-4">
                          {'★'.repeat(item.rating || 0)}{'☆'.repeat(5 - (item.rating || 0))}
                        </td>
                      )}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="p-1 rounded transition-colors"
                          title={item.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {item.isActive ? (
                            <span className="material-symbols-outlined text-deep-emerald text-lg">check_circle</span>
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant text-lg">cancel</span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">{item.sortOrder}</td>
                      <td className="py-4 px-4 text-on-surface-variant whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-sm">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">
                {editingItem ? `Edit ${getContentLabel()}` : `Add New ${getContentLabel()}`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-deep-emerald transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 flex-shrink-0">
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Image</label>
                    <div className="w-24 h-24 rounded bg-soft-cream border border-outline-variant/30 overflow-hidden flex items-center justify-center mb-2">
                      {imagePreview ? (
                        <img
                          className="w-full h-full object-cover"
                          src={imagePreview}
                          alt="Preview"
                          onError={(e) => { e.target.src = 'https://placehold.co/96x96'; }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant/30 text-2xl">image</span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    {getFormFields()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    editingItem ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
