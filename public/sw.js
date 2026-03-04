// 모에르(MOER) Service Worker
const CACHE_VERSION = 'moer-v2'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const IMAGE_CACHE = `${CACHE_VERSION}-images`

const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/offline.html',
]

// Max items per dynamic cache
const DYNAMIC_CACHE_LIMIT = 50
const IMAGE_CACHE_LIMIT = 30

// Trim cache to limit
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxItems) {
    await cache.delete(keys[0])
    return trimCache(cacheName, maxItems)
  }
}

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
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
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map(key => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - different strategies per resource type
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API calls - always network
  if (url.pathname.startsWith('/api/')) return

  // Skip WebSocket and browser-sync
  if (url.pathname.includes('__vite') || url.pathname.includes('ws')) return

  // Image requests: Cache First with fallback
  if (request.destination === 'image' || url.pathname.startsWith('/uploads/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached

        return fetch(request).then(response => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(IMAGE_CACHE).then(cache => {
              cache.put(request, clone)
              trimCache(IMAGE_CACHE, IMAGE_CACHE_LIMIT)
            })
          }
          return response
        }).catch(() => {
          // Return a placeholder for failed image loads
          return new Response('', { status: 404, statusText: 'Offline' })
        })
      })
    )
    return
  }

  // Static assets (JS, CSS, fonts): Stale While Revalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, clone)
            })
          }
          return response
        }).catch(() => cached)

        return cached || fetchPromise
      })
    )
    return
  }

  // HTML pages: Network First with offline fallback
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, clone)
              trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            return cached || caches.match('/offline.html')
          })
        })
    )
    return
  }

  // All other requests: Network First
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, clone)
            trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
      })
  )
})
