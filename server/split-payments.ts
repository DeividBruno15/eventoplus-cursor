import { z } from "zod";

export interface SplitPaymentConfig {
  eventId: number;
  totalAmount: number;
  platformFee: number; // Percentual da plataforma (ex: 5%)
  providerId: number;
  organizerId: number;
  venueId?: number;
  paymentMethod: 'stripe' | 'pix';
  currency: 'BRL';
}

export interface SplitCalculation {
  totalAmount: number;
  platformFee: number;
  platformAmount: number;
  providerAmount: number;
  organizerAmount?: number;
  venueAmount?: number;
  taxAmount: number;
  netAmounts: {
    platform: number;
    provider: number;
    organizer?: number;
    venue?: number;
  };
}

export interface SplitTransaction {
  id: string;
  eventId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  totalAmount: number;
  createdAt: Date;
  completedAt?: Date;
  paymentMethod: string;
  splitDetails: SplitCalculation;
  externalTransactionId?: string;
  failureReason?: string;
}

export class SplitPaymentService {
  private platformFeeDefault = 8.5; // 8.5% taxa padrão da plataforma
  private taxRate = 0.0; // ISS/impostos (configurável por região)

  /**
   * Calcula automaticamente o split de pagamento
   */
  calculateSplit(config: SplitPaymentConfig): SplitCalculation {
    const { totalAmount, platformFee = this.platformFeeDefault } = config;
    
    // Cálculo da taxa da plataforma
    const platformAmount = (totalAmount * platformFee) / 100;
    
    // Cálculo de impostos
    const taxAmount = (totalAmount * this.taxRate) / 100;
    
    // Valores líquidos após taxa da plataforma
    const remainingAmount = totalAmount - platformAmount - taxAmount;
    
    let providerAmount = 0;
    let organizerAmount = 0;
    let venueAmount = 0;
    
    // Split baseado no tipo de evento
    if (config.venueId) {
      // Evento com venue: 70% prestador, 20% organizador, 10% venue
      providerAmount = remainingAmount * 0.70;
      organizerAmount = remainingAmount * 0.20;
      venueAmount = remainingAmount * 0.10;
    } else {
      // Evento sem venue: 80% prestador, 20% organizador
      providerAmount = remainingAmount * 0.80;
      organizerAmount = remainingAmount * 0.20;
    }

    return {
      totalAmount,
      platformFee,
      platformAmount: Number(platformAmount.toFixed(2)),
      providerAmount: Number(providerAmount.toFixed(2)),
      organizerAmount: config.venueId ? Number(organizerAmount.toFixed(2)) : undefined,
      venueAmount: config.venueId ? Number(venueAmount.toFixed(2)) : undefined,
      taxAmount: Number(taxAmount.toFixed(2)),
      netAmounts: {
        platform: Number(platformAmount.toFixed(2)),
        provider: Number(providerAmount.toFixed(2)),
        organizer: config.venueId ? Number(organizerAmount.toFixed(2)) : undefined,
        venue: config.venueId ? Number(venueAmount.toFixed(2)) : undefined,
      }
    };
  }

  /**
   * Processa split payment via Stripe
   */
  async processStripeSplit(config: SplitPaymentConfig): Promise<SplitTransaction> {
    const splitCalculation = this.calculateSplit(config);
    
    const transaction: SplitTransaction = {
      id: this.generateTransactionId(),
      eventId: config.eventId,
      status: 'pending',
      totalAmount: config.totalAmount,
      createdAt: new Date(),
      paymentMethod: 'stripe',
      splitDetails: splitCalculation
    };

    try {
      // Simulação do processamento Stripe
      // Em produção, integraria com Stripe Connect para splits automáticos
      transaction.status = 'processing';
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso (95% taxa de sucesso)
      if (Math.random() > 0.05) {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        transaction.externalTransactionId = `stripe_${Date.now()}`;
        
        // Registrar transferências individuais
        await this.recordIndividualTransfers(transaction);
      } else {
        transaction.status = 'failed';
        transaction.failureReason = 'Insufficient funds or card declined';
      }
      
    } catch (error) {
      transaction.status = 'failed';
      transaction.failureReason = error instanceof Error ? error.message : 'Unknown error';
    }

    return transaction;
  }

  /**
   * Processa split payment via PIX
   */
  async processPixSplit(config: SplitPaymentConfig): Promise<SplitTransaction> {
    const splitCalculation = this.calculateSplit(config);
    
    const transaction: SplitTransaction = {
      id: this.generateTransactionId(),
      eventId: config.eventId,
      status: 'pending',
      totalAmount: config.totalAmount,
      createdAt: new Date(),
      paymentMethod: 'pix',
      splitDetails: splitCalculation
    };

    try {
      // PIX é instantâneo, mas pode ter delay para split
      transaction.status = 'processing';
      
      // Simular processamento PIX (mais rápido)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.externalTransactionId = `pix_${Date.now()}`;
      
      await this.recordIndividualTransfers(transaction);
      
    } catch (error) {
      transaction.status = 'failed';
      transaction.failureReason = error instanceof Error ? error.message : 'PIX processing error';
    }

    return transaction;
  }

  /**
   * Registra transferências individuais para cada participante
   */
  private async recordIndividualTransfers(transaction: SplitTransaction): Promise<void> {
    const { splitDetails } = transaction;
    
    // Em produção, registraria no banco de dados
    console.log('Recording transfers:', {
      transactionId: transaction.id,
      platform: splitDetails.netAmounts.platform,
      provider: splitDetails.netAmounts.provider,
      organizer: splitDetails.netAmounts.organizer,
      venue: splitDetails.netAmounts.venue
    });
  }

  /**
   * Busca histórico de transações de split
   */
  async getTransactionHistory(filters: {
    eventId?: number;
    providerId?: number;
    organizerId?: number;
    status?: SplitTransaction['status'];
    startDate?: Date;
    endDate?: Date;
  }): Promise<SplitTransaction[]> {
    // Mock data - em produção viria do banco
    return [
      {
        id: 'split_1',
        eventId: 1,
        status: 'completed',
        totalAmount: 1500.00,
        createdAt: new Date('2025-06-25'),
        completedAt: new Date('2025-06-25'),
        paymentMethod: 'stripe',
        externalTransactionId: 'stripe_1234567890',
        splitDetails: this.calculateSplit({
          eventId: 1,
          totalAmount: 1500.00,
          platformFee: 8.5,
          providerId: 1,
          organizerId: 2,
          paymentMethod: 'stripe',
          currency: 'BRL'
        })
      },
      {
        id: 'split_2',
        eventId: 2,
        status: 'completed',
        totalAmount: 2800.00,
        createdAt: new Date('2025-06-28'),
        completedAt: new Date('2025-06-28'),
        paymentMethod: 'pix',
        externalTransactionId: 'pix_0987654321',
        splitDetails: this.calculateSplit({
          eventId: 2,
          totalAmount: 2800.00,
          platformFee: 8.5,
          providerId: 3,
          organizerId: 4,
          venueId: 5,
          paymentMethod: 'pix',
          currency: 'BRL'
        })
      }
    ];
  }

  /**
   * Calcula estatísticas de receita
   */
  async getRevenueStats(filters: {
    startDate?: Date;
    endDate?: Date;
    providerId?: number;
  }): Promise<{
    totalRevenue: number;
    platformRevenue: number;
    providerRevenue: number;
    organizerRevenue: number;
    venueRevenue: number;
    transactionCount: number;
    averageTransaction: number;
  }> {
    const transactions = await this.getTransactionHistory(filters);
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const platformRevenue = completedTransactions.reduce((sum, t) => sum + t.splitDetails.netAmounts.platform, 0);
    const providerRevenue = completedTransactions.reduce((sum, t) => sum + t.splitDetails.netAmounts.provider, 0);
    const organizerRevenue = completedTransactions.reduce((sum, t) => sum + (t.splitDetails.netAmounts.organizer || 0), 0);
    const venueRevenue = completedTransactions.reduce((sum, t) => sum + (t.splitDetails.netAmounts.venue || 0), 0);
    
    return {
      totalRevenue,
      platformRevenue,
      providerRevenue,
      organizerRevenue,
      venueRevenue,
      transactionCount: completedTransactions.length,
      averageTransaction: completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0
    };
  }

  /**
   * Processa reembolso com split reverso
   */
  async processRefund(transactionId: string, amount?: number): Promise<{
    success: boolean;
    refundId: string;
    refundAmount: number;
    refundSplit: SplitCalculation;
  }> {
    // Em produção, buscaria a transação original do banco
    const originalTransaction = await this.getTransactionById(transactionId);
    
    if (!originalTransaction || originalTransaction.status !== 'completed') {
      throw new Error('Transaction not found or not completed');
    }
    
    const refundAmount = amount || originalTransaction.totalAmount;
    
    // Calcular split reverso proporcional
    const refundRatio = refundAmount / originalTransaction.totalAmount;
    const originalSplit = originalTransaction.splitDetails;
    
    const refundSplit: SplitCalculation = {
      totalAmount: refundAmount,
      platformFee: originalSplit.platformFee,
      platformAmount: originalSplit.platformAmount * refundRatio,
      providerAmount: originalSplit.providerAmount * refundRatio,
      organizerAmount: originalSplit.organizerAmount ? originalSplit.organizerAmount * refundRatio : undefined,
      venueAmount: originalSplit.venueAmount ? originalSplit.venueAmount * refundRatio : undefined,
      taxAmount: originalSplit.taxAmount * refundRatio,
      netAmounts: {
        platform: originalSplit.netAmounts.platform * refundRatio,
        provider: originalSplit.netAmounts.provider * refundRatio,
        organizer: originalSplit.netAmounts.organizer ? originalSplit.netAmounts.organizer * refundRatio : undefined,
        venue: originalSplit.netAmounts.venue ? originalSplit.netAmounts.venue * refundRatio : undefined,
      }
    };
    
    return {
      success: true,
      refundId: `refund_${Date.now()}`,
      refundAmount,
      refundSplit
    };
  }

  /**
   * Busca transação por ID
   */
  private async getTransactionById(id: string): Promise<SplitTransaction | null> {
    const transactions = await this.getTransactionHistory({});
    return transactions.find(t => t.id === id) || null;
  }

  /**
   * Gera ID único para transação
   */
  private generateTransactionId(): string {
    return `split_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida configuração de split
   */
  validateSplitConfig(config: SplitPaymentConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.totalAmount <= 0) {
      errors.push('Total amount must be greater than 0');
    }
    
    if (config.platformFee < 0 || config.platformFee > 50) {
      errors.push('Platform fee must be between 0% and 50%');
    }
    
    if (!config.providerId || !config.organizerId) {
      errors.push('Provider ID and Organizer ID are required');
    }
    
    if (!['stripe', 'pix'].includes(config.paymentMethod)) {
      errors.push('Payment method must be stripe or pix');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const splitPaymentService = new SplitPaymentService();

// Schemas de validação
export const splitPaymentConfigSchema = z.object({
  eventId: z.number().positive(),
  totalAmount: z.number().positive(),
  platformFee: z.number().min(0).max(50).optional(),
  providerId: z.number().positive(),
  organizerId: z.number().positive(),
  venueId: z.number().positive().optional(),
  paymentMethod: z.enum(['stripe', 'pix']),
  currency: z.literal('BRL')
});

export const refundRequestSchema = z.object({
  transactionId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().min(10).max(500)
});