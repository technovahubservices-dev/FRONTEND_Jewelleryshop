import { useState, useEffect, useRef } from 'react'
import { contentAPI, productAPI } from '../../services/api'

const TABS = [
  { id: 'announcement', label: 'Announcement Bar', icon: 'campaign' },
  { id: 'hero', label: 'Hero Slider Section', icon: 'image' },
  { id: 'categories', label: 'Category Navigation', icon: 'category' },
  { id: 'videoReels', label: 'Video Reels Section', icon: 'play_circle' },
  { id: 'festiveExclusive', label: 'Festive Exclusive', icon: 'auto_awesome' },
  { id: 'testimonials', label: 'Homepage Testimonials', icon: 'rate_review' },
]

const DEFAULT_SETTINGS = {
  announcementText: 'welcome to jkr. 10% offer earrings! 20% offer Rings!.. 10% offer Necklace!....',
  announcementActive: true,
  announcementBgColor: '#013220',
  announcementTextColor: '#ffffff',
  announcementCtaText: '',
  announcementCtaLink: '/shop',
  heroSectionTitle: '',
  heroSectionSubtitle: '',
  heroSectionDescription: '',
  heroSectionBgImage: '',
  heroSectionCtaText: 'Explore Collection',
  heroSectionCtaLink: '/shop',
  categorySectionTitle: 'Shop by Category',
  categorySectionDescription: '',
  categories: [],
  videoSectionTitle: 'Watch & Shop',
  videoSectionDescription: '',
  videoReels: [],
  festiveExclusiveImages: [],
  homepageTestimonials: [],
  hipChainsSectionTitle: 'The Hip Chain Collection',
  hipChainsSectionDescription: '',
  hipChainsCategoryFilter: 'Hip Chain',
  earringsSectionTitle: 'Exquisite Earrings Selection',
  earringsSectionDescription: '',
  earringsCategoryFilter: 'Earrings',
}

const DualImageInput = ({ label, value, onChange, fileInputRef }) => {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">{label}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange({ type: 'url', value: e.target.value })}
            className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Enter image URL"
          />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0]
              if (file) {
                const url = await fileInputRef.current.handleUpload(file)
                onChange({ type: 'url', value: url })
              }
            }}
            className="text-xs"
          />
        </div>
      </div>
      {(value || '') && value.trim() !== '' && (
        <div className="w-16 h-16 rounded overflow-hidden bg-surface-container-low border border-outline-variant/30 flex-shrink-0">
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  )
}

const Toast = ({ message, type, onClose }) => {
  if (!message) return null
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg font-body-md text-sm flex items-center gap-2 transition-all ${
      type === 'success' ? 'bg-primary-container text-primary-container-fg' : 'bg-error-container text-error-container-fg'
    }`}>
      <span className="material-symbols-outlined text-sm">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  )
}

const ListCardItem = ({ item, index, fields, onChange, onDelete, onToggle, toggleLabel = 'Active' }) => {
  return (
    <div className="p-4 bg-surface-white rounded-lg border border-outline-variant/50">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        {fields.map((field) => (
          <div key={field.key} className={field.fullWidth ? 'md:col-span-6' : 'md:col-span-2'}>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                placeholder={field.placeholder || ''}
              />
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={field.placeholder || ''}
              />
            ) : field.type === 'toggle' ? null : field.component ? (
              field.component(item[field.key], (val) => onChange(index, field.key, val))
            ) : (
              <input
                type={field.type || 'text'}
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={field.placeholder || ''}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-6 flex items-end gap-4 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`active-${index}`}
              checked={item.isActive !== undefined ? item.isActive : true}
              onChange={(e) => onToggle(index, e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
            />
            <label htmlFor={`active-${index}`} className="font-body-md text-sm text-on-surface cursor-pointer">
              {toggleLabel}
            </label>
          </div>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-2 text-error hover:bg-error/10 rounded transition-colors"
            title="Remove item"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('announcement')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const uploadFileInputRef = useRef(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const fetchSettings = async () => {
    try {
      const response = await contentAPI.getHomepageSettings()
      if (response.data.success) {
        setSettings({ ...DEFAULT_SETTINGS, ...response.data.data })
      }
    } catch (err) {
      setError('Failed to load homepage settings')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return ''
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await contentAPI.uploadHomepageImage(formData)
      if (response.data.success) {
        return response.data.url
      }
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload image')
    }
    return ''
  }

  const updateSetting = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const toggleItem = (arrayField, index, checked) => {
    setSettings((prev) => {
      const arr = [...(prev[arrayField] || [])]
      if (arr[index]) arr[index].isActive = checked
      return { ...prev, [arrayField]: arr }
    })
  }

  const deleteItem = (arrayField, index) => {
    setSettings((prev) => ({
      ...prev,
      [arrayField]: (prev[arrayField] || []).filter((_, i) => i !== index),
    }))
  }

  const addItem = (arrayField, newItem) => {
    setSettings((prev) => ({
      ...prev,
      [arrayField]: [...(prev[arrayField] || []), { id: Date.now(), ...newItem }],
    }))
  }

  const handleSaveTab = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await contentAPI.updateHomepageTab(activeTab, settings)
      if (response.data.success) {
        setSettings(response.data.data)
        setSuccess(`"${TABS.find(t => t.id === activeTab)?.label || 'Tab'}" saved successfully`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'announcement':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Announcement Text</label>
                <input
                  type="text"
                  value={settings?.announcementText || ''}
                  onChange={(e) => updateSetting('announcementText', e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Enter announcement text"
                />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.announcementActive !== undefined ? settings.announcementActive : true}
                      onChange={(e) => updateSetting('announcementActive', e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
                    />
                    <span className="font-body-md text-sm text-on-surface">Show Announcement Bar</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Background Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings?.announcementBgColor || '#013220'}
                    onChange={(e) => updateSetting('announcementBgColor', e.target.value)}
                    className="w-12 h-10 p-0 border border-outline-variant rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings?.announcementBgColor || '#013220'}
                    onChange={(e) => updateSetting('announcementBgColor', e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Text Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings?.announcementTextColor || '#ffffff'}
                    onChange={(e) => updateSetting('announcementTextColor', e.target.value)}
                    className="w-12 h-10 p-0 border border-outline-variant rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings?.announcementTextColor || '#ffffff'}
                    onChange={(e) => updateSetting('announcementTextColor', e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Text</label>
                <input
                  type="text"
                  value={settings?.announcementCtaText || ''}
                  onChange={(e) => updateSetting('announcementCtaText', e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="e.g. Shop Now"
                />
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">CTA Link</label>
                <input
                  type="text"
                  value={settings?.announcementCtaLink || '/shop'}
                  onChange={(e) => updateSetting('announcementCtaLink', e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="e.g. /shop"
                />
              </div>
            </div>
          </div>
        )
      case 'hero':
        return (
          <div className="space-y-6">
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

            <DualImageInput
              label="Background Image"
              value={settings?.heroSectionBgImage || ''}
              onChange={(val) => {
                if (val.type === 'url') updateSetting('heroSectionBgImage', val.value)
              }}
              fileInputRef={{ current: { handleUpload: handleFileUpload } }}
            />

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
              <div className="space-y-3 mb-4">
                {(settings.heroSlides || []).map((slide, idx) => (
                  <ListCardItem
                    key={slide.id || idx}
                    item={slide}
                    index={idx}
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
                    onDelete={(i) => {
                      const updated = (settings.heroSlides || []).filter((_, j) => j !== i)
                      updateSetting('heroSlides', updated)
                    }}
                    onToggle={(i, checked) => toggleItem('heroSlides', i, checked)}
                    toggleLabel="Display active on homepage"
                  />
                ))}
              </div>
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
      case 'categories':
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
              <div className="space-y-3 mb-4">
                {(settings.categories || []).map((cat, idx) => (
                  <ListCardItem
                    key={cat._id || cat.id || idx}
                    item={cat}
                    index={idx}
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
      case 'videoReels':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              <div className="space-y-3 mb-4">
                {(settings.videoReels || []).map((reel, idx) => (
                  <ListCardItem
                    key={reel._id || reel.id || idx}
                    item={reel}
                    index={idx}
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
      case 'festiveExclusive':
        return (
          <div className="space-y-6">
            <div className="pt-4 border-t border-outline-variant/30">
              <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Festive Exclusive Slides (Array)</h3>
              <div className="space-y-3 mb-4">
                {(settings.festiveExclusiveImages || []).map((img, idx) => (
                  <ListCardItem
                    key={img._id || img.id || idx}
                    item={img}
                    index={idx}
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
      case 'testimonials':
        return (
          <div className="space-y-6">
            <div className="pt-4 border-t border-outline-variant/30">
              <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Homepage Testimonials (Array)</h3>
              <div className="space-y-3 mb-4">
                {(settings.homepageTestimonials || []).map((t, idx) => (
                  <ListCardItem
                    key={t._id || t.id || idx}
                    item={t}
                    index={idx}
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
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low">
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">progress_activity</span>
            <p className="font-body-md text-sm text-on-surface-variant mt-2">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low w-full">
      <div className="w-full px-4 md:px-6 lg:px-8 py-4">
        <div className="p-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-playfair text-deep-emerald font-bold mb-1">Content Management</h1>
              <p className="text-sm text-on-surface-variant">Manage homepage configuration via tabbed interface.</p>
            </div>
          </div>

          <div className="border-b border-outline-variant/30 mb-6 overflow-x-auto">
            <nav className="flex gap-2 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setError('')
                    setSuccess('')
                  }}
                  className={`flex items-center gap-2 px-5 py-3 font-label-caps text-label-caps text-sm rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-deep-emerald border-deep-emerald bg-surface-white'
                      : 'text-on-surface-variant border-transparent hover:text-deep-emerald hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {error && (
            <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <div className="bg-surface-white p-6 rounded-xl border border-outline-variant/30 mb-24">
            {renderTabContent()}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-surface-white border-t border-outline-variant/50 px-6 py-4 shadow-lg z-40">
            <div className="max-w-7xl mx-auto flex justify-end">
              <button
                onClick={handleSaveTab}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps text-sm rounded-lg transition-all duration-200 hover:bg-deep-emerald/90 active:scale-95 shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    Save Active Module Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast message={success} type="success" onClose={() => setSuccess('')} />
    </div>
  )
}
