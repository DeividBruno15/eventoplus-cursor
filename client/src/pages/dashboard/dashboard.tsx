import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Users, MapPin, TrendingUp, Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const getDashboardContent = () => {
    switch (user.userType) {
      case "prestador":
        return {
          title: "Dashboard do Prestador",
          description: "Gerencie seus serviços e candidaturas",
          stats: [
            { label: "Candidaturas Ativas", value: "0", icon: Calendar },
            { label: "Serviços Cadastrados", value: "0", icon: Users },
            { label: "Avaliação Média", value: "5.0", icon: TrendingUp },
          ],
          actions: [
            { label: "Cadastrar Serviço", href: "/services/create", icon: Plus },
            { label: "Ver Oportunidades", href: "/events", icon: Calendar },
          ]
        };
      case "contratante":
        return {
          title: "Dashboard do Organizador",
          description: "Organize e gerencie seus eventos",
          stats: [
            { label: "Eventos Ativos", value: "0", icon: Calendar },
            { label: "Prestadores Contratados", value: "0", icon: Users },
            { label: "Orçamento Total", value: "R$ 0", icon: TrendingUp },
          ],
          actions: [
            { label: "Criar Evento", href: "/events/create", icon: Plus },
            { label: "Buscar Prestadores", href: "/providers", icon: Users },
          ]
        };
      case "anunciante":
        return {
          title: "Dashboard do Anunciante",
          description: "Gerencie seus espaços e reservas",
          stats: [
            { label: "Espaços Cadastrados", value: "0", icon: MapPin },
            { label: "Reservas Ativas", value: "0", icon: Calendar },
            { label: "Taxa de Ocupação", value: "0%", icon: TrendingUp },
          ],
          actions: [
            { label: "Cadastrar Espaço", href: "/venues/create", icon: Plus },
            { label: "Ver Reservas", href: "/bookings", icon: Calendar },
          ]
        };
      default:
        return {
          title: "Dashboard",
          description: "Bem-vindo ao Evento+",
          stats: [],
          actions: []
        };
    }
  };

  const dashboardContent = getDashboardContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            {dashboardContent.title}
          </h1>
          <p className="text-gray-600">
            {dashboardContent.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardContent.stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-black">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Comece a usar o Evento+ com essas ações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardContent.actions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button variant="outline" className="w-full justify-start h-12">
                    <action.icon className="w-5 h-5 mr-2" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Plano</CardTitle>
            <CardDescription>
              Você está no plano gratuito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Aproveite mais recursos com nossos planos pagos
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Plano Gratuito Ativo</span>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="bg-primary hover:bg-blue-700">
                  Fazer Upgrade
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
