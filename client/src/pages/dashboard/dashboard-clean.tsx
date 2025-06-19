import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, Users, Building, Star, TrendingUp, Plus, MessageSquare, Eye, Target, QrCode } from "lucide-react";

export default function DashboardClean() {
  const { user } = useAuth();

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Carregando...</div>
      </div>
    );
  }

  const getDashboardContent = () => {
    switch (user.userType) {
      case "prestador":
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Gerencie seus serviços e oportunidades",
          stats: [
            { label: "Candidaturas", value: (stats as any)?.applicationsCount?.toString() || "0", icon: Calendar, trend: "+12% este mês" },
            { label: "Serviços", value: (stats as any)?.servicesCount?.toString() || "0", icon: Building, trend: "+2 novos" },
            { label: "Avaliação", value: (stats as any)?.averageRating?.toString() || "5.0", icon: Star, trend: "Excelente" },
            { label: "Visualizações", value: "1.2k", icon: Eye, trend: "+8% semana" },
          ],
          actions: [
            { label: "Cadastrar Serviço", href: "/services/create", icon: Plus },
            { label: "Pagamento PIX", href: "/pix-payment", icon: QrCode },
            { label: "Mensagens", href: "/chat", icon: MessageSquare },
          ]
        };
      case "contratante":
        return {
          greeting: `Bem-vindo, ${user.username}`,
          subtitle: "Organize e gerencie seus eventos",
          stats: [
            { label: "Eventos", value: (stats as any)?.eventsCount?.toString() || "0", icon: Calendar, trend: "+3 este mês" },
            { label: "Prestadores", value: (stats as any)?.providersCount?.toString() || "0", icon: Users, trend: "12 contratados" },
            { label: "Orçamento", value: `R$ ${(stats as any)?.totalBudget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, icon: TrendingUp, trend: "Controlado" },
            { label: "Sucesso", value: "98%", icon: Target, trend: "98% aprovados" },
          ],
          actions: [
            { label: "Criar Evento", href: "/events/create", icon: Plus },
            { label: "Pagamento PIX", href: "/pix-payment", icon: QrCode },
            { label: "Mensagens", href: "/chat", icon: MessageSquare },
          ]
        };
      case "anunciante":
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Promova seus espaços para eventos",
          stats: [
            { label: "Espaços", value: (stats as any)?.venuesCount?.toString() || "0", icon: Building, trend: "+1 novo" },
            { label: "Reservas", value: (stats as any)?.bookingsCount?.toString() || "0", icon: Calendar, trend: "+5 semana" },
            { label: "Receita", value: "R$ 8.5k", icon: TrendingUp, trend: "+22% mês" },
            { label: "Avaliação", value: "4.8", icon: Star, trend: "Excelente" },
          ],
          actions: [
            { label: "Cadastrar Espaço", href: "/venues/create", icon: Plus },
            { label: "Pagamento PIX", href: "/pix-payment", icon: QrCode },
            { label: "Ver Reservas", href: "/bookings", icon: Calendar },
          ]
        };
      default:
        return {
          greeting: `Olá, ${user.username}`,
          subtitle: "Bem-vindo à plataforma",
          stats: [],
          actions: []
        };
    }
  };

  const dashboardData = getDashboardContent();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{dashboardData.greeting}</h1>
              <p className="text-gray-500 mt-1">{dashboardData.subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200">
              {user.userType === "prestador" && "Prestador"}
              {user.userType === "contratante" && "Organizador"}
              {user.userType === "anunciante" && "Anunciante"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                    </div>
                    <div className="ml-4 p-3 bg-gray-50 rounded-lg">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">Ações Rápidas</CardTitle>
            <CardDescription>Principais funcionalidades da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.actions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant={index === 0 ? "default" : "outline"} 
                      className={`w-full h-16 flex items-center justify-start space-x-3 hover:scale-[1.02] transition-transform duration-200 ${
                        index === 0 ? "bg-[#3C5BFA] hover:bg-blue-700" : "border-gray-200 hover:bg-gray-50"
                      }`}
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
        <Card className="mt-8 border border-gray-100 shadow-sm">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-lg font-semibold text-gray-900">Atividades Recentes</CardTitle>
            <CardDescription>Últimas atualizações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {user.userType === "prestador" && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Nova candidatura aprovada para "Casamento Silva"</span>
                    <span className="text-xs text-gray-400 ml-auto">2h atrás</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Serviço "DJ Profissional" visualizado 15 vezes</span>
                    <span className="text-xs text-gray-400 ml-auto">1 dia</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Nova avaliação recebida: 5 estrelas</span>
                    <span className="text-xs text-gray-400 ml-auto">2 dias</span>
                  </div>
                </>
              )}
              {user.userType === "contratante" && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Evento "Aniversário João" criado com sucesso</span>
                    <span className="text-xs text-gray-400 ml-auto">1h atrás</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">3 prestadores se candidataram ao seu evento</span>
                    <span className="text-xs text-gray-400 ml-auto">3h atrás</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Pagamento de R$ 500 processado</span>
                    <span className="text-xs text-gray-400 ml-auto">1 dia</span>
                  </div>
                </>
              )}
              {user.userType === "anunciante" && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Nova reserva confirmada para "Salão Primavera"</span>
                    <span className="text-xs text-gray-400 ml-auto">30min</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Espaço visualizado 45 vezes esta semana</span>
                    <span className="text-xs text-gray-400 ml-auto">2h atrás</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Fotos do espaço atualizadas</span>
                    <span className="text-xs text-gray-400 ml-auto">1 dia</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}