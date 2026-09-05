import { useState, useEffect, useRef } from 'react'
import { contentAPI } from '../../services/api'
import { resolveImageUrl } from '../../utils/apiUrl'
import AnnouncementTab from './tabs/AnnouncementTab'
import HeroTab from './tabs/HeroTab'
import CategoriesTab from './tabs/CategoriesTab'
import VideoReelsTab from './tabs/VideoReelsTab'
import FestiveExclusiveTab from './tabs/FestiveExclusiveTab'
import TestimonialsTab from './tabs/TestimonialsTab'
import { Toast, PreviewModal } from './tabs/ContentManagementShared'

const TABS = [
  { id: 'announcement', label: 'Announcement Bar', icon: 'campaign' },
  { id: 'hero', label: 'Hero Slider Section', icon: 'image' },
  { id: 'categories', label: 'Category Navigation', icon: 'category' },
  { id: 'videoReels', label: 'Video Reels Section', icon: 'play_circle' },
  { id: 'festiveExclusive', label: 'Festive Exclusive', icon: 'auto_awesome' },
  { id: 'testimonials', label: 'Homepage Testimonials', icon: 'rate_review' },
]

const DEFAULT_SETTINGS = {
  announcementText: '',
  announcementActive: true,
  announcementBgColor: '#013220',
  announcementTextColor: '#ffffff',
  announcementCtaText: '',
  announcementCtaLink: '/shop',
  heroSectionTitle: '',
  heroSectionSubtitle: '',
  heroSectionDescription: '',
  heroSectionBgImage: '',
   heroSectionCtaText: '',
  heroSectionCtaLink: '',
  heroSectionEnabled: true,
  categorySectionTitle: 'Shop by Category',
  categorySectionDescription: '',
  categories: [],
  videoSectionTitle: 'Watch & Shop',
  videoSectionDescription: '',
  videoReels: [],
  festiveExclusiveImages: [],
  heritageCollectionImages: [],
  homepageTestimonials: [],
  hipChainsSectionTitle: 'The Hip Chain Collection',
  hipChainsSectionDescription: '',
  hipChainsCategoryFilter: 'Hip Chain',
  earringsSectionTitle: 'Exquisite Earrings Selection',
  earringsSectionDescription: '',
  earringsCategoryFilter: 'Earrings',
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('announcement')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewMedia, setPreviewMedia] = useState(null)
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
      const payload = (response.data && typeof response.data === 'object')
        ? response.data
        : {}
      if (payload.success || response.status === 204) {
        setSettings({ ...DEFAULT_SETTINGS, ...(payload.data || {}) })
      } else if (payload.message) {
        setError(payload.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load homepage settings')
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
      const payload = (response.data && typeof response.data === 'object')
        ? response.data
        : {}
      if (response.status === 204 || payload.success) {
        const uploadData = payload.data || payload
        const imageUrl = payload?.url || uploadData?.url || uploadData?.path || uploadData?.fileUrl || (typeof uploadData === 'string' ? uploadData : '')
        if (imageUrl) return resolveImageUrl(imageUrl)
        if (response.status === 204) {
          setError('Upload succeeded, but no image URL was returned. Please try again.')
          return ''
        }
      } else if (payload.message) {
        setError(payload.message)
      }
    } catch (err) {
      console.error('Upload failed:', err)
      const message = err.response?.data?.message || err.message || 'Failed to upload image'
      setError(message)
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

  const confirmDeleteItem = (arrayField, index) => {
    const item = settings[arrayField]?.[index]
    const label = item?.title || item?.name || item?.label || 'this item'
    if (
      window.confirm(
        `Are you sure you want to remove "${label}"?\nThis action cannot be undone.`
      )
    ) {
      deleteItem(arrayField, index)
    }
  }

  const handlePreview = (url, title = 'Preview') => {
    setPreviewMedia({ url, title })
  }

  const handleSaveTab = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await contentAPI.updateHomepageTab(activeTab, settings)
      const payload = (response.data && typeof response.data === 'object')
        ? response.data
        : {}
      const isSuccess = response.status === 204 || payload.success !== false
      if (isSuccess) {
        if (payload.data) setSettings((prev) => ({ ...prev, ...payload.data }))
        setSuccess(`"${TABS.find(t => t.id === activeTab)?.label || 'Tab'}" saved successfully`)
      } else {
        setError(payload.message || 'Failed to save changes')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const tabComponents = {
    announcement: AnnouncementTab,
    hero: HeroTab,
    categories: CategoriesTab,
    videoReels: VideoReelsTab,
    festiveExclusive: FestiveExclusiveTab,
    testimonials: TestimonialsTab,
  }

  const ActiveTabComponent = tabComponents[activeTab]

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
            {ActiveTabComponent && (
              <ActiveTabComponent
                settings={settings}
                updateSetting={updateSetting}
                toggleItem={toggleItem}
                deleteItem={confirmDeleteItem}
                addItem={addItem}
                handleFileUpload={handleFileUpload}
                onPreview={handlePreview}
              />
            )}
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
      <PreviewModal
        isOpen={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        media={previewMedia}
      />
    </div>
  )
}
