import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlarmClock, Search, Filter, ChevronLeft, ChevronRight, Plus, Settings } from "lucide-react";
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
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: 'event' | 'meeting' | 'task' | 'reminder';
  description?: string;
  clientName?: string;
  providerName?: string;
  value?: number;
  color?: string;
  avatar?: string;
}

export default function Agenda() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Calcular início e fim da semana
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Segunda-feira
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock data baseado no design fornecido
  const mockEvents: AgendaEvent[] = [
    {
      id: 1,
      title: "John West",
      eventDate: format(addDays(weekStart, 0), 'yyyy-MM-dd'),
      startTime: "09:00",
      endTime: "10:00",
      status: "confirmed",
      type: "meeting",
      description: "Meeting with client",
      clientName: "John West",
      color: "bg-blue-100 text-blue-800",
      avatar: "JW"
    },
    {
      id: 2,
      title: "Design Review",
      eventDate: format(addDays(weekStart, 1), 'yyyy-MM-dd'),
      startTime: "14:00",
      endTime: "15:30",
      status: "scheduled",
      type: "meeting",
      description: "Review design proposals",
      color: "bg-purple-100 text-purple-800",
      avatar: "DR"
    },
    {
      id: 3,
      title: "Summer Hall",
      eventDate: format(addDays(weekStart, 2), 'yyyy-MM-dd'),
      startTime: "10:00",
      endTime: "11:00",
      status: "confirmed",
      type: "event",
      description: "Event planning session",
      clientName: "Summer Hall",
      color: "bg-green-100 text-green-800",
      avatar: "SH"
    },
    {
      id: 4,
      title: "Marketing Team",
      eventDate: format(addDays(weekStart, 3), 'yyyy-MM-dd'),
      startTime: "16:00",
      endTime: "17:00",
      status: "scheduled",
      type: "meeting",
      description: "Weekly marketing sync",
      color: "bg-orange-100 text-orange-800",
      avatar: "MT"
    }
  ];

  // Buscar eventos da agenda baseado no tipo de usuário
  const { data: agendaEvents = mockEvents, isLoading } = useQuery<AgendaEvent[]>({
    queryKey: ["/api/agenda"],
    enabled: !!user,
  });

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
              <h1 className="text-xl font-semibold text-gray-900">Schedule</h1>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Week
              </Button>
            </div>

            {/* Busca */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>

            {/* Filtros */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </div>
              <div className="space-y-2">
                {["All", "Client", "Team", "Personal"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter.toLowerCase())}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedFilter === filter.toLowerCase()
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de próximos eventos */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upcoming Events</h3>
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
                <Button variant="outline" size="sm">
                  Actions
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendário Semanal */}
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">
                  Time
                </div>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-4 text-center border-l border-gray-200 ${
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
                    <div className="p-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 flex items-start">
                      {hour.toString().padStart(2, '0')}:00
                    </div>

                    {/* Colunas dos dias */}
                    {weekDays.map((day) => {
                      const events = getEventsForTimeSlot(day, hour);
                      return (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          className="p-2 border-l border-gray-100 relative min-h-16"
                        >
                          {events.map((event) => (
                            <div
                              key={event.id}
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
    </div>
  );
}