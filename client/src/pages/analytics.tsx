import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Eye, MessageCircle, CheckCircle, DollarSign, Calendar, Users, Star } from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();

  // Buscar dados de analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Mock data para demonstração (será substituído por dados reais)
  const mockData = {
    overview: {
      totalViews: 1247,
      totalLeads: 89,
      totalApplications: 34,
      conversionRate: 7.1,
      averageRating: 4.8,
      totalRevenue: 15420
    },
    viewsData: [
      { month: 'Jan', views: 65, leads: 12 },
      { month: 'Fev', views: 89, leads: 19 },
      { month: 'Mar', views: 123, leads: 23 },
      { month: 'Abr', views: 156, leads: 31 },
      { month: 'Mai', views: 198, leads: 42 },
      { month: 'Jun', views: 234, leads: 56 }
    ],
    applicationsData: [
      { month: 'Jan', applications: 5, approved: 3, rejected: 2 },
      { month: 'Fev', applications: 8, approved: 6, rejected: 2 },
      { month: 'Mar', applications: 12, approved: 9, rejected: 3 },
      { month: 'Abr', applications: 15, approved: 11, rejected: 4 },
      { month: 'Mai', applications: 18, approved: 14, rejected: 4 },
      { month: 'Jun', applications: 22, approved: 17, rejected: 5 }
    ],
    categoryData: [
      { name: 'Casamentos', value: 45, color: '#3C5BFA' },
      { name: 'Corporativo', value: 25, color: '#FFA94D' },
      { name: 'Aniversários', value: 20, color: '#10B981' },
      { name: 'Outros', value: 10, color: '#F59E0B' }
    ],
    recentActivity: [
      { type: 'view', description: 'Novo visitante visualizou seu perfil', time: '2 min atrás' },
      { type: 'application', description: 'Candidatura aprovada para evento corporativo', time: '1 hora atrás' },
      { type: 'message', description: 'Nova mensagem de cliente potencial', time: '3 horas atrás' },
      { type: 'review', description: 'Nova avaliação 5 estrelas recebida', time: '5 horas atrás' }
    ]
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="h-4 w-4 text-blue-600" />;
      case 'application': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'message': return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case 'review': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user || user.userType !== 'prestador') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Esta página é exclusiva para prestadores de serviços.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Analytics & Métricas</h1>
          <p className="text-gray-600">
            Acompanhe o desempenho do seu perfil e identifique oportunidades de crescimento
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações Totais</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.overview.totalViews.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.overview.totalLeads}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.overview.conversionRate}%</div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.1% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.overview.averageRating}</div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < Math.floor(mockData.overview.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="applications">Candidaturas</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visualizações e Leads</CardTitle>
                  <CardDescription>Tendência de visualizações e leads ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockData.viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#3C5BFA" strokeWidth={2} />
                      <Line type="monotone" dataKey="leads" stroke="#FFA94D" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>Tipos de eventos mais procurados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
                <CardDescription>Indicadores de qualidade do seu perfil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Resposta</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tempo Médio de Resposta</span>
                      <span>2.4h</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfação do Cliente</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completude do Perfil</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Candidaturas</CardTitle>
                <CardDescription>Evolução das suas candidaturas e aprovações</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockData.applicationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#3C5BFA" name="Candidaturas" />
                    <Bar dataKey="approved" fill="#10B981" name="Aprovadas" />
                    <Bar dataKey="rejected" fill="#EF4444" name="Rejeitadas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total de Candidaturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{mockData.overview.totalApplications}</div>
                  <p className="text-sm text-gray-600">Últimos 6 meses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Aprovação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">74%</div>
                  <p className="text-sm text-gray-600">Média histórica</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Valor Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">R$ 2.840</div>
                  <p className="text-sm text-gray-600">Por projeto aprovado</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.categoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{category.value}%</div>
                          <div className="text-sm text-gray-500">dos projetos</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Oportunidades de Crescimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Eventos Corporativos</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Alta demanda com orçamentos maiores. Considere expandir seu portfólio.
                      </p>
                      <Badge variant="secondary">+35% demanda</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Formaturas</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Temporada de formaturas se aproximando. Oportunidade sazonal.
                      </p>
                      <Badge variant="secondary">Sazonal</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas interações e eventos do seu perfil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Horários de Maior Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">09h - 12h</span>
                      <Progress value={85} className="w-32 h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">14h - 17h</span>
                      <Progress value={92} className="w-32 h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">19h - 22h</span>
                      <Progress value={67} className="w-32 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dias da Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Segunda-feira</span>
                      <Progress value={78} className="w-32 h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Terça-feira</span>
                      <Progress value={85} className="w-32 h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Quarta-feira</span>
                      <Progress value={92} className="w-32 h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Quinta-feira</span>
                      <Progress value={88} className="w-32 h-2" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sexta-feira</span>
                      <Progress value={75} className="w-32 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}