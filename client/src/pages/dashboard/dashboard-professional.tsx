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

export default function DashboardProfessional() {
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
      <div className="space-y-8 p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px] mb-2" />
                <Skeleton className="h-3 w-[100px]" />
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
    <div className="min-h-screen bg-background">
      {/* Modern Header Section */}
      <div className="border-b bg-gradient-to-r from-background to-muted/20">
        <div className="saas-container py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="saas-section-title">{dashboardData.greeting}</h1>
              <p className="saas-section-subtitle">{dashboardData.subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm font-medium">
                {user.userType === "prestador" && "Prestador de Serviços"}
                {user.userType === "contratante" && "Organizador de Eventos"}
                {user.userType === "anunciante" && "Anunciante de Espaços"}
              </Badge>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="saas-container py-8 space-y-8">
        {/* Professional Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const isPositive = stat.trendDirection === "up";
            const isNeutral = stat.trendDirection === "neutral";
            
            return (
              <Card key={index} className="saas-stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg transition-transform group-hover:scale-110`}>
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="saas-metric-small">{stat.value}</div>
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 ${
                        isPositive ? 'saas-trend-positive' :
                        isNeutral ? 'saas-trend-neutral' : 'saas-trend-negative'
                      }`}>
                        {isPositive && <ArrowUpRight className="h-3 w-3" />}
                        {!isPositive && !isNeutral && <ArrowDownRight className="h-3 w-3" />}
                        <span className="text-xs font-medium">{stat.trend}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{stat.description}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Ações Rápidas</span>
            </CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardData.quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant={action.variant as any} 
                      className="w-full justify-start h-auto p-4 text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{action.label}</div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity with Better Design */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Atividades Recentes</span>
              </CardTitle>
              <CardDescription>
                Acompanhe as últimas interações na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: CheckCircle,
                  iconColor: "text-green-600",
                  iconBg: "bg-green-50",
                  title: "Nova candidatura aprovada",
                  description: "Evento: Casamento em Jardim Botânico",
                  time: "2 horas atrás"
                },
                {
                  icon: MessageSquare,
                  iconColor: "text-blue-600",
                  iconBg: "bg-blue-50",
                  title: "Mensagem recebida",
                  description: "De: João Silva - Sobre orçamento",
                  time: "4 horas atrás"
                },
                {
                  icon: Star,
                  iconColor: "text-yellow-600",
                  iconBg: "bg-yellow-50",
                  title: "Nova avaliação recebida",
                  description: "5 estrelas - Excelente trabalho!",
                  time: "1 dia atrás"
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`${activity.iconBg} p-2 rounded-full flex-shrink-0`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Visão Geral</span>
              </CardTitle>
              <CardDescription>
                Resumo da sua performance na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Perfil Completo</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Resposta Média</span>
                  <Badge variant="outline" className="saas-badge-success">2h</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                  <Badge variant="outline" className="saas-badge-success">92%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Satisfação</span>
                  <Badge variant="outline" className="saas-badge-success">4.8/5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}