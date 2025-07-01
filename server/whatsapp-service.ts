// WhatsApp Notification Service via n8n
import { storage } from "./storage";

export interface WhatsAppNotification {
  type: 'new_event' | 'new_chat' | 'venue_reservation' | 'event_application' | 'application_status' | 'payment_reminder';
  userId: number;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class WhatsAppService {
  private n8nWebhookUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || '';
    this.isEnabled = !!this.n8nWebhookUrl;
    
    if (this.isEnabled) {
      console.log('✅ WhatsApp Service ativo via n8n');
    } else {
      console.log('⚠️ WhatsApp Service desabilitado - N8N_WEBHOOK_URL não configurado');
    }
  }

  async sendNotification(notification: WhatsAppNotification): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('📱 WhatsApp notification skipped (service disabled):', notification.type);
      return false;
    }

    try {
      // Buscar dados do usuário
      const user = await storage.getUser(notification.userId);
      if (!user) {
        console.log('❌ Usuário não encontrado para notificação WhatsApp:', notification.userId);
        return false;
      }

      // Verificar se usuário tem WhatsApp configurado e notificações ativadas
      if (!user.whatsappNumber || !user.whatsappStatusNotifications) {
        console.log('📱 Usuário sem WhatsApp ou notificações desabilitadas:', user.email);
        return false;
      }

      // Preparar payload para n8n
      const payload = {
        type: notification.type,
        recipient: {
          userId: user.id,
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username,
          phone: user.whatsappNumber,
          email: user.email
        },
        message: {
          title: notification.title,
          text: notification.message,
          timestamp: new Date().toISOString()
        },
        data: notification.data || {},
        source: 'evento-plus-platform'
      };

      // Enviar para n8n webhook
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Evento+ Platform'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`✅ WhatsApp notification sent via n8n: ${notification.type} -> ${user.whatsappNumber}`);
        return true;
      } else {
        const error = await response.text();
        console.log(`❌ n8n webhook error (${response.status}):`, error);
        return false;
      }

    } catch (error: any) {
      console.log('❌ Erro ao enviar notificação WhatsApp:', error.message);
      return false;
    }
  }

  // Notificações específicas por tipo de evento
  async notifyNewEvent(organizerId: number, eventTitle: string, eventId: number) {
    return this.sendNotification({
      type: 'new_event',
      userId: organizerId,
      title: 'Novo Evento Criado! 🎉',
      message: `Seu evento "${eventTitle}" foi criado com sucesso e já está visível para prestadores de serviços.`,
      data: { eventId, eventTitle }
    });
  }

  async notifyNewChatMessage(recipientId: number, senderName: string, messagePreview: string) {
    return this.sendNotification({
      type: 'new_chat',
      userId: recipientId,
      title: `Nova mensagem de ${senderName} 💬`,
      message: messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview,
      data: { senderName }
    });
  }

  async notifyVenueReservation(ownerId: number, venueName: string, clientName: string, date: string) {
    return this.sendNotification({
      type: 'venue_reservation',
      userId: ownerId,
      title: 'Nova Reserva de Espaço! 🏢',
      message: `${clientName} fez uma reserva para "${venueName}" em ${date}.`,
      data: { venueName, clientName, date }
    });
  }

  async notifyEventApplication(organizerId: number, providerName: string, eventTitle: string, applicationId: number) {
    return this.sendNotification({
      type: 'event_application',
      userId: organizerId,
      title: 'Nova Candidatura! 👨‍💼',
      message: `${providerName} se candidatou para seu evento "${eventTitle}".`,
      data: { providerName, eventTitle, applicationId }
    });
  }

  async notifyApplicationStatus(providerId: number, eventTitle: string, status: 'approved' | 'rejected') {
    const statusText = status === 'approved' ? 'Aprovada! ✅' : 'Não aprovada ❌';
    const message = status === 'approved' 
      ? `Parabéns! Sua candidatura para "${eventTitle}" foi aprovada.`
      : `Sua candidatura para "${eventTitle}" não foi aprovada desta vez.`;

    return this.sendNotification({
      type: 'application_status',
      userId: providerId,
      title: `Candidatura ${statusText}`,
      message,
      data: { eventTitle, status }
    });
  }

  async notifyPaymentReminder(userId: number, planName: string, amount: number) {
    return this.sendNotification({
      type: 'payment_reminder',
      userId: userId,
      title: 'Lembrete de Pagamento 💳',
      message: `Seu plano ${planName} (R$ ${amount.toFixed(2)}) vence em breve. Mantenha seus benefícios ativos!`,
      data: { planName, amount }
    });
  }

  // Método para testar conectividade
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'N8N_WEBHOOK_URL não configurado',
        details: { webhookUrl: 'not_configured' }
      };
    }

    try {
      const testPayload = {
        type: 'connectivity_test',
        message: 'Teste de conectividade do Evento+',
        timestamp: new Date().toISOString(),
        source: 'evento-plus-platform'
      };

      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Evento+ Platform'
        },
        body: JSON.stringify(testPayload)
      });

      const responseText = await response.text();

      return {
        success: response.ok,
        message: response.ok ? 'Conectividade OK' : `Erro ${response.status}`,
        details: {
          status: response.status,
          response: responseText,
          webhookUrl: this.n8nWebhookUrl.substring(0, 50) + '...'
        }
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Erro de conectividade: ${error.message}`,
        details: {
          error: error.message,
          webhookUrl: this.n8nWebhookUrl.substring(0, 50) + '...'
        }
      };
    }
  }

  // Obter estatísticas de usuários com WhatsApp
  async getWhatsAppStats() {
    try {
      // Buscar todos os usuários via método existente
      const users: any[] = [];
      
      const stats = {
        totalUsers: users.length,
        usersWithWhatsapp: users.filter((u: any) => u.whatsappNumber).length,
        usersWithNotificationsEnabled: users.filter((u: any) => u.whatsappNumber && u.whatsappNotifications).length
      };

      return {
        ...stats,
        coverage: stats.totalUsers > 0 ? Math.round((stats.usersWithWhatsapp / stats.totalUsers) * 100) : 0,
        optInRate: stats.usersWithWhatsapp > 0 ? Math.round((stats.usersWithNotificationsEnabled / stats.usersWithWhatsapp) * 100) : 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas WhatsApp:', error);
      return null;
    }
  }
}

// Instância global
export const whatsappService = new WhatsAppService();