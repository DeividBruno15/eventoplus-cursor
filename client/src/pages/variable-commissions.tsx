import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Calculator, Settings, TrendingUp, Plus, Edit, Trash2, Play, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CommissionRule {
  id: string;
  name: string;
  description: string;
  userType: 'prestador' | 'contratante' | 'anunciante' | 'all';
  serviceCategory?: string;
  active: boolean;
  priority: number;
  conditions: CommissionCondition[];
  baseRate: number;
  modifiers: CommissionModifier[];
  createdAt: Date;
  updatedAt: Date;
}

interface CommissionCondition {
  type: 'volume' | 'performance' | 'plan' | 'category' | 'date_range' | 'event_count';
  operator: 'gte' | 'lte' | 'eq' | 'between' | 'in';
  value: any;
  description: string;
}

interface CommissionModifier {
  type: 'percentage' | 'fixed' | 'multiplier';
  value: number;
  description: string;
  conditions?: CommissionCondition[];
}

interface CommissionCalculation {
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

interface AppliedRule {
  ruleId: string;
  ruleName: string;
  baseRate: number;
  modifierValue: number;
  finalRate: number;
}

interface CommissionBreakdown {
  description: string;
  type: 'base' | 'modifier' | 'bonus' | 'penalty';
  amount: number;
  percentage: number;
}

interface CommissionStats {
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

export default function VariableCommissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Estados para calculadora
  const [calculatorData, setCalculatorData] = useState({
    transactionAmount: 1000,
    userType: 'prestador',
    serviceCategory: 'entretenimento',
    userPlan: 'free',
    userEventCount: 0
  });

  // Queries
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['/api/variable-commissions/rules'],
    queryFn: () => apiRequest('/api/variable-commissions/rules')
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/variable-commissions/stats'],
    queryFn: () => apiRequest('/api/variable-commissions/stats')
  });

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: (ruleData: Partial<CommissionRule>) => 
      apiRequest('/api/variable-commissions/rules', {
        method: 'POST',
        body: JSON.stringify(ruleData),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/variable-commissions/rules'] });
      setIsRuleDialogOpen(false);
      toast({ title: "Regra criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar regra", variant: "destructive" });
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<CommissionRule> & { id: string }) => 
      apiRequest(`/api/variable-commissions/rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/variable-commissions/rules'] });
      setIsRuleDialogOpen(false);
      toast({ title: "Regra atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar regra", variant: "destructive" });
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/variable-commissions/rules/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/variable-commissions/rules'] });
      toast({ title: "Regra removida com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover regra", variant: "destructive" });
    }
  });

  const simulateCommissionMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/variable-commissions/simulate', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      }),
    onError: () => {
      toast({ title: "Erro ao simular comissão", variant: "destructive" });
    }
  });

  const rules = rulesData?.rules || [];
  const stats = statsData?.stats;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getUserTypeLabel = (type: string) => {
    const labels = {
      'prestador': 'Prestador',
      'contratante': 'Contratante',
      'anunciante': 'Anunciante',
      'all': 'Todos'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'entretenimento': 'Entretenimento',
      'alimentacao': 'Alimentação',
      'organizacao': 'Organização',
      'producao': 'Produção',
      'limpeza': 'Limpeza'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const handleSimulateCommission = () => {
    simulateCommissionMutation.mutate(calculatorData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Comissões Variáveis</h1>
            <p className="mt-2 text-gray-600">
              Configure e gerencie regras de comissão dinâmicas baseadas em performance e volume
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setIsCalculatorOpen(true)}
              variant="outline"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculadora
            </Button>
            <Button 
              onClick={() => {
                setSelectedRule(null);
                setIsRuleDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Regra
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissões Totais</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : formatCurrency(stats?.totalCommissions || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.periodComparison?.growth || 0}% vs período anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : formatPercentage(stats?.averageRate || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxa de comissão média aplicada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rulesLoading ? "..." : rules.filter((r: CommissionRule) => r.active).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {rules.length} regras criadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{stats?.periodComparison?.growth || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  vs período anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown por tipo de usuário */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Breakdown por Tipo de Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.userTypeBreakdown?.map((breakdown, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {getUserTypeLabel(breakdown.userType)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {breakdown.transactionCount} transações
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(breakdown.totalCommissions)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage(breakdown.averageRate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breakdown por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.categoryBreakdown?.map((breakdown, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {getCategoryLabel(breakdown.category)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {breakdown.transactionCount} transações
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(breakdown.totalCommissions)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage(breakdown.averageRate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="grid gap-4">
            {rulesLoading ? (
              <div className="text-center py-8">Carregando regras...</div>
            ) : rules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhuma regra de comissão criada ainda.</p>
                  <Button onClick={() => setIsRuleDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Regra
                  </Button>
                </CardContent>
              </Card>
            ) : (
              rules.map((rule: CommissionRule) => (
                <Card key={rule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{rule.name}</span>
                          <Badge variant={rule.active ? "default" : "secondary"}>
                            {rule.active ? "Ativa" : "Inativa"}
                          </Badge>
                          <Badge variant="outline">
                            Prioridade {rule.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setIsRuleDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRuleMutation.mutate(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Tipo de Usuário</Label>
                        <p className="text-sm text-gray-600">
                          {getUserTypeLabel(rule.userType)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Taxa Base</Label>
                        <p className="text-sm text-gray-600">
                          {formatPercentage(rule.baseRate)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Modificadores</Label>
                        <p className="text-sm text-gray-600">
                          {rule.modifiers?.length || 0} configurados
                        </p>
                      </div>
                    </div>
                    {rule.conditions && rule.conditions.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Condições</Label>
                        <div className="mt-2 space-y-1">
                          {rule.conditions.map((condition, index) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {condition.description}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uso de Regras</CardTitle>
              <CardDescription>
                Frequência de aplicação de cada regra de comissão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.ruleUsage?.map((usage, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{usage.ruleName}</div>
                      <div className="text-sm text-gray-500">
                        {usage.timesApplied} aplicações
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(usage.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Comissões</CardTitle>
              <CardDescription>
                Teste diferentes cenários para ver como as regras afetam as comissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="amount">Valor da Transação</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={calculatorData.transactionAmount}
                    onChange={(e) => setCalculatorData({
                      ...calculatorData,
                      transactionAmount: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <Select
                    value={calculatorData.userType}
                    onValueChange={(value) => setCalculatorData({
                      ...calculatorData,
                      userType: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prestador">Prestador</SelectItem>
                      <SelectItem value="contratante">Contratante</SelectItem>
                      <SelectItem value="anunciante">Anunciante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoria de Serviço</Label>
                  <Select
                    value={calculatorData.serviceCategory}
                    onValueChange={(value) => setCalculatorData({
                      ...calculatorData,
                      serviceCategory: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entretenimento">Entretenimento</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="organizacao">Organização</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                      <SelectItem value="limpeza">Limpeza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan">Plano do Usuário</Label>
                  <Select
                    value={calculatorData.userPlan}
                    onValueChange={(value) => setCalculatorData({
                      ...calculatorData,
                      userPlan: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Número de Eventos do Usuário: {calculatorData.userEventCount}</Label>
                <Slider
                  value={[calculatorData.userEventCount]}
                  onValueChange={(value) => setCalculatorData({
                    ...calculatorData,
                    userEventCount: value[0]
                  })}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>

              <Button 
                onClick={handleSimulateCommission} 
                className="w-full"
                disabled={simulateCommissionMutation.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                {simulateCommissionMutation.isPending ? "Simulando..." : "Simular Comissão"}
              </Button>

              {simulateCommissionMutation.data && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Resultado da Simulação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-sm font-medium">Comissão Base</Label>
                        <p className="text-lg font-bold">
                          {formatCurrency(simulateCommissionMutation.data.calculation.baseCommission)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Modificadores</Label>
                        <p className="text-lg font-bold">
                          {formatCurrency(simulateCommissionMutation.data.calculation.modifiedCommission)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Total Final</Label>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(simulateCommissionMutation.data.calculation.totalCommission)}
                        </p>
                      </div>
                    </div>

                    {simulateCommissionMutation.data.alternatives && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Cenários Alternativos</Label>
                        <div className="mt-2 space-y-2">
                          {simulateCommissionMutation.data.alternatives.map((alt: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm">{alt.scenario}</span>
                              <span className="font-medium">
                                {formatCurrency(alt.calculation.totalCommission)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Creation/Edit Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? "Editar Regra" : "Nova Regra de Comissão"}
            </DialogTitle>
            <DialogDescription>
              Configure uma nova regra de comissão variável
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ruleName">Nome da Regra</Label>
              <Input
                id="ruleName"
                placeholder="Ex: Comissão Premium Prestador"
              />
            </div>
            <div>
              <Label htmlFor="ruleDescription">Descrição</Label>
              <Textarea
                id="ruleDescription"
                placeholder="Descreva quando esta regra deve ser aplicada"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="ruleUserType">Tipo de Usuário</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prestador">Prestador</SelectItem>
                    <SelectItem value="contratante">Contratante</SelectItem>
                    <SelectItem value="anunciante">Anunciante</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="baseRate">Taxa Base (%)</Label>
                <Input
                  id="baseRate"
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                />
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active" />
              <Label htmlFor="active">Regra ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // Implementar criação/edição da regra
                setIsRuleDialogOpen(false);
              }}
            >
              {selectedRule ? "Atualizar" : "Criar"} Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}