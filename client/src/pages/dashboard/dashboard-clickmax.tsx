import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, Users, MapPin, TrendingUp, Plus, ArrowRight, Building, Star, Zap, Target } from "lucide-react";
import type { DashboardStats } from "@shared/types";

export default function DashboardClickMax() {
  const { user } = useAuth();

  // Buscar estatísticas do dashboard
  const { data: stats = {} } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  const getDashboardContent = () => {
    switch (user.userType) {
      case "prestador":
        return {
          title: "Dashboard do Prestador",
          subtitle: "Gerencie seus serviços e oportunidades",
          greeting: `Olá, ${user.firstName || user.username}!`,
          stats: [
            { 
              label: "Candidaturas Ativas", 
              value: (stats as any)?.applicationsCount?.toString() || "0", 
              icon: Calendar,
              color: "blue",
              change: "+12% este mês"
            },
            { 
              label: "Serviços Cadastrados", 
              value: (stats as any)?.servicesCount?.toString() || "0", 
              icon: Users,
              color: "green",
              change: "+2 novos"
            },
            { 
              label: "Avaliação Média", 
              value: (stats as any)?.averageRating?.toString() || "5.0", 
              icon: Star,
              color: "yellow",
              change: "Excelente!"
            },
            { 
              label: "Receita Mensal", 
              value: "R$ 3.240", 
              icon: TrendingUp,
              color: "purple",
              change: "+18% vs mês anterior"
            },
          ],
          actions: [
            { label: "Cadastrar Serviço", href: "/services/create", icon: Plus, primary: true },
            { label: "Ver Oportunidades", href: "/events", icon: Calendar, primary: false },
            { label: "Meus Serviços", href: "/services", icon: Building, primary: false },
          ]
        };
      case "contratante":
        return {
          title: "Dashboard do Organizador",
          subtitle: "Organize e gerencie seus eventos",
          greeting: `Bem-vindo, ${user.firstName || user.username}!`,
          stats: [
            { 
              label: "Eventos Ativos", 
              value: (stats as any)?.eventsCount?.toString() || "0", 
              icon: Calendar,
              color: "blue",
              change: "+3 este mês"
            },
            { 
              label: "Prestadores Contratados", 
              value: (stats as any)?.providersCount?.toString() || "0", 
              icon: Users,
              color: "green",
              change: "Em 12 eventos"
            },
            { 
              label: "Orçamento Total", 
              value: `R$ ${(stats as any)?.totalBudget?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, 
              icon: TrendingUp,
              color: "purple",
              change: "Bem gerenciado"
            },
            { 
              label: "Taxa de Sucesso", 
              value: "98%", 
              icon: Target,
              color: "yellow",
              change: "Eventos realizados"
            },
          ],
          actions: [
            { label: "Criar Evento", href: "/events/create", icon: Plus, primary: true },
            { label: "Buscar Prestadores", href: "/providers", icon: Users, primary: false },
            { label: "Meus Eventos", href: "/events", icon: Calendar, primary: false },
          ]
        };
      case "anunciante":
        return {
          title: "Dashboard do Anunciante",
          subtitle: "Gerencie seus espaços e reservas",
          greeting: `Olá, ${user.firstName || user.username}!`,
          stats: [
            { 
              label: "Espaços Cadastrados", 
              value: (stats as any)?.venuesCount?.toString() || "0", 
              icon: Building,
              color: "blue",
              change: "+1 novo espaço"
            },
            { 
              label: "Reservas Ativas", 
              value: (stats as any)?.bookingsCount?.toString() || "0", 
              icon: Calendar,
              color: "green",
              change: "Taxa: 85%"
            },
            { 
              label: "Receita Mensal", 
              value: "R$ 8.500", 
              icon: TrendingUp,
              color: "purple",
              change: "+25% vs mês anterior"
            },
            { 
              label: "Avaliação Média", 
              value: "4.8", 
              icon: Star,
              color: "yellow",
              change: "Muito bem avaliado"
            },
          ],
          actions: [
            { label: "Cadastrar Espaço", href: "/venues/create", icon: Plus, primary: true },
            { label: "Gerenciar Reservas", href: "/bookings", icon: Calendar, primary: false },
            { label: "Meus Espaços", href: "/venues", icon: Building, primary: false },
          ]
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Bem-vindo à plataforma",
          greeting: `Olá, ${user.username}!`,
          stats: [],
          actions: []
        };
    }
  };

  const dashboardData = getDashboardContent();

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          bg: "bg-blue-50",
          icon: "text-blue-500",
          iconBg: "bg-blue-100",
        };
      case "green":
        return {
          bg: "bg-green-50",
          icon: "text-green-500",
          iconBg: "bg-green-100",
        };
      case "purple":
        return {
          bg: "bg-purple-50",
          icon: "text-purple-500",
          iconBg: "bg-purple-100",
        };
      case "yellow":
        return {
          bg: "bg-yellow-50",
          icon: "text-yellow-500",
          iconBg: "bg-yellow-100",
        };
      default:
        return {
          bg: "bg-gray-50",
          icon: "text-gray-500",
          iconBg: "bg-gray-100",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#3C5BFA] to-[#5B7FFF] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                Dashboard
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{dashboardData.greeting}</h1>
              <p className="text-blue-100 text-lg">{dashboardData.subtitle}</p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {dashboardData.stats.map((stat, index) => {
            const colorClasses = getColorClasses(stat.color);
            const Icon = stat.icon;
            
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-6">
                  <div className={`${colorClasses.bg} rounded-2xl p-4 mb-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${colorClasses.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">{stat.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.href}>
                  <Card className={`border-2 ${action.primary ? 'border-[#3C5BFA] bg-gradient-to-br from-[#3C5BFA] to-[#5B7FFF] text-white' : 'border-gray-200 hover:border-[#3C5BFA]'} transition-all duration-300 group cursor-pointer`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${action.primary ? 'bg-white/20' : 'bg-[#3C5BFA]/10'} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-8 h-8 ${action.primary ? 'text-white' : 'text-[#3C5BFA]'}`} />
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${action.primary ? 'text-white' : 'text-gray-900'}`}>
                        {action.label}
                      </h3>
                      <ArrowRight className={`w-5 h-5 mx-auto ${action.primary ? 'text-white' : 'text-gray-500'} group-hover:translate-x-1 transition-transform`} />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Atividade Recente</CardTitle>
            <CardDescription>Acompanhe suas atividades mais recentes na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {user.userType === "contratante" && (
                <>
                  <div className="flex items-center p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Evento criado com sucesso</h4>
                      <p className="text-sm text-gray-600">Casamento Silva - 200 convidados</p>
                    </div>
                    <Badge className="bg-green-100 text-green-600">Hoje</Badge>
                  </div>
                  
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Nova proposta recebida</h4>
                      <p className="text-sm text-gray-600">DJ Premium enviou proposta para seu evento</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-600">2h atrás</Badge>
                  </div>
                </>
              )}
              
              {user.userType === "prestador" && (
                <>
                  <div className="flex items-center p-4 bg-yellow-50 rounded-xl">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Nova avaliação recebida</h4>
                      <p className="text-sm text-gray-600">Você recebeu 5 estrelas no evento de ontem</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-600">1h atrás</Badge>
                  </div>
                  
                  <div className="flex items-center p-4 bg-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Proposta aceita</h4>
                      <p className="text-sm text-gray-600">Sua proposta para Evento Corporativo foi aceita</p>
                    </div>
                    <Badge className="bg-green-100 text-green-600">3h atrás</Badge>
                  </div>
                </>
              )}
              
              {user.userType === "anunciante" && (
                <>
                  <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Nova reserva confirmada</h4>
                      <p className="text-sm text-gray-600">Salão Premium reservado para 25 de Janeiro</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-600">30min atrás</Badge>
                  </div>
                  
                  <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Espaço visualizado</h4>
                      <p className="text-sm text-gray-600">Seu espaço foi visualizado 47 vezes hoje</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-600">Hoje</Badge>
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