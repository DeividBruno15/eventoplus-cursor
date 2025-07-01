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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dashboardData.greeting}</h1>
              <p className="text-gray-600 mt-2">{dashboardData.subtitle}</p>
            </div>
            <Badge variant="secondary">
              {user.userType === "prestador" && "Prestador"}
              {user.userType === "contratante" && "Organizador"}
              {user.userType === "anunciante" && "Anunciante"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-green-600 font-medium">{stat.trend}</p>
                  </div>
                  <div className="ml-4 p-3 bg-gray-100 rounded-lg">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Ações Rápidas</h3>
            <p className="text-gray-600 mt-1">Principais funcionalidades da sua conta</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <button 
                      className={`w-full h-16 flex items-center justify-start space-x-3 ${
                        index === 0 ? "btn-primary-enhanced" : "btn-secondary-enhanced"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-semibold">{action.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

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