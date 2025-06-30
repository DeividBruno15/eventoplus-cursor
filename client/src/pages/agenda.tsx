import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlarmClock, Search, Filter, ChevronLeft, ChevronRight, Plus, Settings, Download, Mail, Printer, Share2, UserPlus, Eye, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaEvent {
  id: number;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventLocation?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'reserved';
  type: 'event' | 'meeting' | 'task' | 'reminder' | 'service' | 'reservation';
  description?: string;
  clientName?: string;
  providerName?: string;
  value?: number;
  color?: string;
  avatar?: string;
  originalData?: any;
}

export default function Agenda() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Calcular início e fim da semana
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Segunda-feira
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Buscar dados reais baseados no tipo de usuário
  const { data: userEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events', user?.id],
    enabled: !!user && user.userType === 'contratante'
  });

  const { data: userApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/event-applications/accepted', user?.id],
    enabled: !!user && user.userType === 'prestador'
  });

  const { data: venueReservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['/api/venues/reservations', user?.id],
    enabled: !!user && user.userType === 'anunciante'
  });

  // Processar dados para formato da agenda baseado no tipo de usuário
  const processAgendaEvents = (): AgendaEvent[] => {
    if (!user) return [];

    let events: AgendaEvent[] = [];

    // PRESTADOR: Aplicações aceitas viram eventos na agenda
    if (user.userType === 'prestador' && userApplications && Array.isArray(userApplications)) {
      events = userApplications
        .filter((app: any) => app.status === 'approved')
        .map((app: any) => ({
          id: app.id,
          title: app.event?.title || 'Serviço Contratado',
          eventDate: format(new Date(app.event?.date), 'yyyy-MM-dd'),
          startTime: app.availableDate ? format(new Date(app.availableDate), 'HH:mm') : "09:00",
          endTime: app.estimatedHours ? format(new Date(new Date(app.availableDate).getTime() + (app.estimatedHours * 60 * 60 * 1000)), 'HH:mm') : "18:00",
          status: "confirmed",
          type: "service",
          description: app.proposal || 'Serviço aprovado',
          clientName: app.event?.organizer?.username || 'Cliente',
          color: "bg-green-100 text-green-800",
          avatar: app.event?.organizer?.username?.slice(0, 2).toUpperCase() || 'CL',
          originalData: app
        }));
    }

    // CONTRATANTE: Eventos criados aparecem na agenda
    if (user.userType === 'contratante' && userEvents && Array.isArray(userEvents)) {
      events = userEvents.map((event: any) => ({
        id: event.id,
        title: event.title,
        eventDate: format(new Date(event.date), 'yyyy-MM-dd'),
        startTime: format(new Date(event.date), 'HH:mm'),
        endTime: format(new Date(new Date(event.date).getTime() + (4 * 60 * 60 * 1000)), 'HH:mm'), // +4 horas por padrão
        status: event.status || "scheduled",
        type: "event",
        description: event.description,
        clientName: event.location,
        color: "bg-blue-100 text-blue-800",
        avatar: event.title?.slice(0, 2).toUpperCase() || 'EV',
        originalData: event
      }));
    }

    // ANUNCIANTE: Reservas de locais aparecem na agenda
    if (user.userType === 'anunciante' && venueReservations && Array.isArray(venueReservations)) {
      events = venueReservations.map((reservation: any) => ({
        id: reservation.id,
        title: `Reserva - ${reservation.venue?.name}`,
        eventDate: format(new Date(reservation.eventDate), 'yyyy-MM-dd'),
        startTime: reservation.startTime || "09:00",
        endTime: reservation.endTime || "18:00",
        status: "reserved",
        type: "reservation",
        description: `Local reservado para ${reservation.eventTitle || 'evento'}`,
        clientName: reservation.clientName || 'Cliente',
        color: "bg-purple-100 text-purple-800",
        avatar: reservation.clientName?.slice(0, 2).toUpperCase() || 'RS',
        originalData: reservation
      }));
    }

    return events;
  };

  const agendaEvents = processAgendaEvents();
  const isLoading = eventsLoading || applicationsLoading || reservationsLoading;

  // Função para navegar semanas
  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
  };

  // Função para obter eventos de um dia específico
  const getEventsForDate = (date: Date) => {
    return agendaEvents.filter(event => 
      isSameDay(parseISO(event.eventDate), date)
    );
  };

  // Função para obter eventos de um horário específico
  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return agendaEvents.filter(event => {
      if (!isSameDay(parseISO(event.eventDate), date)) return false;
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return eventHour === hour;
    });
  };

  // Gerar slots de horário (7h às 19h)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 7);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando agenda...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            {/* Header da Sidebar */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Agenda</h1>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Evento
              </Button>
            </div>

            {/* Busca */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>

            {/* Filtros */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filtros</span>
              </div>
              <div className="space-y-2">
                {[
                  { key: "todos", label: "Todos" },
                  { key: "clientes", label: "Clientes" },
                  { key: "equipe", label: "Equipe" },
                  { key: "pessoal", label: "Pessoal" }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedFilter === filter.key
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de próximos eventos */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Próximos Eventos</h3>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {agendaEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {event.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(weekStart, 'MMMM yyyy', { locale: ptBR })}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ações
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => window.print()}>
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir Agenda
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.share?.({ title: 'Minha Agenda' })}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar por Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Convidar Participante
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Configurações da Agenda</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Modo Escuro</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDarkMode(!darkMode)}
                        >
                          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Visualização Compacta</label>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Notificações</label>
                        <Button variant="ghost" size="sm">
                          <AlarmClock className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Calendário Semanal */}
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50 border-r-2 border-gray-200">
                  Horário
                </div>
                {weekDays.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-4 text-center border-r-2 border-gray-200 ${
                        isToday ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={`text-lg font-semibold mt-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid de horários */}
              <div className="max-h-96 overflow-y-auto">
                {timeSlots.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-16">
                    {/* Coluna de horário */}
                    <div className="p-3 text-sm text-gray-500 bg-gray-50 border-r-2 border-gray-200 flex items-start">
                      {hour.toString().padStart(2, '0')}:00
                    </div>

                    {/* Colunas dos dias */}
                    {weekDays.map((day, index) => {
                      const events = getEventsForTimeSlot(day, hour);
                      return (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          className="p-2 relative min-h-16 border-r-2 border-gray-200"
                        >
                          {events.map((event) => (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`${event.color} rounded-md p-2 mb-1 text-xs font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-xs">
                                    {event.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{event.title}</span>
                              </div>
                              <div className="text-xs opacity-75 mt-1">
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Evento */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Data e Horário</p>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(selectedEvent.eventDate), 'dd/MM/yyyy', { locale: ptBR })} - {selectedEvent.startTime} às {selectedEvent.endTime}
                  </p>
                </div>
              </div>
              
              {selectedEvent.clientName && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Cliente</p>
                    <p className="text-sm text-gray-600">{selectedEvent.clientName}</p>
                  </div>
                </div>
              )}

              {selectedEvent.eventLocation && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium">Local</p>
                    <p className="text-sm text-gray-600">{selectedEvent.eventLocation}</p>
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="flex items-start gap-3">
                  <AlarmClock className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="font-medium">Descrição</p>
                    <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Status</p>
                  <Badge 
                    variant={selectedEvent.status === 'confirmed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {selectedEvent.status === 'confirmed' ? 'Confirmado' :
                     selectedEvent.status === 'scheduled' ? 'Agendado' :
                     selectedEvent.status === 'reserved' ? 'Reservado' :
                     selectedEvent.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                  </Badge>
                </div>
              </div>

              {selectedEvent.value && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Valor</p>
                    <p className="text-sm text-gray-600">R$ {selectedEvent.value.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedEvent(null)}
                >
                  Fechar
                </Button>
                {selectedEvent.type === 'event' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    Editar Evento
                  </Button>
                )}
                {selectedEvent.type === 'service' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    Ver Contrato
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}