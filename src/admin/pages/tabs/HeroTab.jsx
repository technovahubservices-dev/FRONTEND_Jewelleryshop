import { EmptyState, ListCardItem } from './ContentManagementShared'

export default function HeroTab({
  settings,
  updateSetting,
  toggleItem,
  deleteItem,
  addItem,
  handleFileUpload,
  onPreview,
}) {
  const heroSlides = settings?.heroSlides || []

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadedUrl = await handleFileUpload(file)

    if (uploadedUrl) {
      updateSetting('heroSectionBgImage', uploadedUrl)
    }

    e.target.value = ''
  }

  const handleSlideImageUpload = async (e, onChange) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadedUrl = await handleFileUpload(file)

    if (uploadedUrl) {
      onChange(uploadedUrl)
    }

    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      {/* Hero Section Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  settings?.heroSectionEnabled !== undefined
                    ? settings.heroSectionEnabled
                    : true
                }
                onChange={(e) =>
                  updateSetting('heroSectionEnabled', e.target.checked)
                }
                className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
              />

              <span className="font-body-md text-sm text-on-surface">
                Enable Hero Section
              </span>
            </label>
          </div>
        </div>

        <div></div>
      </div>

      {/* Background Image */}
      <div className="space-y-3">
        <label className="block font-label-caps text-xs text-on-surface-variant">
          Background Image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-deep-emerald file:text-surface-white file:font-label-caps file:text-xs hover:file:bg-deep-emerald/90"
        />

        {settings?.heroSectionBgImage && (
          <div className="flex items-start gap-3">
            <img
              src={settings.heroSectionBgImage}
              alt="Hero background preview"
              className="w-full max-w-md h-40 object-cover rounded-lg border border-outline-variant/30"
            />

            {onPreview && (
              <button
                type="button"
                onClick={() =>
                  onPreview(
                    settings.heroSectionBgImage,
                    'Hero Background'
                  )
                }
                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded transition-colors text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  visibility
                </span>
                Preview
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hero Slides */}
      <div className="pt-6 border-t border-outline-variant/30">
        <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">
          Hero Slides
        </h3>

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
                onPreview={
                  onPreview && slide.image
                    ? (val) => onPreview(val, slide.title)
                    : undefined
                }
                fields={[
                  {
                    key: 'image',
                    label: 'Image',
                    component: (val, onChange) => (
                      <div className="space-y-3">
                        <label className="block font-label-caps text-xs text-on-surface-variant">
                          Image
                        </label>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleSlideImageUpload(e, onChange)
                          }
                          className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-deep-emerald file:text-surface-white file:font-label-caps file:text-xs hover:file:bg-deep-emerald/90"
                        />

                        {val && (
                          <div className="flex items-start gap-3">
                            <img
                              src={val}
                              alt="Hero slide preview"
                              className="w-full max-w-md h-40 object-cover rounded-lg border border-outline-variant/30"
                            />

                            {onPreview && (
                              <button
                                type="button"
                                onClick={() =>
                                  onPreview(
                                    val,
                                    slide.title || 'Hero Slide'
                                  )
                                }
                                className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded transition-colors text-xs flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  visibility
                                </span>
                                Preview
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
                onChange={(i, key, val) => {
                  const updated = [...(settings.heroSlides || [])]
                  updated[i] = { ...updated[i], [key]: val }
                  updateSetting('heroSlides', updated)
                }}
                onDelete={(i) => deleteItem('heroSlides', i)}
                onToggle={(i, checked) =>
                  toggleItem('heroSlides', i, checked)
                }
                toggleLabel="Display active on homepage"
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            addItem('heroSlides', {
              image: '',
              isActive: true,
            })
          }
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            add
          </span>
          + Add New Item Card
        </button>
      </div>
    </div>
  )
}