import { DualImageInput, ListCardItem, EmptyState } from './ContentManagementShared'

export default function HeroTab({ settings, updateSetting, toggleItem, deleteItem, addItem, handleFileUpload, onPreview }) {
  const heroSlides = settings?.heroSlides || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.heroSectionEnabled !== undefined ? settings.heroSectionEnabled : true}
                onChange={(e) => updateSetting('heroSectionEnabled', e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
              />
              <span className="font-body-md text-sm text-on-surface">Enable Hero Section</span>
            </label>
          </div>
        </div>
        <div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Section Title</label>
          <input
            type="text"
            value={settings?.heroSectionTitle || ''}
            onChange={(e) => updateSetting('heroSectionTitle', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Main hero heading"
          />
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Subtitle</label>
          <input
            type="text"
            value={settings?.heroSectionSubtitle || ''}
            onChange={(e) => updateSetting('heroSectionSubtitle', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Subtitle"
          />
        </div>
      </div>
      <div>
        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Description</label>
        <textarea
          value={settings?.heroSectionDescription || ''}
          onChange={(e) => updateSetting('heroSectionDescription', e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
          placeholder="Hero description"
        />
      </div>

      <div>
        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Background Image</label>
        <DualImageInput
          label="Background Image"
          value={settings?.heroSectionBgImage || ''}
          onChange={(val) => {
            if (val.type === 'url') updateSetting('heroSectionBgImage', val.value)
          }}
          fileInputRef={{ current: { handleUpload: handleFileUpload } }}
        />
        {settings?.heroSectionBgImage && onPreview && (
          <button
            type="button"
            onClick={() => onPreview(settings.heroSectionBgImage, 'Hero Background')}
            className="mt-2 p-2 text-on-surface-variant hover:bg-surface-container-low rounded transition-colors text-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            Preview
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Text</label>
          <input
            type="text"
            value={settings?.heroSectionCtaText || 'Explore Collection'}
            onChange={(e) => updateSetting('heroSectionCtaText', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="e.g. Explore Collection"
          />
        </div>
        <div>
          <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Link</label>
          <input
            type="text"
            value={settings?.heroSectionCtaLink || '/shop'}
            onChange={(e) => updateSetting('heroSectionCtaLink', e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="e.g. /shop"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Hero Slides (Array)</h3>
        {heroSlides.length === 0 ? (
          <EmptyState message="No hero slides added yet. Add your first slide below." />
        ) : (
          <div className="space-y-3 mb-4">
            {heroSlides.map((slide, idx) => (
              <ListCardItem
                key={slide.id || idx}
                item={slide}
                index={idx}
                imageField="image"
                onPreview={onPreview && slide.image ? (val) => onPreview(val, slide.title) : undefined}
                fields={[
                  { key: 'title', label: 'Title', placeholder: 'Slide title' },
                  { key: 'subtitle', label: 'Subtitle', placeholder: 'Slide subtitle' },
                  { key: 'image', label: 'Image URL', component: (val, onChange) => (
                    <DualImageInput
                      label="Image URL"
                      value={val || ''}
                      onChange={(res) => onChange(res.type === 'url' ? res.value : val)}
                      fileInputRef={{ current: { handleUpload: handleFileUpload } }}
                    />
                  )},
                  { key: 'link', label: 'Link', placeholder: '/shop' },
                ]}
                onChange={(i, key, val) => {
                  const updated = [...(settings.heroSlides || [])]
                  updated[i] = { ...updated[i], [key]: val }
                  updateSetting('heroSlides', updated)
                }}
                onDelete={(i) => deleteItem('heroSlides', i)}
                onToggle={(i, checked) => toggleItem('heroSlides', i, checked)}
                toggleLabel="Display active on homepage"
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => addItem('heroSlides', { title: '', subtitle: '', image: '', link: '', isActive: true })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          + Add New Item Card
        </button>
      </div>
    </div>
  )
}
