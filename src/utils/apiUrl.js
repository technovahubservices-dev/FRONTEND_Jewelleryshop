const stripTrailingSlash = (value) => value?.replace(/\/+$/, '')

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

export const resolveImageUrl = (image) => {
  if (!image || typeof image !== 'string' || image.startsWith('http')) return image
  return `${getApiBaseUrl()}${image}`
}
