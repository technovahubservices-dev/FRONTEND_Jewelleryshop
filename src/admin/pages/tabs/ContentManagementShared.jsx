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
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {isYouTube ? (
          embedUrl && (
            <iframe
              src={embedUrl}
              title={media.title || 'Video Preview'}
              className="w-full h-[500px] md:h-[600px] rounded-lg"
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

export const DualImageInput = ({ label, value, onChange, fileInputRef }) => {
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
                if (url) onChange({ type: 'url', value: url })
              }
            }}
            className="text-xs"
          />
        </div>
      </div>
      {(value || '') && value.trim() !== '' && (
        <div className="w-16 h-16 rounded overflow-hidden bg-surface-container-low border border-outline-variant/30 flex-shrink-0">
          <img
            src={resolveImageUrl(value)}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  )
}

export const Toast = ({ message, type, onClose }) => {
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

export const EmptyState = ({ message = 'No content added yet. Add your first item below.' }) => (
  <div className="text-center py-12 text-on-surface-variant">
    <span className="material-symbols-outlined text-4xl mb-3">inventory_2</span>
    <p className="font-body-md text-sm">{message}</p>
  </div>
)

export const ListCardItem = ({ item, index, fields, onChange, onDelete, onToggle, onPreview, toggleLabel = 'Active', imageField }) => {
  const thumbValue = imageField ? item[imageField] : null
  const hasThumb = (thumbValue || '') && thumbValue.trim() !== ''

  return (
    <div className="p-4 bg-surface-white rounded-lg border border-outline-variant/50">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        {hasThumb && (
          <div className="md:col-span-1 flex-shrink-0">
            <div className="w-20 h-20 rounded overflow-hidden bg-surface-container-low border border-outline-variant/30">
              <img
                src={resolveImageUrl(thumbValue)}
                alt="thumb"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        )}

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

          {onPreview && hasThumb && (
            <button
              type="button"
              onClick={() => onPreview(thumbValue)}
              className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded transition-colors"
              title="Preview image"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
            </button>
          )}

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
