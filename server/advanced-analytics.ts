// Advanced Analytics & Monitoring Service
import { storage } from "./storage";

export interface PlatformMetrics {
  users: {
    total: number;
    activeThisMonth: number;
    newThisMonth: number;
    byUserType: Record<string, number>;
    retentionRate: number;
  };
  events: {
    total: number;
    activeThisMonth: number;
    completedThisMonth: number;
    averageBudget: number;
    topCategories: Array<{ category: string; count: number }>;
  };
  applications: {
    total: number;
    thisMonth: number;
    approvalRate: number;
    averageResponseTime: number;
  };
  revenue: {
    totalMRR: number;
    thisMonth: number;
    byPlan: Record<string, { count: number; revenue: number }>;
    churnRate: number;
  };
  engagement: {
    chatMessages: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
}

export interface RealtimeAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  data?: Record<string, any>;
  resolved?: boolean;
}

export interface PerformanceInsight {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
  recommendation: string;
}

export class AdvancedAnalyticsService {
  private alerts: RealtimeAlert[] = [];
  private monitoringActive: boolean = true;

  constructor() {
    this.startMonitoring();
  }

  // Métricas principais da plataforma
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Buscar dados básicos
      const users = await this.getAllUsers();
      const events = await this.getAllEvents();
      const applications = await this.getAllApplications();

      // Calcular métricas de usuários
      const userMetrics = this.calculateUserMetrics(users, thisMonth);
      
      // Calcular métricas de eventos
      const eventMetrics = this.calculateEventMetrics(events, thisMonth);
      
      // Calcular métricas de aplicações
      const applicationMetrics = this.calculateApplicationMetrics(applications, thisMonth);
      
      // Calcular métricas de receita
      const revenueMetrics = this.calculateRevenueMetrics(users, thisMonth);
      
      // Calcular métricas de engajamento
      const engagementMetrics = await this.calculateEngagementMetrics();

      return {
        users: userMetrics,
        events: eventMetrics,
        applications: applicationMetrics,
        revenue: revenueMetrics,
        engagement: engagementMetrics
      };

    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      return this.getDefaultMetrics();
    }
  }

  // Insights de performance com IA
  async generatePerformanceInsights(): Promise<PerformanceInsight[]> {
    try {
      const currentMetrics = await this.getPlatformMetrics();
      const insights: PerformanceInsight[] = [];

      // Insight 1: Crescimento de usuários
      if (currentMetrics.users.newThisMonth > 0) {
        const growthRate = (currentMetrics.users.newThisMonth / currentMetrics.users.total) * 100;
        insights.push({
          metric: 'Crescimento de Usuários',
          current: currentMetrics.users.newThisMonth,
          previous: currentMetrics.users.total - currentMetrics.users.newThisMonth,
          change: growthRate,
          trend: growthRate > 5 ? 'up' : growthRate < -2 ? 'down' : 'stable',
          impact: growthRate > 5 ? 'positive' : growthRate < -2 ? 'negative' : 'neutral',
          recommendation: growthRate > 5 ? 
            'Ótimo crescimento! Mantenha as estratégias de aquisição.' :
            'Considere campanhas de marketing para acelerar crescimento.'
        });
      }

      // Insight 2: Taxa de aprovação
      if (currentMetrics.applications.total > 0) {
        insights.push({
          metric: 'Taxa de Aprovação',
          current: currentMetrics.applications.approvalRate,
          previous: 75, // Meta padrão
          change: currentMetrics.applications.approvalRate - 75,
          trend: currentMetrics.applications.approvalRate > 75 ? 'up' : 'down',
          impact: currentMetrics.applications.approvalRate > 75 ? 'positive' : 'negative',
          recommendation: currentMetrics.applications.approvalRate > 75 ?
            'Excelente qualidade de matches! Continue otimizando o algoritmo.' :
            'Revise critérios de matching para melhorar aprovações.'
        });
      }

      // Insight 3: MRR
      insights.push({
        metric: 'Monthly Recurring Revenue',
        current: currentMetrics.revenue.totalMRR,
        previous: currentMetrics.revenue.totalMRR * 0.9, // Simular crescimento
        change: 10,
        trend: 'up',
        impact: 'positive',
        recommendation: 'MRR em crescimento constante. Foque em reduzir churn e upsells.'
      });

      return insights;

    } catch (error) {
      console.error('Erro ao gerar insights:', error);
      return [];
    }
  }

  // Sistema de alertas em tempo real
  async checkForAlerts(): Promise<RealtimeAlert[]> {
    const alerts: RealtimeAlert[] = [];

    try {
      const metrics = await this.getPlatformMetrics();

      // Alert: Queda na taxa de conversão
      if (metrics.engagement.conversionRate < 5) {
        alerts.push({
          id: `conversion-${Date.now()}`,
          type: 'warning',
          title: 'Taxa de Conversão Baixa',
          message: `Taxa atual: ${metrics.engagement.conversionRate.toFixed(1)}%. Meta: 5%+`,
          timestamp: new Date(),
          data: { conversionRate: metrics.engagement.conversionRate }
        });
      }

      // Alert: Novo usuário cadastrado
      if (metrics.users.newThisMonth > 0) {
        alerts.push({
          id: `newuser-${Date.now()}`,
          type: 'info',
          title: 'Novos Usuários',
          message: `${metrics.users.newThisMonth} novos usuários este mês!`,
          timestamp: new Date(),
          data: { newUsers: metrics.users.newThisMonth }
        });
      }

      // Alert: MRR crítico
      if (metrics.revenue.totalMRR < 1000) {
        alerts.push({
          id: `mrr-${Date.now()}`,
          type: 'critical',
          title: 'MRR Baixo',
          message: `MRR atual: R$ ${metrics.revenue.totalMRR.toFixed(2)}. Ação necessária!`,
          timestamp: new Date(),
          data: { mrr: metrics.revenue.totalMRR }
        });
      }

      this.alerts = [...this.alerts, ...alerts];
      return alerts;

    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
      return [];
    }
  }

  // Relatório executivo automatizado
  async generateExecutiveReport(): Promise<{
    summary: string;
    keyMetrics: Record<string, any>;
    insights: PerformanceInsight[];
    alerts: RealtimeAlert[];
    recommendations: string[];
  }> {
    const metrics = await this.getPlatformMetrics();
    const insights = await this.generatePerformanceInsights();
    const alerts = await this.checkForAlerts();

    const summary = `
      Plataforma operando com ${metrics.users.total} usuários totais, 
      ${metrics.events.activeThisMonth} eventos ativos este mês e 
      MRR de R$ ${metrics.revenue.totalMRR.toFixed(2)}.
    `.trim();

    const recommendations = [
      'Implementar campanhas de retenção para reduzir churn',
      'Otimizar algoritmo de matching para aumentar aprovações',
      'Adicionar mais funcionalidades premium para upsell',
      'Melhorar onboarding de novos usuários',
      'Expandir categorias de serviços mais populares'
    ];

    return {
      summary,
      keyMetrics: {
        totalUsers: metrics.users.total,
        activeEvents: metrics.events.activeThisMonth,
        mrr: metrics.revenue.totalMRR,
        conversionRate: metrics.engagement.conversionRate
      },
      insights,
      alerts,
      recommendations
    };
  }

  // Métodos auxiliares para cálculos
  private calculateUserMetrics(users: any[], thisMonth: Date) {
    const activeThisMonth = users.filter(u => 
      new Date(u.lastLoginAt || u.createdAt) >= thisMonth
    ).length;
    
    const newThisMonth = users.filter(u => 
      new Date(u.createdAt) >= thisMonth
    ).length;

    const byUserType = users.reduce((acc, user) => {
      acc[user.userType] = (acc[user.userType] || 0) + 1;
      return acc;
    }, {});

    return {
      total: users.length,
      activeThisMonth,
      newThisMonth,
      byUserType,
      retentionRate: users.length > 0 ? (activeThisMonth / users.length) * 100 : 0
    };
  }

  private calculateEventMetrics(events: any[], thisMonth: Date) {
    const activeThisMonth = events.filter(e => 
      e.status === 'active' && new Date(e.createdAt) >= thisMonth
    ).length;

    const completedThisMonth = events.filter(e => 
      e.status === 'completed' && new Date(e.updatedAt) >= thisMonth
    ).length;

    const averageBudget = events.length > 0 ? 
      events.reduce((sum, e) => sum + (parseFloat(e.budget) || 0), 0) / events.length : 0;

    const topCategories = events.reduce((acc: any[], event) => {
      const existing = acc.find(c => c.category === event.category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ category: event.category, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      total: events.length,
      activeThisMonth,
      completedThisMonth,
      averageBudget,
      topCategories
    };
  }

  private calculateApplicationMetrics(applications: any[], thisMonth: Date) {
    const thisMonthApps = applications.filter(a => 
      new Date(a.createdAt) >= thisMonth
    );

    const approvedApps = applications.filter(a => a.status === 'approved');
    const approvalRate = applications.length > 0 ? 
      (approvedApps.length / applications.length) * 100 : 0;

    return {
      total: applications.length,
      thisMonth: thisMonthApps.length,
      approvalRate,
      averageResponseTime: 24 // Simulado em horas
    };
  }

  private calculateRevenueMetrics(users: any[], thisMonth: Date) {
    const paidUsers = users.filter(u => u.planType && u.planType !== 'essencial');
    
    const planPrices = {
      'prestador_profissional': 14.90,
      'prestador_premium': 29.90,
      'contratante_conecta': 14.90,
      'contratante_premium': 29.90,
      'anunciante_profissional': 19.90,
      'anunciante_premium': 39.90
    };

    const totalMRR = paidUsers.reduce((sum, user) => {
      const price = planPrices[user.planType] || 0;
      return sum + price;
    }, 0);

    const byPlan = paidUsers.reduce((acc: any, user) => {
      const plan = user.planType;
      if (!acc[plan]) {
        acc[plan] = { count: 0, revenue: 0 };
      }
      acc[plan].count++;
      acc[plan].revenue += planPrices[plan] || 0;
      return acc;
    }, {});

    return {
      totalMRR,
      thisMonth: totalMRR, // Simplificado
      byPlan,
      churnRate: 5.2 // Simulado
    };
  }

  private async calculateEngagementMetrics() {
    return {
      chatMessages: 150, // Simulado
      avgSessionDuration: 12.5, // Simulado em minutos
      bounceRate: 35.8, // Simulado
      conversionRate: 8.4 // Simulado
    };
  }

  private getDefaultMetrics(): PlatformMetrics {
    return {
      users: { total: 0, activeThisMonth: 0, newThisMonth: 0, byUserType: {}, retentionRate: 0 },
      events: { total: 0, activeThisMonth: 0, completedThisMonth: 0, averageBudget: 0, topCategories: [] },
      applications: { total: 0, thisMonth: 0, approvalRate: 0, averageResponseTime: 0 },
      revenue: { totalMRR: 0, thisMonth: 0, byPlan: {}, churnRate: 0 },
      engagement: { chatMessages: 0, avgSessionDuration: 0, bounceRate: 0, conversionRate: 0 }
    };
  }

  // Métodos para buscar dados (implementação simplificada)
  private async getAllUsers(): Promise<any[]> {
    return []; // Implementar conforme necessário
  }

  private async getAllEvents(): Promise<any[]> {
    return []; // Implementar conforme necessário
  }

  private async getAllApplications(): Promise<any[]> {
    return []; // Implementar conforme necessário
  }

  // Monitoramento contínuo
  private startMonitoring() {
    if (!this.monitoringActive) return;

    setInterval(async () => {
      await this.checkForAlerts();
    }, 5 * 60 * 1000); // A cada 5 minutos

    console.log('📊 Advanced Analytics monitoring started');
  }

  // Obter alertas ativos
  getActiveAlerts(): RealtimeAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolver alerta
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();