import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

// Configuração do Mercado Pago
const mercadoPagoConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  options: {
    timeout: 5000,
    idempotencyKey: crypto.randomUUID(),
  }
});

const paymentClient = new Payment(mercadoPagoConfig);

export interface PixPaymentRequest {
  amount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  payerCpf?: string;
  externalReference?: string;
}

export interface PixPaymentResponse {
  id: string;
  status: string;
  pixCode: string;
  pixKey: string;
  qrCodeBase64: string;
  expirationDate: string;
  amount: number;
  transactionId: string;
}

export class PixService {
  
  /**
   * Cria um pagamento PIX
   */
  async createPixPayment(paymentData: PixPaymentRequest): Promise<PixPaymentResponse> {
    try {
      const payment = await paymentClient.create({
        body: {
          transaction_amount: paymentData.amount,
          description: paymentData.description,
          payment_method_id: 'pix',
          payer: {
            email: paymentData.payerEmail,
            first_name: paymentData.payerName.split(' ')[0],
            last_name: paymentData.payerName.split(' ').slice(1).join(' '),
            identification: paymentData.payerCpf ? {
              type: 'CPF',
              number: paymentData.payerCpf
            } : undefined
          },
          external_reference: paymentData.externalReference,
          notification_url: `${process.env.BASE_URL}/api/webhooks/mercadopago`
        }
      });

      if (!payment.point_of_interaction?.transaction_data) {
        throw new Error('Erro ao gerar dados PIX');
      }

      return {
        id: payment.id!.toString(),
        status: payment.status || 'pending',
        pixCode: payment.point_of_interaction.transaction_data.ticket_url || '',
        pixKey: payment.point_of_interaction.transaction_data.qr_code || '',
        qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64 || '',
        expirationDate: payment.date_of_expiration || '',
        amount: payment.transaction_amount || 0,
        transactionId: payment.id!.toString()
      };
    } catch (error: any) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error(`Falha ao processar pagamento PIX: ${error.message}`);
    }
  }

  /**
   * Consulta status de um pagamento
   */
  async getPaymentStatus(paymentId: string) {
    try {
      const payment = await paymentClient.get({
        id: paymentId
      });

      return {
        id: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        amount: payment.transaction_amount,
        dateApproved: payment.date_approved,
        dateCreated: payment.date_created,
        externalReference: payment.external_reference
      };
    } catch (error: any) {
      console.error('Erro ao consultar pagamento:', error);
      throw new Error(`Falha ao consultar pagamento: ${error.message}`);
    }
  }

  /**
   * Valida chave PIX
   */
  validatePixKey(pixKey: string): boolean {
    // Validação básica de chaves PIX
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cpfRegex = /^\d{11}$/;
    const cnpjRegex = /^\d{14}$/;
    const phoneRegex = /^\+55\d{10,11}$/;
    const randomKeyRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    
    return emailRegex.test(pixKey) || 
           cpfRegex.test(pixKey.replace(/\D/g, '')) || 
           cnpjRegex.test(pixKey.replace(/\D/g, '')) || 
           phoneRegex.test(pixKey) || 
           randomKeyRegex.test(pixKey);
  }

  /**
   * Gera chave PIX aleatória para testes
   */
  generateRandomPixKey(): string {
    return crypto.randomUUID();
  }

  /**
   * Processa webhook do Mercado Pago
   */
  async processWebhook(webhookData: any) {
    try {
      if (webhookData.type === 'payment') {
        const paymentId = webhookData.data.id;
        const paymentStatus = await this.getPaymentStatus(paymentId);
        
        // Aqui você pode atualizar o status no banco de dados
        console.log('Webhook processado:', paymentStatus);
        
        return paymentStatus;
      }
    } catch (error: any) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }
}

export const pixService = new PixService();