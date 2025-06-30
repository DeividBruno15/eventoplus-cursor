import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Award,
  Clock,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, subDays, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3C5BFA', '#FFA94D', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

export default function AnalyticsAdvanced() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - Em produção viria das APIs
  const mockData = {
    overview: {
      totalUsers: 2847,
      userGrowth: 15.2,
      totalEvents: 1256,
      eventGrowth: 23.8,
      totalRevenue: 89456.78,
      revenueGrowth: 18.9,
      avgRating: 4.7,
      ratingChange: 0.3
    },
    userMetrics: {
      dailyActiveUsers: 423,
      weeklyActiveUsers: 1847,
      monthlyActiveUsers: 2847,
      retentionRate: 78.5,
      churnRate: 3.2
    },
    eventMetrics: {
      totalEvents: 1256,
      activeEvents: 234,
      completedEvents: 897,
      cancelledEvents: 125,
      avgEventSize: 45,
      popularCategories: [
        { name: 'Casamentos', value: 35, color: '#3C5BFA' },
        { name: 'Corporativo', value: 28, color: '#FFA94D' },
        { name: 'Aniversários', value: 20, color: '#10B981' },
        { name: 'Formaturas', value: 17, color: '#EF4444' }
      ]
    },
    revenueMetrics: {
      totalRevenue: 89456.78,
      monthlyRecurring: 34567.89,
      avgOrderValue: 567.32,
      conversionRate: 12.4,
      topRegions: [
        { name: 'São Paulo', revenue: 35600, events: 456 },
        { name: 'Rio de Janeiro', revenue: 28900, events: 378 },
        { name: 'Belo Horizonte', revenue: 15200, events: 234 },
        { name: 'Brasília', revenue: 9756, events: 188 }
      ]
    },
    timeSeriesData: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'dd/MM'),
      users: Math.floor(Math.random() * 100) + 50,
      events: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      bookings: Math.floor(Math.random() * 15) + 3
    }))
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const MetricCard = ({ title, value, change, icon: Icon, format = 'number' }: any) => {
    const isPositive = change > 0;
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold mt-1">
                {format === 'currency' ? formatCurrency(value) : 
                 format === 'rating' ? value.toFixed(1) :
                 formatNumber(value)}
              </p>
              <div className="flex items-center mt-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {change > 0 ? '+' : ''}{change}% vs período anterior
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#3C5BFA]/10 rounded-full">
              <Icon className="w-6 h-6 text-[#3C5BFA]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Necessário</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar o analytics avançado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Avançado</h1>
          <p className="text-gray-600">Dashboard executivo com métricas de performance e insights</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Usuários"
              value={mockData.overview.totalUsers}
              change={mockData.overview.userGrowth}
              icon={Users}
            />
            <MetricCard
              title="Total de Eventos"
              value={mockData.overview.totalEvents}
              change={mockData.overview.eventGrowth}
              icon={Calendar}
            />
            <MetricCard
              title="Receita Total"
              value={mockData.overview.totalRevenue}
              change={mockData.overview.revenueGrowth}
              icon={DollarSign}
              format="currency"
            />
            <MetricCard
              title="Avaliação Média"
              value={mockData.overview.avgRating}
              change={mockData.overview.ratingChange}
              icon={Star}
              format="rating"
            />
          </div>

          {/* Gráfico de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendências Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3C5BFA" 
                    strokeWidth={2}
                    name="Usuários Ativos"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="events" 
                    stroke="#FFA94D" 
                    strokeWidth={2}
                    name="Eventos Criados"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Receita (R$)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Métricas de Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taxa de Retenção</span>
                  <span className="text-lg font-bold text-green-600">78.5%</span>
                </div>
                <Progress value={78.5} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taxa de Conversão</span>
                  <span className="text-lg font-bold text-blue-600">12.4%</span>
                </div>
                <Progress value={12.4} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Satisfação</span>
                  <span className="text-lg font-bold text-purple-600">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Prestadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'DJ Premium Events', rating: 4.9, events: 45 },
                    { name: 'Catering Elite', rating: 4.8, events: 38 },
                    { name: 'Foto & Vídeo Pro', rating: 4.7, events: 32 },
                    { name: 'Decorações Luxo', rating: 4.6, events: 28 }
                  ].map((provider, index) => (
                    <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3C5BFA] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-sm text-gray-600">{provider.events} eventos</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Diários</span>
                    <span className="font-bold">{formatNumber(mockData.userMetrics.dailyActiveUsers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Semanais</span>
                    <span className="font-bold">{formatNumber(mockData.userMetrics.weeklyActiveUsers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mensais</span>
                    <span className="font-bold">{formatNumber(mockData.userMetrics.monthlyActiveUsers)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#3C5BFA] rounded-full"></div>
                      <span className="text-sm">Contratantes</span>
                    </div>
                    <span className="font-bold">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#FFA94D] rounded-full"></div>
                      <span className="text-sm">Prestadores</span>
                    </div>
                    <span className="font-bold">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                      <span className="text-sm">Anunciantes</span>
                    </div>
                    <span className="font-bold">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Taxa de Retenção</span>
                    <span className="font-bold text-green-600">{mockData.userMetrics.retentionRate}%</span>
                  </div>
                  <Progress value={mockData.userMetrics.retentionRate} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Taxa de Churn</span>
                    <span className="font-bold text-red-600">{mockData.userMetrics.churnRate}%</span>
                  </div>
                  <Progress value={mockData.userMetrics.churnRate} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { status: 'Ativos', count: mockData.eventMetrics.activeEvents, fill: '#3C5BFA' },
                    { status: 'Concluídos', count: mockData.eventMetrics.completedEvents, fill: '#10B981' },
                    { status: 'Cancelados', count: mockData.eventMetrics.cancelledEvents, fill: '#EF4444' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.eventMetrics.popularCategories.map((category, index) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-gray-600">{category.value}%</span>
                      </div>
                      <Progress value={category.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockData.revenueMetrics.totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Recorrente</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockData.revenueMetrics.monthlyRecurring)}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold">{formatCurrency(mockData.revenueMetrics.avgOrderValue)}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold">{mockData.revenueMetrics.conversionRate}%</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Receita por Região
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.revenueMetrics.topRegions.map((region, index) => (
                  <div key={region.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#3C5BFA] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{region.name}</div>
                        <div className="text-sm text-gray-600">{region.events} eventos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(region.revenue)}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(region.revenue / region.events)} por evento
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <h4 className="font-semibold text-blue-800 mb-2">Crescimento Acelerado</h4>
              <p className="text-sm text-blue-700">
                Usuários cresceram 15.2% no último mês. Considere expandir a equipe de suporte.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <h4 className="font-semibold text-green-800 mb-2">Alta Satisfação</h4>
              <p className="text-sm text-green-700">
                Avaliação média de 4.7/5. Destaque os melhores prestadores no marketing.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
              <h4 className="font-semibold text-orange-800 mb-2">Oportunidade Regional</h4>
              <p className="text-sm text-orange-700">
                São Paulo representa 40% da receita. Explore mercados em outras capitais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}