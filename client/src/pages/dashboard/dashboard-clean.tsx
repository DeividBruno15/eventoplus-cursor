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
    <div className="min-h-screen bg-gray-50">
      {/* Header - Aplicando hierarquia tipográfica */}
      <div className="bg-white border-b border-gray-100 py-system-4 px-system-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="space-system-1">
              <h1 className="text-display-xl">{dashboardData.greeting}</h1>
              <p className="text-body-md text-muted-foreground">{dashboardData.subtitle}</p>
            </div>
            <Badge variant="secondary" className="touch-target">
              {user.userType === "prestador" && "Prestador"}
              {user.userType === "contratante" && "Organizador"}
              {user.userType === "anunciante" && "Anunciante"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-system-4 px-system-3">
        {/* Stats Grid - Aplicando sistema 8pt */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-system-3 mb-system-4">
          {dashboardData.stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover-enhanced focus-enhanced touch-target">
                <CardContent className="p-system-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-system-1">
                      <p className="text-body-sm">{stat.label}</p>
                      <p className="text-display-md">{stat.value}</p>
                      <p className="text-body-xs text-green-600 font-medium">{stat.trend}</p>
                    </div>
                    <div className="ml-system-2 p-system-1 bg-muted rounded-lg">
                      <IconComponent className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions - Hierarquia melhorada */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-100 p-system-3">
            <CardTitle className="text-display-md">Ações Rápidas</CardTitle>
            <CardDescription className="text-body-sm">Principais funcionalidades da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="p-system-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-system-2">
              {dashboardData.quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant={index === 0 ? "default" : "outline"}
                      className="w-full h-16 flex items-center justify-start space-x-3 touch-target hover-enhanced focus-enhanced"
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{action.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="mt-12 card-elevated">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-heading-md">Atividades Recentes</h3>
            <p className="text-body-sm mt-1">Últimas atualizações da sua conta</p>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {user.userType === "prestador" && (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-body flex-1">Nova candidatura aprovada para "Casamento Silva"</span>
                    <span className="text-caption">2h atrás</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
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