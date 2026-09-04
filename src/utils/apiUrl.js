const stripTrailingSlash = (value) => value?.replace(/\/+$/, '')

const getGoogleDriveFileId = (url) => {
  if (!url || typeof url !== 'string') return ''
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return match ? match[1] : ''
}

const toGoogleDriveDirectUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  const fileId = getGoogleDriveFileId(url)
  return fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : url
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

export const getMediaUrl = (path) => {
  if (!path || typeof path !== 'string') return ''

  const trimmed = path.trim()
  if (trimmed === '') return ''

  if (/^https?:\/\//i.test(trimmed) || /^\/\//.test(trimmed)) {
    return toGoogleDriveDirectUrl(trimmed)
  }

  const origin = getBackendOrigin()
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`
  }

  return `${origin}/${trimmed}`
}
