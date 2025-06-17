const CACHE_NAME = 'evento-plus-v1.0.0';
const OFFLINE_URL = '/offline';

// Cache essential resources
const CACHE_URLS = [
  '/',
  '/dashboard',
  '/auth/login',
  '/auth/register',
  '/events',
  '/services',
  '/venues',
  '/chat',
  '/offline',
  '/manifest.json',
  // Add more critical routes
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/user',
  '/api/events',
  '/api/services',
  '/api/venues',
  '/api/chat-messages',
  '/api/notifications'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching essential resources');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version or offline page
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      handleApiRequest(request)
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
      })
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET responses for read-only endpoints
    if (response.status === 200 && shouldCacheApiResponse(url.pathname)) {
      const responseClone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache for read-only endpoints
    if (shouldCacheApiResponse(url.pathname)) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Add offline indicator header
        const response = cachedResponse.clone();
        response.headers.set('X-Served-From', 'cache');
        return response;
      }
    }
    
    // Return offline response for critical endpoints
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Esta funcionalidade não está disponível offline',
        cached: false
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Served-From': 'offline'
        }
      }
    );
  }
}

// Determine if API response should be cached
function shouldCacheApiResponse(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pathname.includes(pattern));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-events') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when connection is restored
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successful action from queue
        await removeOfflineAction(action.id);
        
        // Notify clients of successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              action: action.type
            });
          });
        });
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  let notificationData = {
    title: 'Evento+',
    body: 'Você tem uma nova notificação',
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    tag: 'evento-plus-notification'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ]
    })
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }

  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        const targetUrl = event.notification.data?.url || '/dashboard';
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CACHE_OFFLINE_ACTION':
        cacheOfflineAction(event.data.payload);
        break;
        
      case 'REQUEST_SYNC':
        self.registration.sync.register('background-sync-events');
        break;
        
      case 'UPDATE_CACHE':
        updateCache(event.data.urls);
        break;
    }
  }
});

// Cache offline actions in IndexedDB
async function cacheOfflineAction(action) {
  // This would integrate with IndexedDB to store offline actions
  console.log('Caching offline action:', action);
}

// Get offline actions from IndexedDB
async function getOfflineActions() {
  // This would retrieve offline actions from IndexedDB
  return [];
}

// Remove offline action from IndexedDB
async function removeOfflineAction(actionId) {
  // This would remove the action from IndexedDB
  console.log('Removing offline action:', actionId);
}

// Update cache with new URLs
async function updateCache(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    console.log('Cache updated with new URLs');
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

// Sync content in background
async function syncContent() {
  try {
    // Sync critical data like notifications, messages, etc.
    const criticalEndpoints = [
      '/api/notifications',
      '/api/chat-messages',
      '/api/user'
    ];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(endpoint, response.clone());
        }
      } catch (error) {
        console.error(`Failed to sync ${endpoint}:`, error);
      }
    }
  } catch (error) {
    console.error('Content sync failed:', error);
  }
}

console.log('Service Worker loaded successfully');