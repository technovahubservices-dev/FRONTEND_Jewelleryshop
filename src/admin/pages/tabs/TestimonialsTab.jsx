import { DualImageInput, ListCardItem, EmptyState } from './ContentManagementShared'

export default function TestimonialsTab({ settings, updateSetting, toggleItem, deleteItem, addItem, handleFileUpload, onPreview }) {
  const testimonials = settings?.homepageTestimonials || []

  return (
    <div className="space-y-6">
      <div className="pt-4 border-t border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Homepage Testimonials (Array)</h3>
        {testimonials.length === 0 ? (
          <EmptyState message="No testimonials added yet. Add your first testimonial below." />
        ) : (
          <div className="space-y-3 mb-4">
            {testimonials.map((t, idx) => (
              <ListCardItem
                key={t._id || t.id || idx}
                item={t}
                index={idx}
                imageField="image"
                onPreview={onPreview && t.image ? (val) => onPreview(val, t.name) : undefined}
                fields={[
                  { key: 'name', label: 'Name', placeholder: 'Customer name' },
                  { key: 'location', label: 'Location', placeholder: 'City, Country' },
                  { key: 'content', label: 'Content', type: 'textarea', placeholder: 'Testimonial content', fullWidth: true },
                  { key: 'rating', label: 'Rating', type: 'number', placeholder: '5' },
                  { key: 'image', label: 'Image', component: (val, onChange) => (
                    <DualImageInput
                      label="Image"
                      value={val || ''}
                      onChange={(res) => onChange(res.type === 'url' ? res.value : val)}
                      fileInputRef={{ current: { handleUpload: handleFileUpload } }}
                    />
                  )},
                ]}
                onChange={(i, key, val) => {
                  const updated = [...(settings.homepageTestimonials || [])]
                  updated[i] = { ...updated[i], [key]: val }
                  updateSetting('homepageTestimonials', updated)
                }}
                onDelete={(i) => deleteItem('homepageTestimonials', i)}
                onToggle={(i, checked) => toggleItem('homepageTestimonials', i, checked)}
                toggleLabel="Display active on homepage"
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => addItem('homepageTestimonials', { name: '', location: '', content: '', rating: 5, image: '', isActive: true })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Add New Item Card
        </button>
      </div>
    </div>
  )
}
