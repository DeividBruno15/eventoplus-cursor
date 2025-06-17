import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, MapPin, Plus, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Events() {
  const { user } = useAuth();
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      return await response.json();
    },
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {user.userType === "contratante" ? "Meus Eventos" : "Oportunidades"}
            </h1>
            <p className="text-gray-600">
              {user.userType === "contratante" 
                ? "Gerencie seus eventos e acompanhe o progresso"
                : "Encontre eventos para se candidatar"
              }
            </p>
          </div>
          
          {user.userType === "contratante" && (
            <Link href="/events/create">
              <Button className="bg-primary hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                Criar Evento
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : Array.isArray(events) && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {event.applicationsCount || 0} candidatos
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      {user.userType === "contratante" ? "Gerenciar" : "Ver Detalhes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user.userType === "contratante" 
                  ? "Nenhum evento criado ainda"
                  : "Nenhuma oportunidade disponível"
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {user.userType === "contratante"
                  ? "Crie seu primeiro evento e comece a receber propostas de prestadores qualificados."
                  : "Novas oportunidades aparecerão aqui quando organizadores publicarem eventos compatíveis com seus serviços."
                }
              </p>
              {user.userType === "contratante" && (
                <Link href="/events/create">
                  <Button className="bg-primary hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Primeiro Evento
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
