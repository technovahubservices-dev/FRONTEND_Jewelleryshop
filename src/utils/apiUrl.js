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
 * Convert any Google Drive share/link URL into a backend-proxied URL.
 *
 * Instead of creating a direct Google Drive URL (which can fail due to
 * invalid file IDs, CORS issues, or lack of streaming support), the file
 * ID is extracted and routed through the backend's proxy endpoint:
 *   GET /api/upload/drive/:fileId
 *
 * The backend proxy handles CORS, content-type detection (image vs video),
 * byte-range streaming, and returns proper error responses for invalid
 * or inaccessible file IDs.
 */
const resolveGoogleDriveToProxyUrl = (url) => {
  if (!url || typeof url !== 'string') return ''

  const value = url.trim()

  if (!isGoogleDriveUrl(value)) return value

  const fileId = getGoogleDriveFileId(value)
  if (!fileId) return value

  return getMediaUrl(`/api/upload/drive/${encodeURIComponent(fileId)}`)
}

const getGoogleDriveImageUrl = resolveGoogleDriveToProxyUrl
const getGoogleDriveVideoUrl = resolveGoogleDriveToProxyUrl

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
 * resolveGoogleDriveToProxyUrl (Google Drive share link → backend proxy URL).
 *
 * Never creates direct Google Drive thumbnail URLs — all Drive content is
 * routed through the backend proxy at /api/upload/drive/:fileId.
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
 * resolveGoogleDriveToProxyUrl (Google Drive share link → backend proxy URL).
 *
 * Never creates direct Google Drive uc?export=view URLs — all Drive content
 * is routed through the backend proxy at /api/upload/drive/:fileId.
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
