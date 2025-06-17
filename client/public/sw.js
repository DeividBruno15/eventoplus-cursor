const CACHE_NAME = 'evento-plus-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png',
  '/offline',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // If network fails, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync offline actions when back online
  const offlineActions = await getOfflineActions();
  for (const action of offlineActions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
      await removeOfflineAction(action.id);
    } catch (error) {
      console.error('Sync failed for action:', action, error);
    }
  }
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Evento+',
    icon: '/logo-192.png',
    badge: '/logo-192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Evento+', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Helper functions for IndexedDB operations
async function getOfflineActions() {
  // This would integrate with the IndexedDB implementation
  return [];
}

async function removeOfflineAction(id) {
  // This would integrate with the IndexedDB implementation
}