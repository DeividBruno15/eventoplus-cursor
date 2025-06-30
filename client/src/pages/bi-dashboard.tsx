import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Target,
  Globe,
  Award,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

interface BusinessMetrics {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    arpu: number;
    ltv: number;
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    churnRate: number;
    byType: {
      contratante: number;
      prestador: number;
      anunciante: number;
    };
  };
  events: {
    total: number;
    thisMonth: number;
    completionRate: number;
    averageValue: number;
    topCategories: Array<{
      category: string;
      count: number;
      revenue: number;
    }>;
  };
  marketplace: {
    totalTransactions: number;
    conversionRate: number;
    averageOrderValue: number;
    topPerformers: Array<{
      id: number;
      name: string;
      revenue: number;
      rating: number;
    }>;
  };
  geographic: {
    topCities: Array<{
      city: string;
      events: number;
      revenue: number;
    }>;
    coverage: number;
  };
  predictions: {
    nextMonthRevenue: number;
    userGrowth: number;
    marketExpansion: string[];
  };
}

interface KPITrends {
  period: string;
  revenue: number;
  users: number;
  events: number;
  satisfaction: number;
}

interface PerformanceIndicators {
  platformHealth: number;
  userSatisfaction: number;
  businessGrowth: number;
  technicalDebt: number;
  scalabilityIndex: number;
}

const COLORS = ['#3C5BFA', '#FFA94D', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BIDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch business metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<BusinessMetrics>({
    queryKey: ['/api/bi-analytics/metrics'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch KPI trends
  const { data: kpiTrends, isLoading: trendsLoading } = useQuery<KPITrends[]>({
    queryKey: ['/api/bi-analytics/kpi-trends'],
    refetchInterval: 300000,
  });

  // Fetch performance indicators
  const { data: performance, isLoading: performanceLoading } = useQuery<PerformanceIndicators>({
    queryKey: ['/api/bi-analytics/performance'],
    refetchInterval: 300000,
  });

  // Fetch executive summary
  const { data: executiveSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/bi-analytics/executive-summary'],
    refetchInterval: 300000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceIcon = (value: number) => {
    if (value >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (value >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  if (metricsLoading || trendsLoading || performanceLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando Business Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
          <p className="text-gray-600">Dashboard executivo com métricas e insights estratégicos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetchMetrics()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Performance Indicators */}
      {performance && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saúde da Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getPerformanceIcon(performance.platformHealth)}
                <span className={`text-2xl font-bold ${getPerformanceColor(performance.platformHealth)}`}>
                  {performance.platformHealth}%
                </span>
              </div>
              <Progress value={performance.platformHealth} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Satisfação dos Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getPerformanceIcon(performance.userSatisfaction)}
                <span className={`text-2xl font-bold ${getPerformanceColor(performance.userSatisfaction)}`}>
                  {performance.userSatisfaction}%
                </span>
              </div>
              <Progress value={performance.userSatisfaction} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Crescimento do Negócio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getPerformanceIcon(performance.businessGrowth)}
                <span className={`text-2xl font-bold ${getPerformanceColor(performance.businessGrowth)}`}>
                  {performance.businessGrowth}%
                </span>
              </div>
              <Progress value={performance.businessGrowth} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dívida Técnica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getPerformanceIcon(100 - performance.technicalDebt)}
                <span className={`text-2xl font-bold ${performance.technicalDebt <= 30 ? 'text-green-600' : 'text-red-600'}`}>
                  {performance.technicalDebt}%
                </span>
              </div>
              <Progress value={performance.technicalDebt} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Índice de Escalabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getPerformanceIcon(performance.scalabilityIndex)}
                <span className={`text-2xl font-bold ${getPerformanceColor(performance.scalabilityIndex)}`}>
                  {performance.scalabilityIndex}%
                </span>
              </div>
              <Progress value={performance.scalabilityIndex} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.revenue.monthly)}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {metrics.revenue.growth > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">+{metrics.revenue.growth.toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-600" />
                        <span className="text-red-600">{metrics.revenue.growth.toFixed(1)}%</span>
                      </>
                    )}
                    <span>vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.users.active)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(metrics.users.newThisMonth)} novos este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eventos Concluídos</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.events.completionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(metrics.events.thisMonth)} eventos este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.events.averageValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Valor médio por evento
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* KPI Trends Chart */}
          {kpiTrends && (
            <Card>
              <CardHeader>
                <CardTitle>Tendências de KPIs - Últimos 12 Meses</CardTitle>
                <CardDescription>Evolução dos principais indicadores de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={kpiTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'revenue') return [formatCurrency(value as number), 'Receita'];
                      if (name === 'users') return [formatNumber(value as number), 'Usuários'];
                      if (name === 'events') return [formatNumber(value as number), 'Eventos'];
                      if (name === 'satisfaction') return [`${(value as number).toFixed(1)}⭐`, 'Satisfação'];
                      return [value, name];
                    }} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3C5BFA" 
                      strokeWidth={2}
                      name="Receita"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#FFA94D" 
                      strokeWidth={2}
                      name="Usuários"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Eventos"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Satisfação"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(metrics.revenue.total)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Acumulado desde o início</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ARPU (Receita por Usuário)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(metrics.revenue.arpu)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Média mensal por usuário</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>LTV (Lifetime Value)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {formatCurrency(metrics.revenue.ltv)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Valor estimado por usuário</p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Receita por Categoria de Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.events.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="#3C5BFA" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total de Usuários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatNumber(metrics.users.total)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Churn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {metrics.users.churnRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Novos Usuários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatNumber(metrics.users.newThisMonth)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Este mês</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Ativação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {((metrics.users.active / metrics.users.total) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Usuários ativos</p>
                  </CardContent>
                </Card>
              </div>

              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo de Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Contratantes', value: metrics.users.byType.contratante },
                          { name: 'Prestadores', value: metrics.users.byType.prestador },
                          { name: 'Anunciantes', value: metrics.users.byType.anunciante }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Contratantes', value: metrics.users.byType.contratante },
                          { name: 'Prestadores', value: metrics.users.byType.prestador },
                          { name: 'Anunciantes', value: metrics.users.byType.anunciante }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total de Transações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatNumber(metrics.marketplace.totalTransactions)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {metrics.marketplace.conversionRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatCurrency(metrics.marketplace.averageOrderValue)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Prestadores por Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.marketplace.topPerformers.map((performer, index) => (
                      <div key={performer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{performer.name}</h4>
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm text-gray-600">{performer.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(performer.revenue)}</div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição Geográfica</CardTitle>
                  <CardDescription>Cobertura: {metrics.geographic.coverage}% das principais cidades</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.geographic.topCities}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="events" fill="#3C5BFA" name="Eventos" />
                      <Bar dataKey="revenue" fill="#FFA94D" name="Receita" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {metrics && (
            <>
              {/* Predictions Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita Prevista (Próximo Mês)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(metrics.predictions.nextMonthRevenue)}
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 text-sm">
                        +{((metrics.predictions.nextMonthRevenue - metrics.revenue.monthly) / metrics.revenue.monthly * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Crescimento de Usuários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      +{metrics.predictions.userGrowth.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Crescimento esperado</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expansão de Mercado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {metrics.predictions.marketExpansion.map((market, index) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-2">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Executive Summary */}
              {executiveSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Executivo</CardTitle>
                    <CardDescription>{(executiveSummary as any).period}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-3">Destaques do Período</h4>
                      <ul className="space-y-2">
                        {(executiveSummary as any).highlights?.map((highlight: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3">Recomendações Estratégicas</h4>
                      <ul className="space-y-2">
                        {(executiveSummary as any).recommendations?.map((rec: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-lg mb-3">Riscos Identificados</h4>
                      <ul className="space-y-2">
                        {(executiveSummary as any).risks?.map((risk: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}