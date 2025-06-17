import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlarmClock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaEvent {
  id: number;
  title: string;
  eventDate: string;
  eventLocation?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: 'event' | 'venue_reservation' | 'service';
  description?: string;
  clientName?: string;
  providerName?: string;
  value?: number;
}

export default function Agenda() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // Buscar eventos da agenda baseado no tipo de usuário
  const { data: agendaEvents = [], isLoading } = useQuery<AgendaEvent[]>({
    queryKey: ["/api/agenda"],
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      scheduled: { color: "bg-blue-100 text-blue-800", icon: AlarmClock, label: "Agendado" },
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Confirmado" },
      completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle, label: "Concluído" },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelado" }
    };
    
    const config = configs[status as keyof typeof configs] || configs.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getEventTypeLabel = (type: string) => {
    switch(type) {
      case 'event': return 'Evento';
      case 'venue_reservation': return 'Reserva de Espaço';
      case 'service': return 'Serviço';
      default: return type;
    }
  };

  const getAgendaDescription = () => {
    switch(user?.userType) {
      case 'prestador':
        return 'Seus eventos aceitos e serviços agendados aparecerão aqui automaticamente.';
      case 'contratante':
        return 'Os eventos que você criou e serviços contratados aparecerão na sua agenda.';
      case 'anunciante':
        return 'As reservas confirmadas dos seus espaços aparecerão na agenda.';
      default:
        return 'Sua agenda de eventos e compromissos.';
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEventsForDate = (date: Date) => {
    return agendaEvents.filter(event => 
      isSameDay(parseISO(event.eventDate), date)
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Agenda</h1>
          <p className="text-gray-600 mt-1">{getAgendaDescription()}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'week' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              >
                ← Semana Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                Próxima Semana →
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {getWeekDays().map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Card key={index} className={`${isToday ? 'ring-2 ring-[#3C5BFA]' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-center">
                      <div className="font-medium">
                        {format(day, "EEE", { locale: ptBR })}
                      </div>
                      <div className={`text-2xl ${isToday ? 'text-[#3C5BFA] font-bold' : ''}`}>
                        {format(day, "dd")}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 min-h-[200px]">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-2 bg-[#3C5BFA]/10 rounded-lg border-l-4 border-[#3C5BFA] text-xs"
                        >
                          <div className="font-medium truncate" title={event.title}>
                            {event.title}
                          </div>
                          <div className="text-gray-600 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(event.eventDate), "HH:mm")}
                          </div>
                          {event.eventLocation && (
                            <div className="text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{event.eventLocation}</span>
                            </div>
                          )}
                          <div className="mt-2">
                            {getStatusBadge(event.status)}
                          </div>
                        </div>
                      ))}
                      
                      {dayEvents.length === 0 && (
                        <div className="text-gray-400 text-center py-8">
                          Nenhum evento
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* List View for Day/Month */}
      {(viewMode === 'day' || viewMode === 'month') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {viewMode === 'day' 
                ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
              }
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'day' ? -1 : -30))}
              >
                ← {viewMode === 'day' ? 'Dia Anterior' : 'Mês Anterior'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, viewMode === 'day' ? 1 : 30))}
              >
                {viewMode === 'day' ? 'Próximo Dia' : 'Próximo Mês'} →
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {agendaEvents
              .filter(event => {
                if (viewMode === 'day') {
                  return isSameDay(parseISO(event.eventDate), selectedDate);
                }
                // Para mês, mostrar todos os eventos do mês
                const eventDate = parseISO(event.eventDate);
                return eventDate.getMonth() === selectedDate.getMonth() && 
                       eventDate.getFullYear() === selectedDate.getFullYear();
              })
              .map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                            
                            {event.description && (
                              <p className="text-gray-600 mb-3">{event.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(parseISO(event.eventDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </div>
                              
                              {event.eventLocation && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {event.eventLocation}
                                </div>
                              )}
                              
                              {(event.clientName || event.providerName) && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {event.clientName || event.providerName}
                                </div>
                              )}
                              
                              {event.value && (
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-medium">
                                    R$ {event.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(event.status)}
                            <Badge variant="outline">
                              {getEventTypeLabel(event.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {agendaEvents.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-700 mb-2">Nenhum evento na agenda</h3>
                  <p className="text-gray-500">
                    {getAgendaDescription()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}