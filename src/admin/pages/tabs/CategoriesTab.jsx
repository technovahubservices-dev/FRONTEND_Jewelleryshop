import { DualImageInput, ListCardItem, EmptyState } from './ContentManagementShared'

export default function CategoriesTab({ settings, updateSetting, toggleItem, deleteItem, addItem, handleFileUpload, onPreview }) {
  const categories = settings?.categories || []

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
        {categories.length === 0 ? (
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
                  { key: 'name', label: 'Name', placeholder: 'Category name' },
                  { key: 'image', label: 'Image', component: (val, onChange) => (
                    <DualImageInput
                      label="Image"
                      value={val || ''}
                      onChange={(res) => onChange(res.type === 'url' ? res.value : val)}
                      fileInputRef={{ current: { handleUpload: handleFileUpload } }}
                    />
                  )},
                  { key: 'link', label: 'Link', placeholder: '/shop?category=rings' },
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
