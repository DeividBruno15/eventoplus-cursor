import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { Calendar, MapPin, Plus, Users, Search, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Events() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [locationFilter, setLocationFilter] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events", user?.userType],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/events");
      if (!response.ok) {
        throw new Error('Erro ao carregar eventos');
      }
      return await response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Filtrar eventos por localização (frontend)
  const filteredEvents = events.filter(event => {
    if (!locationFilter) return true;
    return event.location?.toLowerCase().includes(locationFilter.toLowerCase());
  });

  // Função para verificar se evento está fora da localização do usuário
  const isEventOutsideUserLocation = (event: any) => {
    if (!user?.location || !event.location) return false;
    
    // Extrai cidade do evento e do usuário (assumindo formato "Cidade, Estado")
    const eventCity = event.location.split(',')[0].trim().toLowerCase();
    const userCity = user.location.split(',')[0].trim().toLowerCase();
    
    return eventCity !== userCity;
  };

  // Função para lidar com clique em "Ver Detalhes"
  const handleEventClick = (event: any) => {
    if (user?.userType === 'prestador' && isEventOutsideUserLocation(event)) {
      setSelectedEvent(event);
      setShowLocationModal(true);
    } else {
      setLocation(`/events/${event.id}`);
    }
  };

  // Função para continuar mesmo com evento fora da localização
  const proceedToEvent = () => {
    if (selectedEvent) {
      setLocation(`/events/${selectedEvent.id}`);
    }
    setShowLocationModal(false);
    setSelectedEvent(null);
  };

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

        {/* Filtro de localização para prestadores */}
        {user.userType === "prestador" && (
          <div className="mb-6">
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Filtrar por cidade..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.category}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  {/* Orçamento do evento */}
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Orçamento:</span>
                      <span className="text-lg font-bold text-green-900">
                        R$ {parseFloat(event.budget || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {event.applicationsCount || 0} candidatos
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEventClick(event)}
                    >
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

        {/* Modal de aviso para eventos fora da localização */}
        <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Evento fora da sua localização
              </DialogTitle>
              <DialogDescription>
                Este evento está localizado em <strong>{selectedEvent?.location}</strong>, 
                que é diferente da sua localização cadastrada. 
                {user?.location && ` Você está cadastrado em ${user.location}.`}
                <br /><br />
                Participar de eventos fora da sua localização pode envolver custos adicionais 
                de deslocamento. Deseja continuar mesmo assim?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowLocationModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={proceedToEvent}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Continuar mesmo assim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
