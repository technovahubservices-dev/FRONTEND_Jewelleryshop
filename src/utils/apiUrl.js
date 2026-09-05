const stripTrailingSlash = (value) => value?.replace(/\/+$/, '')

/**
 * Extract the Google Drive file ID from any common Drive URL format.
 *
 * Handles:
 *   /file/d/FILE_ID/view
 *   ?id=FILE_ID
 *   /uc?id=FILE_ID
 *   /thumbnail?id=FILE_ID
 */
const getGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return ''

  const value = url.trim()

  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/uc\?.*?[?&]id=([a-zA-Z0-9_-]+)/,
    /\/thumbnail\?.*?[?&]id=([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }

  return ''
}

/**
 * Detect whether a URL belongs to Google Drive.
 */
const isGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  return (
    url.includes('drive.google.com') ||
    url.includes('docs.google.com')
  )
}

/**
 * Convert any Google Drive share/link URL into a direct, hot-linkable
 * URL suitable for <img> tags.
 *
 * - thumbnail URLs are preserved as-is (they already serve images)
 * - /uc? URLs are preserved (already direct)
 * - /file/d/ and ?id= URLs are converted to thumbnail URLs (best for <img>)
 */
const getGoogleDriveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return ''

  const value = url.trim()

  if (!isGoogleDriveUrl(value)) return value

  const fileId = getGoogleDriveFileId(value)
  if (!fileId) return value

  // Already a direct thumbnail URL – preserve it.
  if (value.includes('/thumbnail')) return value

  // Already a direct uc? URL – preserve it.
  if (value.includes('/uc?')) return value

  // Convert file/d or open?id URL to a thumbnail URL.
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
}

/**
 * Convert any Google Drive share/link URL into a direct, hot-linkable
 * URL suitable for <video> tags.
 *
 * Uses /uc?export=view&id=… which supports byte-range streaming.
 */
const getGoogleDriveVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return ''

  const value = url.trim()

  if (!isGoogleDriveUrl(value)) return value

  const fileId = getGoogleDriveFileId(value)
  if (!fileId) return value

  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

export const getBackendOrigin = () => {
  const configuredUrl = stripTrailingSlash(import.meta.env.VITE_API_URL)

  if (!configuredUrl) {
    return 'http://localhost:5000'
  }

  return configuredUrl.replace(/\/api$/, '')
}

export const getApiBaseUrl = () => {
  const configuredUrl = stripTrailingSlash(import.meta.env.VITE_API_URL)

  if (!configuredUrl) {
    return '/api'
  }

  return configuredUrl.endsWith('/api') ? configuredUrl : `${configuredUrl}/api`
}

/**
 * Normalise a path into a fully-qualified URL.
 *
 * - Absolute URLs (http/https) are returned as-is.
 * - Protocol-relative URLs (//) are returned as-is.
 * - Relative paths are prefixed with the backend origin.
 *
 * Google Drive conversion is NOT done here — use resolveImageUrl /
 * resolveVideoUrl for that so image vs video formats can differ.
 */
export const getMediaUrl = (path) => {
  if (!path || typeof path !== 'string') return ''

  const trimmed = path.trim()
  if (trimmed === '') return ''

  if (/^https?:\/\//i.test(trimmed) || /^\/\//.test(trimmed)) {
    return trimmed
  }

  const origin = getBackendOrigin()
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`
  }

  return `${origin}/${trimmed}`
}

/**
 * Single reusable media resolver for images.
 *
 * Combines getMediaUrl (relative → absolute backend URL) with
 * getGoogleDriveImageUrl (Google Drive share link → direct thumbnail URL).
 *
 * Never prepends the backend origin to an already-absolute Google Drive URL.
 */
export const resolveImageUrl = (path) => {
  if (!path) return ''

  try {
    const mediaUrl = getMediaUrl(path)
    return getGoogleDriveImageUrl(mediaUrl)
  } catch (error) {
    console.error('Failed to resolve image URL:', path, error)
    return typeof path === 'string' ? path : ''
  }
}

/**
 * Single reusable media resolver for videos.
 *
 * Combines getMediaUrl (relative → absolute backend URL) with
 * getGoogleDriveVideoUrl (Google Drive share link → direct video URL).
 */
export const resolveVideoUrl = (path) => {
  if (!path) return ''

  try {
    const mediaUrl = getMediaUrl(path)
    return getGoogleDriveVideoUrl(mediaUrl)
  } catch (error) {
    console.error('Failed to resolve video URL:', path, error)
    return typeof path === 'string' ? path : ''
  }
}
