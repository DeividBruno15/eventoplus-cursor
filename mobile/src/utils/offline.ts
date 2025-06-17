import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineAction {
  id: string;
  type: 'CREATE_EVENT' | 'CREATE_VENUE' | 'SEND_MESSAGE' | 'UPDATE_PROFILE';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineData {
  events: any[];
  venues: any[];
  services: any[];
  messages: any[];
  profile: any;
  contacts: any[];
  lastSync: number;
}

export class OfflineService {
  private static readonly OFFLINE_DATA_KEY = 'offline_data';
  private static readonly OFFLINE_ACTIONS_KEY = 'offline_actions';
  private static readonly MAX_RETRY_COUNT = 3;

  static async isOnline(): Promise<boolean> {
    try {
      const networkState = await NetInfo.fetch();
      return networkState.isConnected === true && networkState.isInternetReachable === true;
    } catch (error) {
      console.error('Network check error:', error);
      return false;
    }
  }

  static async saveOfflineData(data: Partial<OfflineData>): Promise<void> {
    try {
      const existingData = await this.getOfflineData();
      const updatedData = { ...existingData, ...data, lastSync: Date.now() };
      
      await AsyncStorage.setItem(
        this.OFFLINE_DATA_KEY,
        JSON.stringify(updatedData)
      );
    } catch (error) {
      console.error('Offline data save error:', error);
    }
  }

  static async getOfflineData(): Promise<OfflineData> {
    try {
      const data = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
      
      if (data) {
        return JSON.parse(data);
      }

      return {
        events: [],
        venues: [],
        services: [],
        messages: [],
        profile: null,
        contacts: [],
        lastSync: 0,
      };
    } catch (error) {
      console.error('Offline data retrieval error:', error);
      return {
        events: [],
        venues: [],
        services: [],
        messages: [],
        profile: null,
        contacts: [],
        lastSync: 0,
      };
    }
  }

  static async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const offlineAction: OfflineAction = {
        ...action,
        id: `${action.type}_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const existingActions = await this.getOfflineActions();
      existingActions.push(offlineAction);

      await AsyncStorage.setItem(
        this.OFFLINE_ACTIONS_KEY,
        JSON.stringify(existingActions)
      );

      // Try to execute immediately if online
      const isOnline = await this.isOnline();
      if (isOnline) {
        await this.processOfflineActions();
      }
    } catch (error) {
      console.error('Offline action queue error:', error);
    }
  }

  static async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const actions = await AsyncStorage.getItem(this.OFFLINE_ACTIONS_KEY);
      return actions ? JSON.parse(actions) : [];
    } catch (error) {
      console.error('Offline actions retrieval error:', error);
      return [];
    }
  }

  static async processOfflineActions(): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      if (actions.length === 0) return;

      const isOnline = await this.isOnline();
      if (!isOnline) return;

      const failedActions: OfflineAction[] = [];
      const processedActionIds: string[] = [];

      for (const action of actions) {
        try {
          await this.executeOfflineAction(action);
          processedActionIds.push(action.id);
        } catch (error) {
          console.error(`Failed to execute offline action ${action.id}:`, error);
          
          if (action.retryCount < this.MAX_RETRY_COUNT) {
            failedActions.push({
              ...action,
              retryCount: action.retryCount + 1,
            });
          }
        }
      }

      // Update offline actions queue
      await AsyncStorage.setItem(
        this.OFFLINE_ACTIONS_KEY,
        JSON.stringify(failedActions)
      );

      console.log(`Processed ${processedActionIds.length} offline actions`);
    } catch (error) {
      console.error('Offline actions processing error:', error);
    }
  }

  private static async executeOfflineAction(action: OfflineAction): Promise<void> {
    const API_BASE_URL = 'https://d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev';
    
    switch (action.type) {
      case 'CREATE_EVENT':
        await fetch(`${API_BASE_URL}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;

      case 'CREATE_VENUE':
        await fetch(`${API_BASE_URL}/api/venues`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;

      case 'SEND_MESSAGE':
        await fetch(`${API_BASE_URL}/api/chat/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;

      case 'UPDATE_PROFILE':
        await fetch(`${API_BASE_URL}/api/user`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  static async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.OFFLINE_DATA_KEY);
      await AsyncStorage.removeItem(this.OFFLINE_ACTIONS_KEY);
    } catch (error) {
      console.error('Offline data clear error:', error);
    }
  }

  static async getLastSyncTime(): Promise<number> {
    try {
      const data = await this.getOfflineData();
      return data.lastSync;
    } catch (error) {
      console.error('Last sync time error:', error);
      return 0;
    }
  }
}

// Network monitoring and auto-sync
export class NetworkMonitor {
  private static listener: any = null;

  static startMonitoring(onConnectionChange?: (isConnected: boolean) => void): void {
    this.listener = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected === true && state.isInternetReachable === true;
      
      if (isConnected) {
        // Auto-sync when connection is restored
        OfflineService.processOfflineActions();
      }

      onConnectionChange?.(isConnected);
    });
  }

  static stopMonitoring(): void {
    if (this.listener) {
      this.listener();
      this.listener = null;
    }
  }
}

// Offline-aware API wrapper
export class OfflineAwareAPI {
  static async createEvent(eventData: any): Promise<any> {
    const isOnline = await OfflineService.isOnline();
    
    if (isOnline) {
      // Try to create online first
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Online event creation failed:', error);
      }
    }

    // Queue for offline processing
    await OfflineService.queueOfflineAction({
      type: 'CREATE_EVENT',
      data: eventData,
    });

    // Save to local storage for immediate UI update
    const offlineData = await OfflineService.getOfflineData();
    const tempEvent = {
      ...eventData,
      id: `temp_${Date.now()}`,
      status: 'pending_sync',
    };
    
    offlineData.events.push(tempEvent);
    await OfflineService.saveOfflineData(offlineData);

    return tempEvent;
  }

  static async getEvents(): Promise<any[]> {
    const isOnline = await OfflineService.isOnline();
    
    if (isOnline) {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const events = await response.json();
          
          // Cache for offline use
          await OfflineService.saveOfflineData({ events });
          return events;
        }
      } catch (error) {
        console.error('Online events fetch failed:', error);
      }
    }

    // Return cached data
    const offlineData = await OfflineService.getOfflineData();
    return offlineData.events;
  }
}