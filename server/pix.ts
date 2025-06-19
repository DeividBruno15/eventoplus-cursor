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
      // Simulação de PIX para demonstração
      const pixKey = this.generateRandomPixKey();
      const transactionId = `PIX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const qrCodeData = `00020101021226830014br.gov.bcb.pix2561pix-qr.mercadopago.com/instore/o/v2/${transactionId}5204000053039865802BR5925${paymentData.payerName}6009SAO PAULO62070503***6304${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Simular QR Code base64 (seria gerado por uma biblioteca real)
      const qrCodeBase64 = Buffer.from(`QR Code para PIX de R$ ${paymentData.amount.toFixed(2)}`).toString('base64');
      
      return {
        id: transactionId,
        status: 'pending',
        pixCode: qrCodeData,
        pixKey: pixKey,
        qrCodeBase64: qrCodeBase64,
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        amount: paymentData.amount,
        transactionId: transactionId
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
      // Simulação de consulta de status
      return {
        id: paymentId,
        status: 'pending',
        statusDetail: 'pending_waiting_payment',
        amount: 100,
        dateApproved: null,
        dateCreated: new Date().toISOString(),
        externalReference: paymentId
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