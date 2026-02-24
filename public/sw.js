// 모에르(MOER) Service Worker
const CACHE_NAME = 'moer-v1'
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
]

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API calls
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache successful responses
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request)
      })
  )
})
