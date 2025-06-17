import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, MapPin, DollarSign, Users, Clock, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventApplication {
  id: number;
  providerId: number;
  proposal: string;
  price: number;
  estimatedHours?: number;
  availableDate: string;
  status: string;
  createdAt: string;
  provider: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  budget: number;
  category: string;
  requirements?: string;
  status: string;
  organizerId: number;
  organizer: {
    username: string;
    firstName?: string;
    lastName?: string;
  };
  applications: EventApplication[];
}

export default function EventDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [proposal, setProposal] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [availableDate, setAvailableDate] = useState("");

  const { data: event, isLoading } = useQuery({
    queryKey: ['/api/events', id],
    queryFn: () => apiRequest(`/api/events/${id}`).then(res => res.json()),
  });

  const applyMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const response = await apiRequest("POST", "/api/event-applications", applicationData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Aplicação enviada",
        description: "Sua proposta foi enviada para o organizador do evento.",
      });
      setIsApplyDialogOpen(false);
      setProposal("");
      setPrice("");
      setEstimatedHours("");
      setAvailableDate("");
      queryClient.invalidateQueries({ queryKey: ['/api/events', id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar aplicação",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status, rejectionReason }: { applicationId: number; status: string; rejectionReason?: string }) => {
      const response = await apiRequest("PUT", `/api/event-applications/${applicationId}`, { 
        status, 
        rejectionReason 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Aplicação atualizada",
        description: "Status da aplicação foi atualizado.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h2>
          <Button onClick={() => setLocation("/events")}>
            Voltar para eventos
          </Button>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (!proposal || !price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a proposta e o preço",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate({
      eventId: parseInt(id!),
      proposal,
      price: parseFloat(price),
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
      availableDate: availableDate || null,
    });
  };

  const isOrganizer = user?.id === event.organizerId;
  const isPrestador = user?.userType === "prestador";
  const hasApplied = event.applications?.some(app => app.providerId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setLocation("/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para eventos
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                    <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                      {event.status === 'active' ? 'Ativo' : 'Fechado'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Organizador</div>
                    <div className="font-medium">
                      {event.organizer.firstName || event.organizer.username}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">{event.description}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{format(new Date(event.eventDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span>Orçamento: R$ {event.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>Categoria: {event.category}</span>
                  </div>
                </div>

                {event.requirements && (
                  <div>
                    <h4 className="font-semibold mb-2">Requisitos</h4>
                    <p className="text-gray-700">{event.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applications Section */}
            {isOrganizer && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Aplicações Recebidas ({event.applications?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {!event.applications || event.applications.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma aplicação recebida ainda
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {event.applications.map((application) => (
                        <Card key={application.id} className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">
                                {application.provider.firstName || application.provider.username}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Aplicou em {format(new Date(application.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                              </p>
                            </div>
                            <Badge variant={
                              application.status === 'approved' ? 'default' : 
                              application.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {application.status === 'pending' ? 'Pendente' :
                               application.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{application.proposal}</p>
                          
                          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                            <span>💰 R$ {application.price.toLocaleString()}</span>
                            {application.estimatedHours && (
                              <span>⏱️ {application.estimatedHours}h estimadas</span>
                            )}
                            {application.availableDate && (
                              <span>📅 Disponível em {format(new Date(application.availableDate), "dd/MM/yyyy")}</span>
                            )}
                          </div>

                          {application.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => updateApplicationMutation.mutate({ 
                                  applicationId: application.id, 
                                  status: 'approved' 
                                })}
                                disabled={updateApplicationMutation.isPending}
                              >
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateApplicationMutation.mutate({ 
                                  applicationId: application.id, 
                                  status: 'rejected',
                                  rejectionReason: 'Proposta não atende aos requisitos'
                                })}
                                disabled={updateApplicationMutation.isPending}
                              >
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {isPrestador && !hasApplied && event.status === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle>Aplicar para este evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Envie sua proposta para participar deste evento.
                  </p>
                  
                  <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Proposta
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Enviar Proposta</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="proposal">Proposta *</Label>
                          <Textarea
                            id="proposal"
                            placeholder="Descreva seus serviços e como você pode contribuir para este evento..."
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value)}
                            rows={4}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="price">Preço (R$) *</Label>
                          <Input
                            id="price"
                            type="number"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="estimatedHours">Horas estimadas</Label>
                          <Input
                            id="estimatedHours"
                            type="number"
                            placeholder="8"
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="availableDate">Data disponível</Label>
                          <Input
                            id="availableDate"
                            type="date"
                            value={availableDate}
                            onChange={(e) => setAvailableDate(e.target.value)}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleApply}
                          disabled={applyMutation.isPending}
                          className="w-full"
                        >
                          {applyMutation.isPending ? "Enviando..." : "Enviar Proposta"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {hasApplied && (
              <Card>
                <CardHeader>
                  <CardTitle>Sua Aplicação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-600 mb-2">✓ Proposta enviada</p>
                  <p className="text-sm text-gray-600">
                    Aguarde o organizador revisar sua proposta.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isPrestador && !isOrganizer && (
              <Card>
                <CardHeader>
                  <CardTitle>Interessado?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Apenas prestadores de serviços podem aplicar para eventos.
                  </p>
                  <Button variant="outline" onClick={() => setLocation("/register?userType=prestador")}>
                    Cadastrar como Prestador
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}