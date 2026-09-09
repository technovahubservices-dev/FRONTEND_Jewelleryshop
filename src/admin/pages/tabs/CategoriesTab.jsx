import { useState, useEffect } from 'react'
import { categoryAPI } from '../../../services/api'
import { DualImageInput, ListCardItem, EmptyState } from './ContentManagementShared'

export default function CategoriesTab({ settings, updateSetting, toggleItem, deleteItem, addItem, handleFileUpload, onPreview }) {
  const [categoryOptions, setCategoryOptions] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const categories = settings?.categories || []

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll()
        if (response.data?.success) {
          const activeCategories = (response.data.data || []).filter(c => c.isActive !== false)
          setCategoryOptions(activeCategories)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const getCategoryNameFromLink = (link) => {
    if (!link || typeof link !== 'string') return ''
    try {
      const url = new URL(link, 'http://localhost')
      return url.searchParams.get('category') || ''
    } catch {
      const match = link.match(/[?&]category=([^&]+)/)
      return match ? decodeURIComponent(match[1]) : ''
    }
  }

  const generateCategoryLink = (categoryName) => {
    return `/shop?category=${encodeURIComponent(categoryName)}`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Section Title</label>
          <input
            type="text"
            value={settings?.categorySectionTitle || 'Shop by Category'}
            onChange={(e) => updateSetting('categorySectionTitle', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Shop by Category"
          />
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Section Description</label>
          <textarea
            value={settings?.categorySectionDescription || ''}
            onChange={(e) => updateSetting('categorySectionDescription', e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
            placeholder="Short description for the category section"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Categories (Array)</h3>
        {loadingCategories && (
          <div className="text-center py-6 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
            <p className="font-body-md text-sm mt-2">Loading categories...</p>
          </div>
        )}
        {!loadingCategories && categories.length === 0 ? (
          <EmptyState message="No categories added yet. Add your first category below." />
        ) : (
          <div className="space-y-3 mb-4">
            {categories.map((cat, idx) => (
              <ListCardItem
                key={cat._id || cat.id || idx}
                item={cat}
                index={idx}
                imageField="image"
                onPreview={onPreview && cat.image ? (val) => onPreview(val, cat.name) : undefined}
                fields={[
                  { key: 'name', label: 'Name', placeholder: 'Display name' },
                  { key: 'image', label: 'Image', component: (val, onChange) => (
                    <DualImageInput
                      label="Image"
                      value={val || ''}
                      onChange={(res) => onChange(res.type === 'url' ? res.value : val)}
                      fileInputRef={{ current: { handleUpload: handleFileUpload } }}
                    />
                  )},
                  { key: 'link', label: 'Category', component: (val, onChange) => {
                    const currentCategoryName = getCategoryNameFromLink(val)
                    return (
                      <div className="w-full">
                        <select
                          value={currentCategoryName}
                          onChange={(e) => {
                            onChange(generateCategoryLink(e.target.value))
                          }}
                          className="w-full px-3 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md bg-surface-white cursor-pointer"
                          disabled={loadingCategories}
                        >
                          <option value="">Select a category</option>
                          {categoryOptions.map((opt) => (
                            <option key={opt._id || opt.id || opt.name} value={opt.name}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }},
                ]}
                onChange={(i, key, val) => {
                  const updated = [...(settings.categories || [])]
                  updated[i] = { ...updated[i], [key]: val }
                  updateSetting('categories', updated)
                }}
                onDelete={(i) => deleteItem('categories', i)}
                onToggle={(i, checked) => toggleItem('categories', i, checked)}
                toggleLabel="Display active on homepage"
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => addItem('categories', { name: '', image: '', link: '', isActive: true })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Add New Item Card
        </button>
      </div>
    </div>
  )
}
