/**
 * Byte Runner service worker.
 * - Never touches auth/API traffic (always network).
 * - Content-hashed build assets: cache-first (safe — filenames change).
 * - Media/static: stale-while-revalidate.
 * - Page navigations: network-first with cache fallback.
 */
const CACHE = 'byterunner-v1'
const API_PREFIXES = [
  '/auth', '/users', '/runs', '/leaderboard', '/contests',
  '/hourly', '/badges', '/balance', '/sponsors', '/prize-claims',
]

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

async function cacheFirst(req) {
  const cached = await caches.match(req)
  if (cached) return cached
  const res = await fetch(req)
  if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
  return res
}

async function staleWhileRevalidate(req) {
  const cached = await caches.match(req)
  const fetchPromise = fetch(req).then((res) => {
    if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
    return res
  }).catch(() => cached)
  return cached || fetchPromise
}

async function networkFirst(req) {
  try {
    const res = await fetch(req)
    if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
    return res
  } catch {
    const cached = await caches.match(req)
    if (cached) return cached
    throw new Error('offline and not cached')
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (API_PREFIXES.some((p) => url.pathname.startsWith(p))) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req))
    return
  }
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    /\.(webp|png|jpg|jpeg|gif|svg|mp3|wav|ogg|ico|woff2?|ttf)$/i.test(url.pathname)
  if (isStaticAsset) {
    event.respondWith(staleWhileRevalidate(req))
    return
  }
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req))
  }
})
