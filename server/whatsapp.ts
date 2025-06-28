import twilio from 'twilio';

// Configuração do Twilio WhatsApp
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // Ex: 'whatsapp:+14155238886'

let client: twilio.Twilio | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export interface WhatsAppNotification {
  to: string; // Número do destinatário no formato +5511999999999
  message: string;
  link?: string;
}

export interface NotificationTemplate {
  type: 'new_event' | 'new_chat' | 'venue_reservation' | 'event_application' | 'application_status';
  template: (data: any) => string;
}

// Templates das mensagens
const notificationTemplates: Record<string, NotificationTemplate['template']> = {
  new_event: (data) => 
    `🎉 *Novo evento compatível!*\n\n` +
    `📅 *${data.eventTitle}*\n` +
    `📍 ${data.eventLocation}\n` +
    `💰 Orçamento: R$ ${data.budget}\n` +
    `📋 Categoria: ${data.category}\n\n` +
    `Ver detalhes e candidatar-se: ${data.link}`,

  new_chat: (data) => 
    `💬 *Nova conversa iniciada!*\n\n` +
    `👤 *${data.senderName}* iniciou uma conversa com você\n` +
    `📝 "${data.firstMessage}"\n\n` +
    `Responder agora: ${data.link}`,

  venue_reservation: (data) => 
    `🏢 *Nova pré-reserva no seu espaço!*\n\n` +
    `📍 *${data.venueName}*\n` +
    `👤 Solicitante: ${data.clientName}\n` +
    `📅 Data: ${data.reservationDate}\n` +
    `👥 Convidados: ${data.guestCount} pessoas\n\n` +
    `Gerenciar reserva: ${data.link}`,

  event_application: (data) => 
    `📋 *Nova candidatura no seu evento!*\n\n` +
    `🎉 *${data.eventTitle}*\n` +
    `👤 Prestador: ${data.providerName}\n` +
    `🎯 Serviço: ${data.serviceCategory}\n` +
    `💰 Proposta: R$ ${data.proposedPrice}\n\n` +
    `Ver candidatura: ${data.link}`,

  application_status: (data) => 
    `${data.status === 'approved' ? '✅' : '❌'} *Candidatura ${data.status === 'approved' ? 'Aprovada' : 'Reprovada'}!*\n\n` +
    `🎉 *${data.eventTitle}*\n` +
    `📍 ${data.eventLocation}\n` +
    `📅 ${data.eventDate}\n\n` +
    `${data.status === 'approved' 
      ? `🎊 Parabéns! Sua candidatura foi aprovada!\n\nAcessar contrato: ${data.link}`
      : `😔 Infelizmente sua candidatura não foi selecionada desta vez.\n\nVer outros eventos: ${data.link}`
    }`
};

class WhatsAppService {
  
  // Validar número de WhatsApp
  validateWhatsAppNumber(phoneNumber: string): boolean {
    // Remove caracteres especiais e verifica formato brasileiro
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Número brasileiro deve ter 13 dígitos (55 + DDD + número)
    if (cleanNumber.length !== 13) return false;
    
    // Deve começar com 55 (código do Brasil)
    if (!cleanNumber.startsWith('55')) return false;
    
    // DDD deve ser válido (11-99)
    const ddd = parseInt(cleanNumber.substring(2, 4));
    if (ddd < 11 || ddd > 99) return false;
    
    return true;
  }

  // Formatar número para WhatsApp
  formatWhatsAppNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `whatsapp:+${cleanNumber}`;
  }

  // Enviar notificação via WhatsApp
  async sendNotification(notification: WhatsAppNotification): Promise<boolean> {
    if (!client) {
      console.error('Twilio client not configured');
      return false;
    }

    try {
      const message = await client.messages.create({
        from: whatsappFrom,
        to: this.formatWhatsAppNumber(notification.to),
        body: notification.message
      });

      console.log(`WhatsApp sent successfully: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      return false;
    }
  }

  // Notificar sobre novo evento compatível
  async notifyNewEvent(data: {
    providerPhone: string;
    eventTitle: string;
    eventLocation: string;
    budget: string;
    category: string;
    eventId: number;
    baseUrl: string;
  }): Promise<boolean> {
    if (!this.validateWhatsAppNumber(data.providerPhone)) {
      console.error('Invalid WhatsApp number:', data.providerPhone);
      return false;
    }

    const message = notificationTemplates.new_event({
      ...data,
      link: `${data.baseUrl}/events/${data.eventId}`
    });

    return await this.sendNotification({
      to: data.providerPhone,
      message
    });
  }

  // Notificar sobre nova conversa
  async notifyNewChat(data: {
    providerPhone: string;
    senderName: string;
    firstMessage: string;
    chatId: string;
    baseUrl: string;
  }): Promise<boolean> {
    if (!this.validateWhatsAppNumber(data.providerPhone)) {
      console.error('Invalid WhatsApp number:', data.providerPhone);
      return false;
    }

    const message = notificationTemplates.new_chat({
      ...data,
      link: `${data.baseUrl}/chat?with=${data.chatId}`
    });

    return await this.sendNotification({
      to: data.providerPhone,
      message
    });
  }

  // Notificar sobre pré-reserva de local
  async notifyVenueReservation(data: {
    ownerPhone: string;
    venueName: string;
    clientName: string;
    reservationDate: string;
    guestCount: number;
    reservationId: number;
    baseUrl: string;
  }): Promise<boolean> {
    if (!this.validateWhatsAppNumber(data.ownerPhone)) {
      console.error('Invalid WhatsApp number:', data.ownerPhone);
      return false;
    }

    const message = notificationTemplates.venue_reservation({
      ...data,
      link: `${data.baseUrl}/venues/reservations/${data.reservationId}`
    });

    return await this.sendNotification({
      to: data.ownerPhone,
      message
    });
  }

  // Notificar organizador sobre nova candidatura
  async notifyEventApplication(data: {
    organizerPhone: string;
    eventTitle: string;
    providerName: string;
    serviceCategory: string;
    proposedPrice: string;
    eventId: number;
    baseUrl: string;
  }): Promise<boolean> {
    if (!this.validateWhatsAppNumber(data.organizerPhone)) {
      console.error('Invalid WhatsApp number:', data.organizerPhone);
      return false;
    }

    const message = notificationTemplates.event_application({
      ...data,
      link: `${data.baseUrl}/events/${data.eventId}#applications`
    });

    return await this.sendNotification({
      to: data.organizerPhone,
      message
    });
  }

  // Notificar prestador sobre status da candidatura
  async notifyApplicationStatus(data: {
    providerPhone: string;
    status: 'approved' | 'rejected';
    eventTitle: string;
    eventLocation: string;
    eventDate: string;
    eventId?: number;
    contractId?: number;
    baseUrl: string;
  }): Promise<boolean> {
    if (!this.validateWhatsAppNumber(data.providerPhone)) {
      console.error('Invalid WhatsApp number:', data.providerPhone);
      return false;
    }

    const link = data.status === 'approved' && data.contractId
      ? `${data.baseUrl}/contracts/${data.contractId}`
      : `${data.baseUrl}/events`;

    const message = notificationTemplates.application_status({
      ...data,
      link
    });

    return await this.sendNotification({
      to: data.providerPhone,
      message
    });
  }

  // Testar conectividade do serviço
  async testConnection(): Promise<boolean> {
    if (!client) {
      return false;
    }

    try {
      await client.api.accounts.list({ limit: 1 });
      return true;
    } catch (error) {
      console.error('Twilio connection test failed:', error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService; 