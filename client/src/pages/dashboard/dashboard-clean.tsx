import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { 
  Calendar, 
  Users, 
  Building, 
  Star, 
  TrendingUp, 
  Plus, 
  MessageSquare, 
  Eye, 
  Target, 
  QrCode,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Activity,
  BarChart3
} from "lucide-react";

export default function DashboardClean() {
  const { user } = useAuth();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-system-4 p-system-4">
        <div className="space-system-1">
          <Skeleton className="skeleton-enhanced h-8 w-[300px]" />
          <Skeleton className="skeleton-enhanced h-4 w-[200px]" />
        </div>
        <div className="grid gap-system-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="hover-enhanced">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="skeleton-enhanced h-4 w-[120px]" />
                <Skeleton className="skeleton-enhanced h-4 w-4" />
              </CardHeader>
              <CardContent className="p-system-2">
                <Skeleton className="skeleton-enhanced h-8 w-[80px] mb-2" />
                <Skeleton className="skeleton-enhanced h-3 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getDashboardContent = () => {
    switch (user.userType) {
      case "prestador":
        return {
          greeting: `Bem-vindo de volta, ${user.username}`,
          subtitle: "Gerencie seus serviços e descubra novas oportunidades",
          stats: [
            { 
              label: "Candidaturas Ativas", 
              value: (stats as any)?.applicationsCount?.toString() || "0", 
              icon: Calendar, 
              trend: "+12%",
              trendDirection: "up",
              description: "este mês",
              color: "text-blue-600",
              bgColor: "bg-blue-50"
            },
            { 
              label: "Serviços Cadastrados", 
              value: (stats as any)?.servicesCount?.toString() || "0", 
              icon: Building, 
              trend: "+2",
              trendDirection: "up", 
              description: "novos serviços",
              color: "text-green-600",
              bgColor: "bg-green-50"
            },
            { 
              label: "Avaliação Média", 
              value: (stats as any)?.averageRating?.toString() || "5.0", 
              icon: Star, 
              trend: "5.0/5.0",
              trendDirection: "neutral", 
              description: "excelente",
              color: "text-yellow-600",
              bgColor: "bg-yellow-50"
            },
            { 
              label: "Visualizações", 
              value: "1.2k", 
              icon: Eye, 
              trend: "+8%",
              trendDirection: "up", 
              description: "esta semana",
              color: "text-purple-600",
              bgColor: "bg-purple-50"
            },
          ],
          quickActions: [
            { label: "Novo Serviço", href: "/services/create", icon: Plus, variant: "default" },
            { label: "Pagamento PIX", href: "/pix-payment", icon: QrCode, variant: "outline" },
            { label: "Chat", href: "/chat", icon: MessageSquare, variant: "outline" },
          ]
        };
      case "contratante":
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Organize eventos memoráveis com facilidade",
          stats: [
            { 
              label: "Eventos Ativos", 
              value: (stats as any)?.eventsCount?.toString() || "0", 
              icon: Calendar, 
              trend: "+3",
              trendDirection: "up", 
              description: "este mês",
              color: "text-blue-600",
              bgColor: "bg-blue-50"
            },
            { 
              label: "Prestadores Contratados", 
              value: (stats as any)?.providersCount?.toString() || "0", 
              icon: Users, 
              trend: "+5",
              trendDirection: "up", 
              description: "novos",
              color: "text-green-600",
              bgColor: "bg-green-50"
            },
            { 
              label: "Orçamento Total", 
              value: `R$ ${(stats as any)?.totalBudget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, 
              icon: DollarSign, 
              trend: "Em dia",
              trendDirection: "neutral", 
              description: "controlado",
              color: "text-emerald-600",
              bgColor: "bg-emerald-50"
            },
            { 
              label: "Taxa de Sucesso", 
              value: "98%", 
              icon: Target, 
              trend: "+2%",
              trendDirection: "up", 
              description: "aprovação",
              color: "text-indigo-600",
              bgColor: "bg-indigo-50"
            },
          ],
          quickActions: [
            { label: "Criar Evento", href: "/events/create", icon: Plus, variant: "default" },
            { label: "Pagamento PIX", href: "/pix-payment", icon: QrCode, variant: "outline" },
            { label: "Chat", href: "/chat", icon: MessageSquare, variant: "outline" },
          ]
        };
      case "anunciante":
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Promova seus espaços e maximize sua ocupação",
          stats: [
            { 
              label: "Espaços Ativos", 
              value: (stats as any)?.venuesCount?.toString() || "0", 
              icon: Building, 
              trend: "+1",
              trendDirection: "up", 
              description: "novo espaço",
              color: "text-blue-600",
              bgColor: "bg-blue-50"
            },
            { 
              label: "Reservas do Mês", 
              value: (stats as any)?.bookingsCount?.toString() || "0", 
              icon: Calendar, 
              trend: "+5",
              trendDirection: "up", 
              description: "esta semana",
              color: "text-green-600",
              bgColor: "bg-green-50"
            },
            { 
              label: "Receita Mensal", 
              value: "R$ 8.5k", 
              icon: TrendingUp, 
              trend: "+22%",
              trendDirection: "up", 
              description: "vs mês anterior",
              color: "text-emerald-600",
              bgColor: "bg-emerald-50"
            },
            { 
              label: "Avaliação Média", 
              value: "4.8", 
              icon: Star, 
              trend: "4.8/5.0",
              trendDirection: "neutral", 
              description: "excelente",
              color: "text-yellow-600",
              bgColor: "bg-yellow-50"
            },
          ],
          quickActions: [
            { label: "Novo Espaço", href: "/venues/create", icon: Plus, variant: "default" },
            { label: "Ver Reservas", href: "/bookings", icon: Calendar, variant: "outline" },
            { label: "Pagamento PIX", href: "/pix-payment", icon: QrCode, variant: "outline" },
          ]
        };
      default:
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Bem-vindo à plataforma Evento+",
          stats: [],
          quickActions: []
        };
    }
  };

  const dashboardData = getDashboardContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header estilo TaskFlow - Mais espaçado e clean */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-8 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-display-xl text-gray-900">{dashboardData.greeting}</h1>
              <p className="text-body-lg text-gray-600">{dashboardData.subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                {user.userType === "prestador" && "Prestador"}
                {user.userType === "contratante" && "Organizador"}
                {user.userType === "anunciante" && "Anunciante"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Container principal com mais espaçamento */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Grid layout estilo TaskFlow - 3 colunas principais */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Coluna esquerda - Stats principais (8 colunas) */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Stats Cards - Layout horizontal mais espaçado */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {dashboardData.stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                          <div className="flex items-center space-x-1">
                            {stat.trendDirection === "up" && <ArrowUpRight className="w-4 h-4 text-green-600" />}
                            {stat.trendDirection === "down" && <ArrowDownRight className="w-4 h-4 text-red-600" />}
                            <span className={`text-sm font-medium ${
                              stat.trendDirection === "up" ? "text-green-600" : 
                              stat.trendDirection === "down" ? "text-red-600" : "text-gray-600"
                            }`}>
                              {stat.trend}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Chart Card - Similar ao gráfico Employee Work Hours */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {user.userType === "prestador" && "Performance dos Serviços"}
                      {user.userType === "contratante" && "Eventos & Orçamentos"}
                      {user.userType === "anunciante" && "Ocupação dos Espaços"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Análise dos últimos 6 meses
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Mensal</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-center space-y-2">
                    <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
                    <p className="text-gray-600">Gráfico de performance será carregado aqui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna direita - Quick Actions e Recent Activity (4 colunas) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Current Project/Quick Actions Card */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Ações Rápidas</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Link key={index} href={action.href}>
                      <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className={`p-2 rounded-lg ${
                          index === 0 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.label}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity - Estilo Schedule do TaskFlow */}
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Atividade Recente</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Últimas atualizações da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Activity items */}
                {user.userType === "prestador" && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Nova candidatura aprovada</p>
                        <p className="text-xs text-gray-600">Casamento Silva • R$ 2.500</p>
                      </div>
                      <span className="text-xs text-gray-500">2h</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Novo evento disponível</p>
                        <p className="text-xs text-gray-600">Aniversário de 15 anos • Fotografia</p>
                      </div>
                      <span className="text-xs text-gray-500">4h</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Avaliação recebida</p>
                        <p className="text-xs text-gray-600">5 estrelas • Serviço excelente!</p>
                      </div>
                      <span className="text-xs text-gray-500">1d</span>
                    </div>
                  </>
                )}
                
                {user.userType === "contratante" && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Evento criado com sucesso</p>
                        <p className="text-xs text-gray-600">Casamento na Praia • 15 Mai 2025</p>
                      </div>
                      <span className="text-xs text-gray-500">1h</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">3 candidaturas recebidas</p>
                        <p className="text-xs text-gray-600">Aniversário • Decoração</p>
                      </div>
                      <span className="text-xs text-gray-500">3h</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Pagamento processado</p>
                        <p className="text-xs text-gray-600">PIX • R$ 1.200 • DJ Premium</p>
                      </div>
                      <span className="text-xs text-gray-500">2d</span>
                    </div>
                  </>
                )}

                {user.userType === "anunciante" && (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Nova reserva confirmada</p>
                        <p className="text-xs text-gray-600">Salão Principal • 20 Jun 2025</p>
                      </div>
                      <span className="text-xs text-gray-500">30m</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Espaço atualizado</p>
                        <p className="text-xs text-gray-600">Jardim de Eventos • Fotos adicionadas</p>
                      </div>
                      <span className="text-xs text-gray-500">2h</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Receita do mês</p>
                        <p className="text-xs text-gray-600">R$ 15.400 • +12% vs mês anterior</p>
                      </div>
                      <span className="text-xs text-gray-500">1d</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
                    <span className="text-body flex-1">Serviço "DJ Profissional" visualizado 15 vezes</span>
                    <span className="text-caption">1 dia</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">Nova avaliação recebida: 5 estrelas</span>
                    <span className="text-caption">2 dias</span>
                  </div>
                </>
              )}
              {user.userType === "contratante" && (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">Evento "Aniversário João" criado com sucesso</span>
                    <span className="text-caption">1h atrás</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">3 prestadores se candidataram ao seu evento</span>
                    <span className="text-caption">3h atrás</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">Pagamento de R$ 500 processado</span>
                    <span className="text-caption">1 dia</span>
                  </div>
                </>
              )}
              {user.userType === "anunciante" && (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">Nova reserva confirmada para "Salão Primavera"</span>
                    <span className="text-caption">30min</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">Espaço visualizado 45 vezes esta semana</span>
                    <span className="text-caption">2h atrás</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">Fotos do espaço atualizadas</span>
                    <span className="text-caption">1 dia</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}