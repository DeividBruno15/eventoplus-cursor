// IndexedDB wrapper for offline storage
class OfflineStorage {
  private dbName = 'evento-plus-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for offline data
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('services')) {
          db.createObjectStore('services', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('venues')) {
          db.createObjectStore('venues', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('offline-actions')) {
          const store = db.createObjectStore('offline-actions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('user-data')) {
          db.createObjectStore('user-data', { keyPath: 'key' });
        }
      };
    });
  }

  async storeData(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getData(storeName: string, key: any): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllData(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteData(storeName: string, key: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearStore(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Store offline actions for sync when online
  async addOfflineAction(action: {
    type: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
    timestamp: number;
  }): Promise<void> {
    return this.storeData('offline-actions', action);
  }

  // Get all offline actions for sync
  async getOfflineActions(): Promise<any[]> {
    return this.getAllData('offline-actions');
  }

  // Remove synced offline action
  async removeOfflineAction(id: number): Promise<void> {
    return this.deleteData('offline-actions', id);
  }

  // Cache user data
  async cacheUserData(key: string, data: any): Promise<void> {
    return this.storeData('user-data', { key, data, timestamp: Date.now() });
  }

  // Get cached user data
  async getCachedUserData(key: string): Promise<any> {
    const result = await this.getData('user-data', key);
    return result?.data;
  }
}

export const offlineStorage = new OfflineStorage();

// PWA utility functions
export const PWAUtils = {
  // Check if app is running as PWA
  isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  },

  // Check if device is online
  isOnline(): boolean {
    return navigator.onLine;
  },

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  },

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  },

  // Show notification
  showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo-192.png',
        badge: '/logo-192.png',
        ...options
      });
    }
  },

  // Add to home screen prompt
  async promptInstall(): Promise<boolean> {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      (window as any).deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  },

  // Check if can install PWA
  canInstall(): boolean {
    return !!(window as any).deferredPrompt;
  },

  // Network status listener
  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },

  // Background sync
  async requestBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
    }
  },

  // Send message to service worker
  sendMessageToSW(message: any): void {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }
};

// Hook for PWA functionality
export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(PWAUtils.isPWA());

  useEffect(() => {
    // Initialize service worker
    PWAUtils.registerServiceWorker();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    // Network status
    const cleanupNetworkListener = PWAUtils.onNetworkChange(setIsOnline);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      cleanupNetworkListener();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    const success = await PWAUtils.promptInstall();
    if (success) {
      setCanInstall(false);
      setIsInstalled(true);
    }
    return success;
  };

  return {
    isOnline,
    canInstall,
    isInstalled,
    installApp,
    isPWA: isInstalled,
    showNotification: PWAUtils.showNotification,
    requestNotificationPermission: PWAUtils.requestNotificationPermission
  };
}