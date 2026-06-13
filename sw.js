const CACHE_NAME = 'wageguard-premium-cache-v1';
const DATA_CACHE_NAME = 'wageguard-settings';

// Cache core essential assets on install so they are available immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core app shell');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Sync Premium Status
let isPremiumInMemory = null;

async function checkPremiumStatus() {
  if (isPremiumInMemory !== null) {
    return isPremiumInMemory;
  }
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const response = await cache.match('/premium-status-flag');
    if (response) {
      const data = await response.json();
      isPremiumInMemory = !!data.isPremium;
      return isPremiumInMemory;
    }
  } catch (e) {
    // Ignore error
  }
  return false;
}

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SET_PREMIUM') {
    isPremiumInMemory = !!event.data.isPremium;
    try {
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put('/premium-status-flag', new Response(JSON.stringify({ isPremium: isPremiumInMemory })));
      console.log('[Service Worker] Premium status saved successfully:', isPremiumInMemory);
    } catch (e) {
      console.error('[Service Worker] Error saving premium status:', e);
    }
  }
});

// Fetch with Premium gating
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip chrome-extension scheme or non-http/https
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Bypass APIs or local payment proxy routes (Dynamic always from network)
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.host.includes('ziina.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    checkPremiumStatus().then((premiumActive) => {
      if (!premiumActive) {
        // Non-premium users: normal network request
        return fetch(event.request);
      }

      // Premium users: Stale-While-Revalidate strategy for static resources
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Update cache dynamically if response is okay
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.log('[Service Worker] Offline fallback for:', event.request.url);
            // Swallowing fetch error as we might serve cached response
            throw err;
          });

          // Return cached response instantly if we have it, otherwise wait for network
          return cachedResponse || fetchPromise;
        }).catch(() => {
          // Fallback mechanism for navigation routes (Single Page App index fallback)
          if (event.request.mode === 'navigate') {
            return cache.match('/index.html') || cache.match('/');
          }
        });
      });
    })
  );
});
