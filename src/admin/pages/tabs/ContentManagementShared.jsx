import { useRef, useState } from 'react'
import { resolveImageUrl, resolveVideoUrl } from '../../../utils/apiUrl'

const getVideoSourceType = (url) => {
  if (!url || typeof url !== 'string') return 'video'
  const lowerUrl = url.toLowerCase()
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube'
  if (lowerUrl.includes('pin.it') || lowerUrl.includes('pinterest.com')) return 'pinterest'
  if (/\.(mp4|webm|ogg|mov|avi|mpeg)(\?.*)?$/i.test(lowerUrl)) return 'video'
  return 'video'
}

const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return ''
  const patterns = [
    /youtube\.com\/shorts\/([^/?&]+)/,
    /youtube\.com\/watch\?v=([^/?&]+)/,
    /youtu\.be\/([^/?&]+)/,
    /youtube\.com\/embed\/([^/?&]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
}

const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return ''
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&loop=0&playlist=${videoId}`
}

export const PreviewModal = ({ isOpen, onClose, media }) => {
  if (!isOpen || !media) return null

  const srcType = media.url ? getVideoSourceType(media.url) : 'video'
  const isYouTube = srcType === 'youtube'
  const isPinterest = srcType === 'pinterest'
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(media.url) : ''

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:-top-12 sm:right-0 text-white bg-black/50 sm:bg-transparent rounded-full p-1 sm:p-0 hover:text-gray-300 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {isYouTube ? (
          embedUrl && (
            <iframe
              src={embedUrl}
              title={media.title || 'Video Preview'}
              className="w-full h-[55vh] min-h-[280px] max-h-[600px] rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )
        ) : isPinterest ? (
          <img
            src={resolveImageUrl(media.url)}
            alt={media.title || 'Preview'}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            onError={(e) => {
              e.target.src = 'https://placehold.co/800x600?text=Preview'
            }}
          />
        ) : media.type === 'video' ? (
          <video
            src={resolveVideoUrl(media.url)}
            controls
            autoPlay
            className="w-full h-auto max-h-[80vh] rounded-lg"
          />
        ) : srcType === 'video' && !media.type ? (
          <video
            src={resolveVideoUrl(media.url)}
            controls
            className="w-full h-auto max-h-[80vh] rounded-lg"
          />
        ) : (
          <img
            src={resolveImageUrl(media.url)}
            alt={media.title || 'Preview'}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            onError={(e) => {
              e.target.src = 'https://placehold.co/800x600?text=Preview'
            }}
          />
        )}
      </div>
    </div>
  )
}

export const DualVideoInput = ({ label, value, onChange, fileInputRef }) => {
  const [uploaded, setUploaded] = useState(false)
  const safeValue = typeof value === 'string' ? value : ''
  const hasValue = safeValue.trim() !== ''
  const videoSrc = hasValue ? resolveVideoUrl(safeValue) : ''

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div className="flex-1">
        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
          {label}
        </label>

        <div className="flex flex-col sm:flex-row gap-3 min-w-0">
          <input
            type="text"
            value={safeValue}
            onChange={(e) => {
              setUploaded(false)
              onChange({ type: 'url', value: e.target.value })
            }}
            className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Enter video URL"
          />

          <input
            type="file"
            accept="video/*"
            onChange={async (e) => {
              const file = e.target.files[0]

              if (file) {
                const url = await fileInputRef.current.handleUpload(file, {
                  isVideo: true,
                })

                if (url) {
                  setUploaded(true)
                  onChange({ type: 'url', value: url })
                }
              }

              e.target.value = ''
            }}
            className="text-xs w-full sm:w-auto max-w-full"
          />

          {uploaded && (
            <span className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded bg-green-100 text-green-700 text-xs font-medium whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
              Uploaded
            </span>
          )}
        </div>
      </div>

      {hasValue && (
        <div className="w-16 h-16 rounded overflow-hidden bg-surface-container-low border border-outline-variant/30 flex-shrink-0 flex items-center justify-center">
          {videoSrc ? (
            <video
              src={videoSrc}
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">
              play_circle
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export const DualImageInput = ({ label, value, onChange, fileInputRef }) => {
  const [uploaded, setUploaded] = useState(false)
  const safeValue = typeof value === 'string' ? value : ''

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div className="flex-1">
        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
          {label}
        </label>

        <div className="flex flex-col sm:flex-row gap-3 min-w-0">
          <input
            type="text"
            value={safeValue}
            onChange={(e) => {
              setUploaded(false)
              onChange({ type: 'url', value: e.target.value })
            }}
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

                if (url) {
                  setUploaded(true)
                  onChange({ type: 'url', value: url })
                }
              }

              e.target.value = ''
            }}
            className="text-xs w-full sm:w-auto max-w-full"
          />

          {uploaded && (
            <span className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded bg-green-100 text-green-700 text-xs font-medium whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
              Uploaded
            </span>
          )}
        </div>
      </div>

      {safeValue && safeValue.trim() !== '' && (
        <div className="w-24 h-24 rounded overflow-hidden bg-surface-container-low border border-outline-variant/30 flex-shrink-0 flex flex-col items-center justify-center">
          <img
            src={resolveImageUrl(safeValue)}
            alt="preview"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <span className="text-[10px] font-label-caps text-on-surface-variant mt-1">
            Preview
          </span>
        </div>
      )}
    </div>
  )
}

export const Toast = ({ message, type, onClose }) => {
  if (!message) return null
  return (
    <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 px-3 sm:px-4 py-3 rounded-lg shadow-lg font-body-md text-sm flex items-center gap-2 transition-all ${
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

export const EmptyState = ({ message = 'No content added yet. Add your first item below.' }) => (
  <div className="text-center py-12 text-on-surface-variant">
    <span className="material-symbols-outlined text-4xl mb-3">inventory_2</span>
    <p className="font-body-md text-sm">{message}</p>
  </div>
)

export const ListCardItem = ({ item, index, fields, onChange, onDelete, onToggle, onPreview, toggleLabel = 'Active', imageField }) => {
  const thumbValue = imageField ? item[imageField] : null
  const safeThumbValue = typeof thumbValue === 'string' ? thumbValue : ''
  const hasThumb = safeThumbValue.trim() !== ''

  return (
    <div className="p-3 sm:p-4 bg-surface-white rounded-lg border border-outline-variant/50">
      {hasThumb && (
        <div className="mb-4">
          <div className="w-20 h-20 rounded overflow-hidden bg-surface-container-low border border-outline-variant/30">
            <img
              src={resolveImageUrl(safeThumbValue)}
              alt="thumb"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
        {fields.map((field) => (
          <div key={field.key} className={field.fullWidth ? 'sm:col-span-2 xl:col-span-3' : ''}>
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
                value={item[field.key] ?? ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={field.placeholder || ''}
              />
            ) : field.type === 'select' ? (
              <select
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md bg-surface-white"
              >
                {(field.options || []).map((option) => (
                  <option key={option.value ?? option} value={option.value ?? option}>
                    {option.label ?? option}
                  </option>
                ))}
              </select>
            ) : field.type === 'custom' ? (
              field.render(item, index, onChange)
            ) : (
              <input
                type="text"
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={field.placeholder || ''}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 mt-4 border-t border-outline-variant/30">
        {onToggle && (
          <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(item.isActive)}
              onChange={(e) => onToggle(index, e.target.checked)}
              className="w-4 h-4 accent-deep-emerald"
            />
            {toggleLabel}
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {onPreview && hasThumb && (
            <button
              type="button"
              onClick={() => onPreview(item)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm border border-outline-variant rounded hover:border-deep-emerald hover:text-deep-emerald transition-colors"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(index)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm border border-error-container/40 text-error rounded hover:bg-error-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}



