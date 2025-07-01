import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  DollarSign,
  Star,
  Target,
  Eye,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Lightbulb,
  Filter
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalEvents: number;
    totalViews: number;
    conversionRate: number;
    averageRating: number;
    responseTime: number;
    revenueGrowth: number;
    eventsGrowth: number;
  };
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    events: number;
    views: number;
    applications: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    value: number;
    color: string;
    revenue: number;
    growth: number;
  }>;
  userBehavior: {
    peakHours: Array<{ hour: number; activity: number }>;
    topPages: Array<{ page: string; views: number; bounceRate: number }>;
    deviceTypes: Array<{ type: string; percentage: number }>;
    geographicData: Array<{ location: string; users: number }>;
  };
  insights: Array<{
    id: string;
    type: 'positive' | 'negative' | 'neutral' | 'opportunity';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    metric: string;
    change: number;
    actionable: boolean;
    suggestion?: string;
  }>;
  predictions: {
    nextMonth: {
      revenue: number;
      events: number;
      confidence: number;
    };
    seasonalTrends: Array<{
      month: string;
      predicted: number;
      historical: number;
    }>;
  };
}

interface AdvancedAnalyticsProps {
  className?: string;
}

export default function AdvancedAnalytics({ className = "" }: AdvancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Buscar dados de analytics
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/advanced", timeRange],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/analytics/advanced?range=${timeRange}`);
      if (!response.ok) throw new Error('Erro ao carregar analytics');
      return response.json();
    },
  });

  // Cores para gráficos
  const COLORS = ['#3C5BFA', '#FFA94D', '#06D6A0', '#F72585', '#7209B7', '#560BAD'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'opportunity': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'negative': return 'border-red-200 bg-red-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge className="bg-red-100 text-red-800">Alto Impacto</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-800">Médio Impacto</Badge>;
      case 'low': return <Badge className="bg-green-100 text-green-800">Baixo Impacto</Badge>;
      default: return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados de analytics. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avançado</h2>
          <p className="text-gray-600">Insights automáticos e análise preditiva do seu negócio</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData.overview.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    analyticsData.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(Math.abs(analyticsData.overview.revenueGrowth))}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalEvents}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData.overview.eventsGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    analyticsData.overview.eventsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(Math.abs(analyticsData.overview.eventsGrowth))}
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{formatPercentage(analyticsData.overview.conversionRate)}</p>
                <p className="text-sm text-gray-500 mt-1">Visualizações → Aplicações</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold">{analyticsData.overview.averageRating.toFixed(1)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-500">de 5.0</span>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
        </TabsList>

        {/* Insights IA */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analyticsData.insights.map((insight) => (
              <Card key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h3 className="font-medium">{insight.title}</h3>
                    </div>
                    {getImpactBadge(insight.impact)}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      Métrica: <span className="font-medium">{insight.metric}</span>
                    </div>
                    <div className={`text-sm font-medium ${
                      insight.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {insight.change > 0 ? '+' : ''}{formatPercentage(insight.change)}
                    </div>
                  </div>
                  
                  {insight.actionable && insight.suggestion && (
                    <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Sugestão de Ação:</p>
                          <p className="text-sm text-gray-700">{insight.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Comportamento do Usuário */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Páginas mais visitadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Páginas Mais Visitadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.userBehavior.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{page.page}</p>
                        <p className="text-sm text-gray-600">{page.views} visualizações</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Taxa de Rejeição</p>
                        <p className={`text-sm font-medium ${
                          page.bounceRate < 40 ? 'text-green-600' : 
                          page.bounceRate < 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(page.bounceRate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dispositivos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Tipos de Dispositivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.userBehavior.deviceTypes.map((device) => (
                    <div key={device.type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{device.type}</span>
                        <span>{formatPercentage(device.percentage)}</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dados geográficos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Distribuição Geográfica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.userBehavior.geographicData.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <span>{location.location}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{location.users} usuários</span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Previsões */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Previsão próximo mês */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Previsões - Próximo Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Receita Prevista</p>
                      <p className="text-xl font-bold">{formatCurrency(analyticsData.predictions.nextMonth.revenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Eventos Previstos</p>
                      <p className="text-xl font-bold">{analyticsData.predictions.nextMonth.events}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Confiança da Previsão</span>
                    </div>
                    <Progress value={analyticsData.predictions.nextMonth.confidence} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      {formatPercentage(analyticsData.predictions.nextMonth.confidence)} de confiança
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Overview padrão */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Visualização dos principais indicadores e métricas da plataforma.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gráficos e análises das tendências ao longo do tempo.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}