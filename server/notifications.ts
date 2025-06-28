// Serviço de notificações usando n8n via webhooks
// Muito mais simples e flexível que integração direta

interface NotificationData {
  type: 'new_event' | 'new_chat' | 'venue_reservation' | 'event_application' | 'application_status';
  userId: number;
  userPhone?: string;
  userType: string;
  data: Record<string, any>;
  timestamp: string;
}

class NotificationService {
  private n8nWebhookUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || '';
    this.isEnabled = !!this.n8nWebhookUrl;
  }

  private async sendWebhook(notificationData: NotificationData): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('🔔 N8N webhook não configurado, pulando notificação:', notificationData.type);
      return false;
    }

    try {
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        console.log(`📱 Webhook enviado com sucesso: ${notificationData.type} para usuário ${notificationData.userId}`);
        return true;
      } else {
        console.error(`❌ Erro no webhook: ${response.status} - ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar webhook para n8n:', error);
      return false;
    }
  }

  // Notificar sobre novo evento compatível
  async notifyNewEvent(data: {
    providerIds: number[];
    eventTitle: string;
    eventLocation: string;
    budget: string;
    category: string;
    eventId: number;
    baseUrl: string;
  }): Promise<void> {
    const promises = data.providerIds.map(async (providerId) => {
      return this.sendWebhook({
        type: 'new_event',
        userId: providerId,
        userType: 'prestador',
        data: {
          eventTitle: data.eventTitle,
          eventLocation: data.eventLocation,
          budget: data.budget,
          category: data.category,
          eventId: data.eventId,
          eventUrl: `${data.baseUrl}/events/${data.eventId}`
        },
        timestamp: new Date().toISOString()
      });
    });

    await Promise.allSettled(promises);
  }

  // Notificar sobre nova conversa
  async notifyNewChat(data: {
    receiverId: number;
    senderName: string;
    firstMessage: string;
    chatId: string;
    baseUrl: string;
  }): Promise<void> {
    await this.sendWebhook({
      type: 'new_chat',
      userId: data.receiverId,
      userType: 'any',
      data: {
        senderName: data.senderName,
        firstMessage: data.firstMessage,
        chatUrl: `${data.baseUrl}/chat?with=${data.chatId}`
      },
      timestamp: new Date().toISOString()
    });
  }

  // Notificar sobre pré-reserva de local
  async notifyVenueReservation(data: {
    ownerId: number;
    venueName: string;
    clientName: string;
    reservationDate: string;
    guestCount: number;
    reservationId: number;
    baseUrl: string;
  }): Promise<void> {
    await this.sendWebhook({
      type: 'venue_reservation',
      userId: data.ownerId,
      userType: 'anunciante',
      data: {
        venueName: data.venueName,
        clientName: data.clientName,
        reservationDate: data.reservationDate,
        guestCount: data.guestCount,
        reservationUrl: `${data.baseUrl}/venues/reservations/${data.reservationId}`
      },
      timestamp: new Date().toISOString()
    });
  }

  // Notificar organizador sobre nova candidatura
  async notifyEventApplication(data: {
    organizerId: number;
    eventTitle: string;
    providerName: string;
    serviceCategory: string;
    proposedPrice: string;
    eventId: number;
    baseUrl: string;
  }): Promise<void> {
    await this.sendWebhook({
      type: 'event_application',
      userId: data.organizerId,
      userType: 'contratante',
      data: {
        eventTitle: data.eventTitle,
        providerName: data.providerName,
        serviceCategory: data.serviceCategory,
        proposedPrice: data.proposedPrice,
        eventUrl: `${data.baseUrl}/events/${data.eventId}#applications`
      },
      timestamp: new Date().toISOString()
    });
  }

  // Notificar prestador sobre status da candidatura
  async notifyApplicationStatus(data: {
    providerId: number;
    status: 'approved' | 'rejected';
    eventTitle: string;
    eventLocation: string;
    eventDate: string;
    eventId?: number;
    contractId?: number;
    baseUrl: string;
  }): Promise<void> {
    const targetUrl = data.status === 'approved' && data.contractId
      ? `${data.baseUrl}/contracts/${data.contractId}`
      : `${data.baseUrl}/events`;

    await this.sendWebhook({
      type: 'application_status',
      userId: data.providerId,
      userType: 'prestador',
      data: {
        status: data.status,
        eventTitle: data.eventTitle,
        eventLocation: data.eventLocation,
        eventDate: data.eventDate,
        targetUrl: targetUrl
      },
      timestamp: new Date().toISOString()
    });
  }

  // Testar conectividade com n8n
  async testConnection(): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const testData = {
        type: 'test' as const,
        userId: 0,
        userType: 'system',
        data: { message: 'Teste de conectividade n8n' },
        timestamp: new Date().toISOString()
      };

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro no teste de conectividade n8n:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService; 