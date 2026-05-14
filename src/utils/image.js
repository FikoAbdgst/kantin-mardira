const DEFAULT_IMAGE_URL = '/default.png'

const LOCAL_IMAGE_HOSTS = new Set([
  'localhost:8000',
  '127.0.0.1:8000',
  'localhost:8080',
  '127.0.0.1:8080',
])

export const normalizeImageUrl = (value) => {
  const url = typeof value === 'string' ? value.trim() : ''

  if (!url) {
    return ''
  }

  if (url.startsWith('data:image/')) {
    return url
  }

  if (url.startsWith('/')) {
    return url
  }

  if (!/^https?:\/\//i.test(url)) {
    return ''
  }

  try {
    const parsedUrl = new URL(url)

    if (LOCAL_IMAGE_HOSTS.has(parsedUrl.host)) {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
    }

    return parsedUrl.toString()
  } catch {
    return ''
  }
}

export const getImageUrl = (value) => normalizeImageUrl(value) || DEFAULT_IMAGE_URL

export const handleImageError = (event) => {
  const imageElement = event?.target

  if (!imageElement || imageElement.dataset.fallbackApplied === 'true') {
    return
  }

  imageElement.dataset.fallbackApplied = 'true'
  imageElement.src = DEFAULT_IMAGE_URL
}

export const normalizeCartItem = (menu) => ({
  ...(menu ?? {}),
  image_url: menu?.image_url ?? menu?.image ?? '',
  qty: 1,
})
