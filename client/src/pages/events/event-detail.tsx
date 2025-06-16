import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { CalendarDays, MapPin, Users, DollarSign, Clock, User } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  budget: number;
  category: string;
  guestCount: number;
  status: string;
  organizerId: number;
  createdAt: string;
}

interface EventApplication {
  id: number;
  eventId: number;
  providerId: number;
  proposal: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function EventDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [proposal, setProposal] = useState("");
  const [price, setPrice] = useState("");

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<EventApplication[]>({
    queryKey: [`/api/events/${id}/applications`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/events/${id}/applications`, {
        proposal,
        price: parseFloat(price),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/applications`] });
      toast({
        title: "Candidatura enviada!",
        description: "Sua proposta foi enviada ao organizador do evento.",
      });
      setIsApplyDialogOpen(false);
      setProposal("");
      setPrice("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h1>
            <Button onClick={() => setLocation("/events")}>
              Voltar para eventos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString('pt-BR');
  const hasApplied = applications.some((app: EventApplication) => app.providerId === user?.id);
  const canApply = user?.userType === 'prestador' && !hasApplied && event.status === 'active';
  const isOrganizer = user?.id === event.organizerId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/events")}
            className="mb-4"
          >
            ← Voltar para eventos
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{event.title}</h1>
              <Badge variant="secondary" className="mb-4">
                {event.category}
              </Badge>
            </div>
            
            {canApply && (
              <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-blue-700">
                    Enviar Proposta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enviar Proposta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="proposal">Proposta detalhada</Label>
                      <Textarea
                        id="proposal"
                        placeholder="Descreva sua proposta, experiência e como pretende executar o serviço..."
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Valor da proposta (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="1500.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsApplyDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => applyMutation.mutate()}
                        disabled={!proposal || !price || applyMutation.isPending}
                        className="flex-1 bg-primary hover:bg-blue-700"
                      >
                        {applyMutation.isPending ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium">{eventDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Local</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Convidados</p>
                      <p className="font-medium">{event.guestCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Orçamento</p>
                      <p className="font-medium">R$ {event.budget.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidaturas (visível apenas para o organizador) */}
            {isOrganizer && (
              <Card>
                <CardHeader>
                  <CardTitle>Candidaturas Recebidas ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {applicationsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-24 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Ainda não há candidaturas para este evento.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application: EventApplication) => (
                        <div
                          key={application.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="" />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Prestador #{application.providerId}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(application.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-primary">
                                R$ {application.price.toLocaleString('pt-BR')}
                              </p>
                              <Badge variant={application.status === 'pending' ? 'default' : 'secondary'}>
                                {application.status === 'pending' ? 'Pendente' : application.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{application.proposal}</p>
                          
                          {application.status === 'pending' && (
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" className="bg-primary hover:bg-blue-700">
                                Aceitar
                              </Button>
                              <Button size="sm" variant="outline">
                                Recusar
                              </Button>
                              <Button size="sm" variant="ghost">
                                Conversar
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Badge
                      variant={event.status === 'active' ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {event.status === 'active' ? 'Ativo' : event.status}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      {event.status === 'active' 
                        ? 'Recebendo candidaturas' 
                        : 'Não está mais recebendo candidaturas'
                      }
                    </p>
                  </div>

                  {hasApplied && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium">
                        Você já se candidatou a este evento
                      </p>
                    </div>
                  )}

                  {user?.userType !== 'prestador' && user?.id !== event.organizerId && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Apenas prestadores de serviços podem se candidatar a eventos
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Publicado em</p>
                    <p className="font-medium">
                      {new Date(event.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Categoria</p>
                    <p className="font-medium">{event.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ID do Evento</p>
                    <p className="font-medium">#{event.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}