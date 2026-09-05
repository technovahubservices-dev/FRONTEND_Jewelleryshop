import { DualImageInput, ListCardItem, EmptyState } from './ContentManagementShared'

export default function VideoReelsTab({ settings, updateSetting, toggleItem, deleteItem, addItem, handleFileUpload, onPreview }) {
  const videoReels = settings?.videoReels || []

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Section Title</label>
          <input
            type="text"
            value={settings?.videoSectionTitle || 'Watch & Shop'}
            onChange={(e) => updateSetting('videoSectionTitle', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Watch & Shop"
          />
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Section Description</label>
          <textarea
            value={settings?.videoSectionDescription || ''}
            onChange={(e) => updateSetting('videoSectionDescription', e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
            placeholder="Short description for the video section"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Video Reels (Array)</h3>
        {videoReels.length === 0 ? (
          <EmptyState message="No video reels added yet. Add your first reel below." />
        ) : (
          <div className="space-y-3 mb-4">
            {videoReels.map((reel, idx) => (
              <ListCardItem
                key={reel._id || reel.id || idx}
                item={reel}
                index={idx}
                imageField="thumbnail"
                onPreview={onPreview && reel.videoUrl ? (val) => onPreview(val, reel.title) : undefined}
                fields={[
                  { key: 'title', label: 'Title', placeholder: 'Reel title' },
                  { key: 'videoUrl', label: 'Video URL', placeholder: 'https://...' },
                  { key: 'price', label: 'Price', placeholder: '₹ 4,999' },
                  { key: 'shopLink', label: 'Shop Link', placeholder: '/shop' },
                  { key: 'thumbnail', label: 'Thumbnail', component: (val, onChange) => (
                    <DualImageInput
                      label="Thumbnail"
                      value={val || ''}
                      onChange={(res) => onChange(res.type === 'url' ? res.value : val)}
                      fileInputRef={{ current: { handleUpload: handleFileUpload } }}
                    />
                  )},
                ]}
                onChange={(i, key, val) => {
                  const updated = [...(settings.videoReels || [])]
                  updated[i] = { ...updated[i], [key]: val }
                  updateSetting('videoReels', updated)
                }}
                onDelete={(i) => deleteItem('videoReels', i)}
                onToggle={(i, checked) => toggleItem('videoReels', i, checked)}
                toggleLabel="Display active on homepage"
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => addItem('videoReels', { title: '', videoUrl: '', price: '', shopLink: '/shop', thumbnail: '', isActive: true })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Add New Item Card
        </button>
      </div>
    </div>
  )
}
