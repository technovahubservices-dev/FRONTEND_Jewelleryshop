import { useState, useEffect, useRef } from 'react'
import { contentAPI, videoReelsAPI } from '../../services/api'
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
  heroSectionBgImage: '',
   heroSectionEnabled: true,
  categorySectionTitle: 'Shop by Category',
  categorySectionDescription: '',
  categories: [],
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

  const handleFileUpload = async (file, options = {}) => {
    if (!file) return ''
    const formData = new FormData()
    formData.append('file', file)
    if (process.env.NODE_ENV === 'development') {
      for (const [key, value] of formData.entries()) {
        console.log(
          '[Upload FormData]',
          key,
          value instanceof File
            ? { name: value.name, type: value.type, size: value.size }
            : value
        )
      }
    }
    try {
      if (options.isVideo) {
        const response = await videoReelsAPI.upload(formData)
        const payload = (response.data && typeof response.data === 'object')
          ? response.data
          : {}
        if (response.status === 201 || response.status === 200 || payload.success) {
          const reels = payload?.data?.videoReels
          const lastReel = Array.isArray(reels) && reels.length > 0
            ? reels[reels.length - 1]
            : null
          const videoUrl = lastReel?.videoUrl
          if (videoUrl) return videoUrl
          setError('Upload succeeded, but no video URL was returned. Please try again.')
          return ''
        } else if (payload.message) {
          setError(payload.message)
        }
      } else {
        const response = await (options.useGenericMedia ? contentAPI.uploadHomepageMedia(formData) : contentAPI.uploadHomepageImage(formData))
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
      }
    } catch (err) {
  console.error('Upload failed:', err)
  console.error('Upload status:', err.response?.status)
  console.error('Upload response:', err.response?.data)

  const message =
    err.response?.data?.message ||
    err.message ||
    'Failed to upload image'

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
    console.log('SAVE BUTTON CLICKED')
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const tabPayload =
  activeTab === 'announcement'
    ? {
        announcementText: settings.announcementText,
        announcementActive: settings.announcementActive,
        announcementBgColor: settings.announcementBgColor,
        announcementTextColor: settings.announcementTextColor,
      }
    : settings

const response = await contentAPI.updateHomepageTab(activeTab, tabPayload)
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
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="w-full max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-playfair text-deep-emerald font-bold mb-1">
              Content Management
            </h1>
            <p className="text-sm text-on-surface-variant">
              Manage homepage configuration and content sections.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm mb-5 flex items-start sm:items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">

            {/* Left Navigation */}
            <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
              <div className="bg-surface-white border border-outline-variant/30 rounded-xl p-2 shadow-sm">
                <div className="px-3 py-3 border-b border-outline-variant/20 mb-2">
                  <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wide">
                    Content Sections
                  </p>
                </div>

                <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setError('')
                        setSuccess('')
                      }}
                      className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-deep-emerald text-surface-white shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-deep-emerald'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          activeTab === tab.id
                            ? 'text-surface-white'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {tab.icon}
                      </span>

                      <span className="font-label-caps text-xs sm:text-sm whitespace-nowrap">
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Right Content Area */}
            <main className="flex-1 min-w-0 w-full">
              <div className="bg-surface-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">

                {/* Active Section Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-deep-emerald/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-deep-emerald text-xl">
                        {TABS.find((tab) => tab.id === activeTab)?.icon}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg sm:text-xl font-playfair text-deep-emerald font-semibold">
                        {TABS.find((tab) => tab.id === activeTab)?.label}
                      </h2>
                      <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                        Manage this homepage section.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6 lg:p-7 mb-24">
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
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Fixed Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-white border-t border-outline-variant/50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 shadow-lg z-40">
        <div className="w-full max-w-[1600px] mx-auto flex justify-stretch sm:justify-end">
          <button
            onClick={handleSaveTab}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps text-sm rounded-lg transition-all duration-200 hover:bg-deep-emerald/90 active:scale-95 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  save
                </span>
                Save Active Module Changes
              </>
            )}
          </button>
        </div>
      </div>

      <Toast
        message={success}
        type="success"
        onClose={() => setSuccess('')}
      />

      <PreviewModal
        isOpen={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        media={previewMedia}
      />
    </div>
  )
}


