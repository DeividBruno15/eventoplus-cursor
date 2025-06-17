import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
}

export class NotificationService {
  private static expoPushToken: string | null = null;

  static async initialize(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions denied');
        return null;
      }

      // Get push token
      this.expoPushToken = await this.getExpoPushToken();
      
      if (this.expoPushToken) {
        console.log('Push token obtained:', this.expoPushToken);
        // Send token to backend for user association
        await this.registerTokenWithBackend(this.expoPushToken);
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Notification initialization error:', error);
      return null;
    }
  }

  private static async getExpoPushToken(): Promise<string> {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) {
      throw new Error('Project ID não encontrado');
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token.data;
  }

  private static async registerTokenWithBackend(token: string): Promise<void> {
    try {
      // Register push token with backend
      const response = await fetch('/api/mobile/push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to register push token');
      }
    } catch (error) {
      console.error('Token registration error:', error);
    }
  }

  private static async setupAndroidChannels(): Promise<void> {
    // Events channel
    await Notifications.setNotificationChannelAsync('events', {
      name: 'Eventos',
      description: 'Notificações sobre eventos e candidaturas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3C5BFA',
    });

    // Messages channel
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mensagens',
      description: 'Novas mensagens no chat',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFA94D',
    });

    // Bookings channel
    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Reservas',
      description: 'Confirmações e atualizações de reservas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
    });
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger,
      });

      return identifier;
    } catch (error) {
      console.error('Local notification scheduling error:', error);
      throw error;
    }
  }

  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Notification cancellation error:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('All notifications cancellation error:', error);
    }
  }

  static addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  static async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  static async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

// Event-specific notification helpers
export class EventNotifications {
  static async notifyNewApplication(eventTitle: string, providerName: string): Promise<void> {
    await NotificationService.scheduleLocalNotification(
      'Nova Candidatura',
      `${providerName} se candidatou para "${eventTitle}"`,
      { seconds: 1 },
      { type: 'new_application', eventTitle, providerName }
    );
  }

  static async notifyApplicationStatus(eventTitle: string, status: 'approved' | 'rejected'): Promise<void> {
    const title = status === 'approved' ? 'Candidatura Aprovada!' : 'Candidatura Recusada';
    const body = status === 'approved' 
      ? `Sua candidatura para "${eventTitle}" foi aprovada`
      : `Sua candidatura para "${eventTitle}" foi recusada`;

    await NotificationService.scheduleLocalNotification(
      title,
      body,
      { seconds: 1 },
      { type: 'application_status', eventTitle, status }
    );
  }

  static async notifyEventReminder(eventTitle: string, daysUntil: number): Promise<void> {
    const body = daysUntil === 0 
      ? `Seu evento "${eventTitle}" é hoje!`
      : `Seu evento "${eventTitle}" é em ${daysUntil} dia(s)`;

    await NotificationService.scheduleLocalNotification(
      'Lembrete de Evento',
      body,
      { seconds: 1 },
      { type: 'event_reminder', eventTitle, daysUntil }
    );
  }
}

// Message notifications
export class MessageNotifications {
  static async notifyNewMessage(senderName: string, message: string): Promise<void> {
    await NotificationService.scheduleLocalNotification(
      `Mensagem de ${senderName}`,
      message,
      { seconds: 1 },
      { type: 'new_message', senderName }
    );
  }
}

// Venue booking notifications
export class BookingNotifications {
  static async notifyBookingConfirmation(venueName: string, date: string): Promise<void> {
    await NotificationService.scheduleLocalNotification(
      'Reserva Confirmada',
      `Sua reserva no ${venueName} para ${date} foi confirmada`,
      { seconds: 1 },
      { type: 'booking_confirmed', venueName, date }
    );
  }

  static async notifyBookingCancellation(venueName: string, date: string): Promise<void> {
    await NotificationService.scheduleLocalNotification(
      'Reserva Cancelada',
      `Sua reserva no ${venueName} para ${date} foi cancelada`,
      { seconds: 1 },
      { type: 'booking_cancelled', venueName, date }
    );
  }
}