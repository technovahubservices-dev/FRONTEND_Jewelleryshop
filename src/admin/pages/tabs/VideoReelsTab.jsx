import { DualVideoInput, DualImageInput, ListCardItem, EmptyState } from './ContentManagementShared'

export default function VideoReelsTab({ settings, updateSetting, toggleItem, deleteItem, addItem, handleFileUpload, onPreview }) {
  const videoReels = settings?.videoReels || []

  return (
    <div className="space-y-6">
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
                  { key: 'videoUrl', label: 'Video URL', component: (val, onChange) => (
                    <DualVideoInput
                      label="Video"
                      value={val || ''}
                      onChange={(res) => onChange(res.type === 'url' ? res.value : val)}
                      fileInputRef={{ current: { handleUpload: handleFileUpload } }}
                    />
                  )},
                  { key: 'sku', label: 'SKU Code', placeholder: 'Enter product SKU' },
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
          onClick={() => addItem('videoReels', { videoUrl: '', sku: '', thumbnail: '', isActive: true })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Add New Item Card
        </button>
      </div>
    </div>
  )
}
