/**
 * Sistema de Comissões Variáveis - FASE 2
 * 
 * Sistema para calcular e aplicar comissões variáveis baseadas em:
 * - Volume de transações
 * - Performance histórica
 * - Tipo de usuário e plano
 * - Categoria de serviço
 * - Sazonalidade e eventos especiais
 */

export interface CommissionRule {
  id: string;
  name: string;
  description: string;
  userType: 'prestador' | 'contratante' | 'anunciante' | 'all';
  serviceCategory?: string;
  active: boolean;
  priority: number; // Prioridade de aplicação (1 = maior)
  conditions: CommissionCondition[];
  baseRate: number; // Taxa base em %
  modifiers: CommissionModifier[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionCondition {
  type: 'volume' | 'performance' | 'plan' | 'category' | 'date_range' | 'event_count';
  operator: 'gte' | 'lte' | 'eq' | 'between' | 'in';
  value: any;
  description: string;
}

export interface CommissionModifier {
  type: 'percentage' | 'fixed' | 'multiplier';
  value: number;
  description: string;
  conditions?: CommissionCondition[];
}

export interface CommissionCalculation {
  transactionId: string;
  userId: number;
  userType: string;
  serviceCategory: string;
  transactionAmount: number;
  appliedRules: AppliedRule[];
  baseCommission: number;
  modifiedCommission: number;
  totalCommission: number;
  calculatedAt: Date;
  breakdown: CommissionBreakdown[];
}

export interface AppliedRule {
  ruleId: string;
  ruleName: string;
  baseRate: number;
  modifierValue: number;
  finalRate: number;
}

export interface CommissionBreakdown {
  description: string;
  type: 'base' | 'modifier' | 'bonus' | 'penalty';
  amount: number;
  percentage: number;
}

export interface CommissionStats {
  totalCommissions: number;
  averageRate: number;
  ruleUsage: Array<{
    ruleId: string;
    ruleName: string;
    timesApplied: number;
    totalAmount: number;
  }>;
  userTypeBreakdown: Array<{
    userType: string;
    totalCommissions: number;
    averageRate: number;
    transactionCount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    totalCommissions: number;
    averageRate: number;
    transactionCount: number;
  }>;
  periodComparison: {
    current: number;
    previous: number;
    growth: number;
  };
}

export class VariableCommissionService {
  private rules: Map<string, CommissionRule> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Inicializa regras padrão do sistema
   */
  private initializeDefaultRules(): void {
    const defaultRules: CommissionRule[] = [
      {
        id: 'basic-prestador',
        name: 'Comissão Básica Prestador',
        description: 'Taxa básica para prestadores de serviço',
        userType: 'prestador',
        active: true,
        priority: 10,
        conditions: [],
        baseRate: 5.0, // 5%
        modifiers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'high-volume-prestador',
        name: 'Alto Volume Prestador',
        description: 'Taxa reduzida para prestadores com alto volume',
        userType: 'prestador',
        active: true,
        priority: 5,
        conditions: [
          {
            type: 'volume',
            operator: 'gte',
            value: 10000, // R$ 10.000 em volume mensal
            description: 'Volume mensal >= R$ 10.000'
          }
        ],
        baseRate: 3.5, // 3.5%
        modifiers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'premium-plan-bonus',
        name: 'Bônus Plano Premium',
        description: 'Redução para usuários premium',
        userType: 'all',
        active: true,
        priority: 3,
        conditions: [
          {
            type: 'plan',
            operator: 'eq',
            value: 'premium',
            description: 'Plano premium ativo'
          }
        ],
        baseRate: 0,
        modifiers: [
          {
            type: 'percentage',
            value: -20, // 20% de redução
            description: 'Desconto de 20% para premium'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'new-user-bonus',
        name: 'Bônus Novo Usuário',
        description: 'Taxa reduzida para novos usuários',
        userType: 'all',
        active: true,
        priority: 8,
        conditions: [
          {
            type: 'event_count',
            operator: 'lte',
            value: 3,
            description: 'Primeiros 3 eventos'
          }
        ],
        baseRate: 2.0, // 2%
        modifiers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'entertainment-category',
        name: 'Categoria Entretenimento',
        description: 'Taxa especial para entretenimento',
        userType: 'prestador',
        serviceCategory: 'entretenimento',
        active: true,
        priority: 6,
        conditions: [],
        baseRate: 4.0, // 4%
        modifiers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Calcula comissão para uma transação
   */
  async calculateCommission(
    transactionAmount: number,
    userId: number,
    userType: string,
    serviceCategory: string,
    userPlan: string = 'free',
    userEventCount: number = 0
  ): Promise<CommissionCalculation> {
    const applicableRules = this.getApplicableRules(
      userType, 
      serviceCategory, 
      userPlan, 
      userEventCount, 
      transactionAmount
    );

    let finalRate = 0;
    const appliedRules: AppliedRule[] = [];
    const breakdown: CommissionBreakdown[] = [];

    // Aplicar regra principal (maior prioridade)
    if (applicableRules.length > 0) {
      const mainRule = applicableRules[0];
      finalRate = mainRule.baseRate;

      appliedRules.push({
        ruleId: mainRule.id,
        ruleName: mainRule.name,
        baseRate: mainRule.baseRate,
        modifierValue: 0,
        finalRate: mainRule.baseRate
      });

      breakdown.push({
        description: mainRule.name,
        type: 'base',
        amount: (transactionAmount * mainRule.baseRate) / 100,
        percentage: mainRule.baseRate
      });

      // Aplicar modificadores
      for (const modifier of mainRule.modifiers) {
        if (this.evaluateModifierConditions(modifier, userType, serviceCategory, userPlan, userEventCount, transactionAmount)) {
          let modifierAmount = 0;
          
          if (modifier.type === 'percentage') {
            const modifierRate = (finalRate * modifier.value) / 100;
            finalRate += modifierRate;
            modifierAmount = (transactionAmount * modifierRate) / 100;
          } else if (modifier.type === 'fixed') {
            modifierAmount = modifier.value;
          } else if (modifier.type === 'multiplier') {
            finalRate *= modifier.value;
            modifierAmount = (transactionAmount * (finalRate - mainRule.baseRate)) / 100;
          }

          breakdown.push({
            description: modifier.description,
            type: modifier.value > 0 ? 'bonus' : 'penalty',
            amount: modifierAmount,
            percentage: modifier.type === 'percentage' ? modifier.value : 0
          });
        }
      }
    }

    // Aplicar modificadores de outras regras
    for (let i = 1; i < applicableRules.length; i++) {
      const rule = applicableRules[i];
      for (const modifier of rule.modifiers) {
        if (this.evaluateModifierConditions(modifier, userType, serviceCategory, userPlan, userEventCount, transactionAmount)) {
          let modifierAmount = 0;
          
          if (modifier.type === 'percentage') {
            const modifierRate = (finalRate * modifier.value) / 100;
            finalRate += modifierRate;
            modifierAmount = (transactionAmount * modifierRate) / 100;
          }

          breakdown.push({
            description: `${rule.name}: ${modifier.description}`,
            type: modifier.value > 0 ? 'bonus' : 'penalty',
            amount: modifierAmount,
            percentage: modifier.value
          });
        }
      }
    }

    const baseCommission = applicableRules.length > 0 ? 
      (transactionAmount * applicableRules[0].baseRate) / 100 : 0;
    const totalCommission = (transactionAmount * finalRate) / 100;

    return {
      transactionId: `tx-${Date.now()}-${userId}`,
      userId,
      userType,
      serviceCategory,
      transactionAmount,
      appliedRules,
      baseCommission,
      modifiedCommission: totalCommission - baseCommission,
      totalCommission,
      calculatedAt: new Date(),
      breakdown
    };
  }

  /**
   * Obtém regras aplicáveis para uma transação
   */
  private getApplicableRules(
    userType: string,
    serviceCategory: string,
    userPlan: string,
    userEventCount: number,
    transactionAmount: number
  ): CommissionRule[] {
    const applicable = Array.from(this.rules.values())
      .filter(rule => {
        if (!rule.active) return false;
        
        // Verificar tipo de usuário
        if (rule.userType !== 'all' && rule.userType !== userType) return false;
        
        // Verificar categoria de serviço
        if (rule.serviceCategory && rule.serviceCategory !== serviceCategory) return false;
        
        // Verificar condições
        return this.evaluateConditions(rule.conditions, userType, serviceCategory, userPlan, userEventCount, transactionAmount);
      })
      .sort((a, b) => a.priority - b.priority); // Ordenar por prioridade

    return applicable;
  }

  /**
   * Avalia condições de uma regra
   */
  private evaluateConditions(
    conditions: CommissionCondition[],
    userType: string,
    serviceCategory: string,
    userPlan: string,
    userEventCount: number,
    transactionAmount: number
  ): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      switch (condition.type) {
        case 'volume':
          return this.evaluateNumericCondition(transactionAmount, condition);
        case 'event_count':
          return this.evaluateNumericCondition(userEventCount, condition);
        case 'plan':
          return condition.operator === 'eq' ? userPlan === condition.value : true;
        case 'category':
          return condition.operator === 'eq' ? serviceCategory === condition.value : true;
        default:
          return true;
      }
    });
  }

  /**
   * Avalia condições de modificadores
   */
  private evaluateModifierConditions(
    modifier: CommissionModifier,
    userType: string,
    serviceCategory: string,
    userPlan: string,
    userEventCount: number,
    transactionAmount: number
  ): boolean {
    if (!modifier.conditions || modifier.conditions.length === 0) return true;
    
    return this.evaluateConditions(
      modifier.conditions, 
      userType, 
      serviceCategory, 
      userPlan, 
      userEventCount, 
      transactionAmount
    );
  }

  /**
   * Avalia condições numéricas
   */
  private evaluateNumericCondition(value: number, condition: CommissionCondition): boolean {
    switch (condition.operator) {
      case 'gte':
        return value >= condition.value;
      case 'lte':
        return value <= condition.value;
      case 'eq':
        return value === condition.value;
      case 'between':
        return value >= condition.value[0] && value <= condition.value[1];
      default:
        return true;
    }
  }

  /**
   * Adiciona nova regra de comissão
   */
  async addRule(rule: Omit<CommissionRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommissionRule> {
    const newRule: CommissionRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  /**
   * Atualiza regra existente
   */
  async updateRule(ruleId: string, updates: Partial<CommissionRule>): Promise<CommissionRule | null> {
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) return null;

    const updatedRule: CommissionRule = {
      ...existingRule,
      ...updates,
      updatedAt: new Date()
    };

    this.rules.set(ruleId, updatedRule);
    return updatedRule;
  }

  /**
   * Remove regra
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    return this.rules.delete(ruleId);
  }

  /**
   * Lista todas as regras
   */
  async getAllRules(): Promise<CommissionRule[]> {
    return Array.from(this.rules.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Obtém regra por ID
   */
  async getRuleById(ruleId: string): Promise<CommissionRule | null> {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Simula cálculo de comissão
   */
  async simulateCommission(
    transactionAmount: number,
    userType: string,
    serviceCategory: string,
    userPlan: string = 'free',
    userEventCount: number = 0
  ): Promise<{
    calculation: CommissionCalculation;
    alternatives: Array<{
      scenario: string;
      calculation: CommissionCalculation;
    }>;
  }> {
    const baseCalculation = await this.calculateCommission(
      transactionAmount,
      0, // User ID temporário para simulação
      userType,
      serviceCategory,
      userPlan,
      userEventCount
    );

    const alternatives = [];

    // Simular com plano premium
    if (userPlan !== 'premium') {
      const premiumCalc = await this.calculateCommission(
        transactionAmount,
        0,
        userType,
        serviceCategory,
        'premium',
        userEventCount
      );
      alternatives.push({
        scenario: 'Com Plano Premium',
        calculation: premiumCalc
      });
    }

    // Simular com mais volume
    if (userEventCount <= 3) {
      const experiencedCalc = await this.calculateCommission(
        transactionAmount,
        0,
        userType,
        serviceCategory,
        userPlan,
        10 // Usuário experiente
      );
      alternatives.push({
        scenario: 'Usuário Experiente (10+ eventos)',
        calculation: experiencedCalc
      });
    }

    return {
      calculation: baseCalculation,
      alternatives
    };
  }

  /**
   * Gera estatísticas de comissões
   */
  async getCommissionStats(period: 'day' | 'week' | 'month' = 'month'): Promise<CommissionStats> {
    // Em uma implementação real, isso viria do banco de dados
    // Por enquanto, retornamos dados simulados
    
    return {
      totalCommissions: 15742.50,
      averageRate: 4.2,
      ruleUsage: [
        {
          ruleId: 'basic-prestador',
          ruleName: 'Comissão Básica Prestador',
          timesApplied: 156,
          totalAmount: 8930.25
        },
        {
          ruleId: 'high-volume-prestador',
          ruleName: 'Alto Volume Prestador',
          timesApplied: 23,
          totalAmount: 3450.75
        },
        {
          ruleId: 'new-user-bonus',
          ruleName: 'Bônus Novo Usuário',
          timesApplied: 45,
          totalAmount: 1890.00
        }
      ],
      userTypeBreakdown: [
        {
          userType: 'prestador',
          totalCommissions: 12456.75,
          averageRate: 4.5,
          transactionCount: 189
        },
        {
          userType: 'anunciante',
          totalCommissions: 3285.75,
          averageRate: 3.8,
          transactionCount: 67
        }
      ],
      categoryBreakdown: [
        {
          category: 'entretenimento',
          totalCommissions: 6789.50,
          averageRate: 4.0,
          transactionCount: 98
        },
        {
          category: 'alimentacao',
          totalCommissions: 4234.25,
          averageRate: 4.3,
          transactionCount: 76
        },
        {
          category: 'organizacao',
          totalCommissions: 2956.75,
          averageRate: 4.1,
          transactionCount: 54
        }
      ],
      periodComparison: {
        current: 15742.50,
        previous: 14523.25,
        growth: 8.4
      }
    };
  }
}

export const variableCommissionService = new VariableCommissionService();