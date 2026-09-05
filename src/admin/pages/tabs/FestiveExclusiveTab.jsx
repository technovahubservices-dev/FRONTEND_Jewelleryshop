import { DualImageInput, ListCardItem, EmptyState } from './ContentManagementShared'

export default function FestiveExclusiveTab({ settings, updateSetting, toggleItem, deleteItem, addItem, handleFileUpload, onPreview }) {
  const festiveImages = settings?.festiveExclusiveImages || []

  return (
    <div className="space-y-6">
      <div className="pt-4 border-t border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Festive Exclusive Slides (Array)</h3>
        {festiveImages.length === 0 ? (
          <EmptyState message="No festive exclusive slides added yet. Add your first slide below." />
        ) : (
          <div className="space-y-3 mb-4">
            {festiveImages.map((img, idx) => (
              <ListCardItem
                key={img._id || img.id || idx}
                item={img}
                index={idx}
                imageField="image"
                onPreview={onPreview && img.image ? (val) => onPreview(val, img.title) : undefined}
                fields={[
                  { key: 'title', label: 'Title', placeholder: 'Slide title' },
                  { key: 'link', label: 'Link', placeholder: '/shop' },
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
                  const updated = [...(settings.festiveExclusiveImages || [])]
                  updated[i] = { ...updated[i], [key]: val }
                  updateSetting('festiveExclusiveImages', updated)
                }}
                onDelete={(i) => deleteItem('festiveExclusiveImages', i)}
                onToggle={(i, checked) => toggleItem('festiveExclusiveImages', i, checked)}
                toggleLabel="Display active on homepage"
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => addItem('festiveExclusiveImages', { image: '', title: '', link: '', isActive: true })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Add New Item Card
        </button>
      </div>
    </div>
  )
}
