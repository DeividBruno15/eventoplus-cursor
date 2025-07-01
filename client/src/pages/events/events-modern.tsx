import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Plus,
  Search,
  Filter,
  Clock,
  Eye,
  Star,
  ChevronRight,
  SortAsc
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  guestCount: number;
  budget: number;
  status: "active" | "closed" | "cancelled";
  organizerName: string;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
}

export default function EventsModern() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const mockEvents: Event[] = [
    {
      id: 1,
      title: "Casamento em Jardim Botânico",
      description: "Cerimônia e recepção em ambiente natural com 150 convidados",
      category: "Casamento",
      location: "Rio de Janeiro, RJ",
      date: "2024-03-15",
      guestCount: 150,
      budget: 50000,
      status: "active",
      organizerName: "Maria Silva",
      applicationsCount: 8,
      viewsCount: 45,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Aniversário Corporativo",
      description: "Celebração dos 10 anos da empresa com jantar executivo",
      category: "Corporativo",
      location: "São Paulo, SP",
      date: "2024-02-28",
      guestCount: 80,
      budget: 25000,
      status: "active",
      organizerName: "João Santos",
      applicationsCount: 12,
      viewsCount: 62,
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      title: "Formatura Medicina",
      description: "Festa de formatura com cerimônia de colação de grau",
      category: "Formatura",
      location: "Belo Horizonte, MG",
      date: "2024-04-20",
      guestCount: 200,
      budget: 35000,
      status: "closed",
      organizerName: "Ana Costa",
      applicationsCount: 15,
      viewsCount: 89,
      createdAt: "2023-12-20"
    }
  ];

  const displayEvents = events.length > 0 ? events : mockEvents;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="saas-badge-success">Ativo</Badge>;
      case "closed":
        return <Badge className="saas-badge-neutral">Fechado</Badge>;
      case "cancelled":
        return <Badge className="saas-badge-error">Cancelado</Badge>;
      default:
        return <Badge className="saas-badge-neutral">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Casamento": "bg-pink-50 text-pink-700 border-pink-200",
      "Corporativo": "bg-blue-50 text-blue-700 border-blue-200",
      "Formatura": "bg-purple-50 text-purple-700 border-purple-200",
      "Aniversário": "bg-green-50 text-green-700 border-green-200",
    };
    return colors[category as keyof typeof colors] || "saas-badge-neutral";
  };

  if (!user) {
    return (
      <div className="saas-page flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="saas-body-secondary">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-page">
      {/* Modern Header */}
      <div className="saas-header">
        <div className="saas-header-content">
          <div>
            <h1 className="saas-title-xl">
              {user.userType === "contratante" ? "Meus Eventos" : "Eventos Disponíveis"}
            </h1>
            <p className="saas-body-secondary">
              {user.userType === "contratante" 
                ? "Gerencie seus eventos e acompanhe as candidaturas"
                : "Descubra oportunidades e candidate-se aos eventos"
              }
            </p>
          </div>
          
          {user.userType === "contratante" && (
            <Link href="/events/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Evento
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="saas-content">
        {/* Filters */}
        <Card className="saas-card">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="casamento">Casamento</SelectItem>
                    <SelectItem value="corporativo">Corporativo</SelectItem>
                    <SelectItem value="formatura">Formatura</SelectItem>
                    <SelectItem value="aniversario">Aniversário</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais Recentes</SelectItem>
                    <SelectItem value="oldest">Mais Antigos</SelectItem>
                    <SelectItem value="budget-high">Maior Orçamento</SelectItem>
                    <SelectItem value="budget-low">Menor Orçamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="saas-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {displayEvents.map((event: Event) => (
              <Card key={event.id} className="saas-card saas-interactive group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="saas-title-sm line-clamp-1">{event.title}</h3>
                        <p className="saas-body-secondary line-clamp-2">{event.description}</p>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        {getStatusBadge(event.status)}
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="saas-body-secondary">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="saas-body-secondary">{event.guestCount} convidados</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="saas-body-secondary truncate">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="saas-body-secondary">
                          R$ {event.budget.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="saas-caption">{event.viewsCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="saas-caption">{event.applicationsCount} candidaturas</span>
                        </div>
                      </div>
                      
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="ghost" className="gap-1 h-7">
                          Ver detalhes
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-muted text-xs">
                          {event.organizerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="saas-caption">Organizado por {event.organizerName}</span>
                      <span className="saas-caption">• {new Date(event.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayEvents.length === 0 && (
          <div className="saas-empty-state">
            <Calendar className="saas-empty-state-icon" />
            <h3 className="saas-empty-state-title">Nenhum evento encontrado</h3>
            <p className="saas-empty-state-description">
              {user.userType === "contratante" 
                ? "Crie seu primeiro evento para começar a receber candidaturas"
                : "Não há eventos disponíveis no momento. Tente ajustar os filtros."
              }
            </p>
            {user.userType === "contratante" && (
              <Link href="/events/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Evento
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}