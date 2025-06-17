import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev';

interface ApiRequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  try {
    const token = await SecureStore.getItemAsync('authToken');
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Mobile-specific API endpoints
export const mobileApi = {
  // Authentication
  login: (email: string, password: string) =>
    apiRequest('/api/mobile/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (userData: any) =>
    apiRequest('/api/mobile/register', {
      method: 'POST',
      body: userData,
    }),

  // Events
  getEvents: () => apiRequest('/api/events'),
  createEvent: (eventData: any) =>
    apiRequest('/api/events', {
      method: 'POST',
      body: eventData,
    }),

  // Venues
  getVenues: () => apiRequest('/api/venues'),
  createVenue: (venueData: any) =>
    apiRequest('/api/venues', {
      method: 'POST',
      body: venueData,
    }),

  // Services
  getServices: () => apiRequest('/api/services'),
  createService: (serviceData: any) =>
    apiRequest('/api/services', {
      method: 'POST',
      body: serviceData,
    }),

  // Chat
  getChatContacts: () => apiRequest('/api/chat/contacts'),
  getChatMessages: (contactId: number) => apiRequest(`/api/chat/messages/${contactId}`),
  sendMessage: (receiverId: number, message: string) =>
    apiRequest('/api/chat/messages', {
      method: 'POST',
      body: { receiverId, message },
    }),

  // User profile
  getCurrentUser: () => apiRequest('/api/user'),
  updateProfile: (userData: any) =>
    apiRequest('/api/user', {
      method: 'PATCH',
      body: userData,
    }),

  // Cart
  getCartItems: () => apiRequest('/api/cart'),
  addToCart: (serviceId: number, quantity: number) =>
    apiRequest('/api/cart', {
      method: 'POST',
      body: { serviceId, quantity },
    }),

  // Notifications
  getNotifications: () => apiRequest('/api/notifications'),
  markNotificationRead: (notificationId: number) =>
    apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    }),

  // Location services
  searchAddress: (cep: string) =>
    apiRequest(`/api/mobile/address/${cep}`),

  // Media upload
  uploadImage: async (imageUri: string, type: 'profile' | 'venue' | 'event') => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);
    formData.append('type', type);

    const token = await SecureStore.getItemAsync('authToken');
    
    const response = await fetch(`${API_BASE_URL}/api/mobile/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    return await response.json();
  },
};