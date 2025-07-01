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
  BarChart3,
  ChevronRight
} from "lucide-react";

export default function DashboardModern() {
  const { user } = useAuth();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="saas-page flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="saas-body-secondary">Carregando...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="saas-content">
        <div className="saas-space-tight">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="saas-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getDashboardContent = () => {
    const baseStats = [
      { 
        label: "Candidaturas Ativas", 
        value: (stats as any)?.applicationsCount?.toString() || "0", 
        icon: Calendar, 
        trend: "+12%",
        trendDirection: "up",
        description: "este mês"
      },
      { 
        label: "Serviços Cadastrados", 
        value: (stats as any)?.servicesCount?.toString() || "0", 
        icon: Building, 
        trend: "+2",
        trendDirection: "up", 
        description: "novos"
      },
      { 
        label: "Avaliação Média", 
        value: (stats as any)?.averageRating?.toString() || "5.0", 
        icon: Star, 
        trend: "5.0/5",
        trendDirection: "neutral", 
        description: "excelente"
      },
      { 
        label: "Visualizações", 
        value: "1.2k", 
        icon: Eye, 
        trend: "+8%",
        trendDirection: "up", 
        description: "semana"
      },
    ];

    switch (user.userType) {
      case "prestador":
        return {
          greeting: `Bem-vindo, ${user.username}`,
          subtitle: "Gerencie seus serviços e descubra oportunidades",
          stats: baseStats,
          quickActions: [
            { label: "Novo Serviço", href: "/services/create", icon: Plus },
            { label: "PIX Payment", href: "/pix-payment", icon: QrCode },
            { label: "Mensagens", href: "/chat", icon: MessageSquare },
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
              description: "este mês"
            },
            { 
              label: "Prestadores", 
              value: (stats as any)?.providersCount?.toString() || "0", 
              icon: Users, 
              trend: "+5",
              trendDirection: "up", 
              description: "novos"
            },
            { 
              label: "Orçamento Total", 
              value: `R$ ${(stats as any)?.totalBudget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, 
              icon: DollarSign, 
              trend: "No prazo",
              trendDirection: "neutral", 
              description: "controlado"
            },
            { 
              label: "Taxa de Sucesso", 
              value: "98%", 
              icon: Target, 
              trend: "+2%",
              trendDirection: "up", 
              description: "aprovação"
            },
          ],
          quickActions: [
            { label: "Criar Evento", href: "/events/create", icon: Plus },
            { label: "PIX Payment", href: "/pix-payment", icon: QrCode },
            { label: "Mensagens", href: "/chat", icon: MessageSquare },
          ]
        };
      case "anunciante":
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Promova seus espaços e maximize a ocupação",
          stats: [
            { 
              label: "Espaços Ativos", 
              value: (stats as any)?.venuesCount?.toString() || "0", 
              icon: Building, 
              trend: "+1",
              trendDirection: "up", 
              description: "novo"
            },
            { 
              label: "Reservas", 
              value: (stats as any)?.bookingsCount?.toString() || "0", 
              icon: Calendar, 
              trend: "+5",
              trendDirection: "up", 
              description: "semana"
            },
            { 
              label: "Receita Mensal", 
              value: "R$ 8.5k", 
              icon: TrendingUp, 
              trend: "+22%",
              trendDirection: "up", 
              description: "vs anterior"
            },
            { 
              label: "Avaliação", 
              value: "4.8", 
              icon: Star, 
              trend: "4.8/5",
              trendDirection: "neutral", 
              description: "excelente"
            },
          ],
          quickActions: [
            { label: "Novo Espaço", href: "/venues/create", icon: Plus },
            { label: "Ver Reservas", href: "/bookings", icon: Calendar },
            { label: "PIX Payment", href: "/pix-payment", icon: QrCode },
          ]
        };
      default:
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Bem-vindo à plataforma Evento+",
          stats: baseStats,
          quickActions: []
        };
    }
  };

  const dashboardData = getDashboardContent();

  return (
    <div className="saas-page">
      {/* Modern Clean Header */}
      <div className="saas-header">
        <div className="saas-header-content">
          <div className="space-y-1">
            <h1 className="saas-title-xl">{dashboardData.greeting}</h1>
            <p className="saas-body-secondary">{dashboardData.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="saas-badge-neutral text-xs">
              {user.userType === "prestador" && "Prestador"}
              {user.userType === "contratante" && "Organizador"}
              {user.userType === "anunciante" && "Anunciante"}
            </Badge>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="saas-content">
        {/* Modern Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const isPositive = stat.trendDirection === "up";
            const isNeutral = stat.trendDirection === "neutral";
            
            return (
              <Card key={index} className="saas-stat-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="saas-metric-label">{stat.label}</p>
                      <p className="saas-metric">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {isPositive && <ArrowUpRight className="h-3 w-3 text-emerald-600" />}
                        {!isPositive && !isNeutral && <ArrowDownRight className="h-3 w-3 text-red-600" />}
                        <span className={`saas-caption ${
                          isPositive ? 'saas-trend-positive' :
                          isNeutral ? 'saas-trend-neutral' : 'saas-trend-negative'
                        }`}>
                          {stat.trend}
                        </span>
                        <span className="saas-caption">• {stat.description}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded-lg hover:bg-accent transition-colors">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modern Action Cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="saas-card">
            <CardHeader className="pb-3">
              <CardTitle className="saas-title-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="saas-space-tight">
              {dashboardData.quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <div className="saas-list-item-simple">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="saas-body">{action.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="saas-card">
            <CardHeader className="pb-3">
              <CardTitle className="saas-title-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="saas-space-tight">
              {[
                {
                  icon: CheckCircle,
                  title: "Candidatura aprovada",
                  description: "Casamento em Jardim Botânico",
                  time: "2h"
                },
                {
                  icon: MessageSquare,
                  title: "Nova mensagem",
                  description: "De João Silva",
                  time: "4h"
                },
                {
                  icon: Star,
                  title: "Avaliação recebida",
                  description: "5 estrelas",
                  time: "1d"
                }
              ].map((activity, index) => (
                <div key={index} className="saas-list-item-simple">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      <div className="saas-status-dot saas-status-success"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="saas-body truncate">{activity.title}</p>
                      <p className="saas-caption truncate">{activity.description}</p>
                    </div>
                  </div>
                  <span className="saas-caption">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="saas-card">
            <CardHeader className="pb-3">
              <CardTitle className="saas-title-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="saas-space-content">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="saas-body-secondary">Perfil Completo</span>
                  <span className="saas-body">85%</span>
                </div>
                <Progress value={85} className="h-1.5" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="saas-space-tight">
                <div className="flex items-center justify-between">
                  <span className="saas-body-secondary">Tempo de Resposta</span>
                  <Badge className="saas-badge-success h-5">2h</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="saas-body-secondary">Taxa de Conversão</span>
                  <Badge className="saas-badge-success h-5">92%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="saas-body-secondary">Satisfação</span>
                  <Badge className="saas-badge-success h-5">4.8/5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Updates Section */}
        <Card className="saas-card">
          <CardHeader className="pb-3">
            <CardTitle className="saas-title-sm">Últimas Atualizações</CardTitle>
            <CardDescription className="saas-body-secondary">
              Novidades e melhorias na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="saas-card-minimal">
                <div className="flex items-start gap-3">
                  <div className="saas-status-dot saas-status-info mt-2"></div>
                  <div>
                    <p className="saas-body font-medium">Nova funcionalidade de pagamento PIX</p>
                    <p className="saas-body-secondary">Agora você pode receber pagamentos via PIX de forma instantânea.</p>
                    <span className="saas-caption">Hoje</span>
                  </div>
                </div>
              </div>
              
              <div className="saas-card-minimal">
                <div className="flex items-start gap-3">
                  <div className="saas-status-dot saas-status-success mt-2"></div>
                  <div>
                    <p className="saas-body font-medium">Sistema de recomendações IA</p>
                    <p className="saas-body-secondary">Descubra oportunidades personalizadas com nossa nova IA.</p>
                    <span className="saas-caption">2 dias atrás</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}