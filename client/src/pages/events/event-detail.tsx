import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, MapPin, DollarSign, Users, Clock, Star, Send, CheckCircle, XCircle, User, Edit, Trash2, Image } from "lucide-react";

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [proposal, setProposal] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const eventId = params?.id ? parseInt(params.id) : null;

  // Buscar dados do evento
  const { data: event, isLoading } = useQuery<any>({
    queryKey: ["/api/events", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const response = await apiRequest("GET", `/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Evento não encontrado');
      }
      return await response.json();
    },
    enabled: !!eventId,
  });

  // Buscar candidaturas do evento
  const { data: applications = [] } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "applications"],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await apiRequest("GET", `/api/events/${eventId}/applications`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    },
    enabled: !!eventId,
  });

  // Mutation para candidatar-se ao evento
  const applyToEventMutation = useMutation({
    mutationFn: async ({ proposal, proposedPrice }: { proposal: string; proposedPrice: number }) => {
      return apiRequest("POST", `/api/events/${eventId}/apply`, {
        proposal,
        price: proposedPrice // Fix field name mismatch
      });
    },
    onSuccess: () => {
      toast({
        title: "Candidatura enviada!",
        description: "Sua proposta foi enviada ao organizador do evento.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "applications"] });
      setShowApplicationForm(false);
      setProposal("");
      setProposedPrice("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  // Mutation para aprovar/rejeitar candidatura
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      return apiRequest("PUT", `/api/event-applications/${applicationId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Candidatura atualizada",
        description: "Status da candidatura foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "applications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar candidatura",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir evento
  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
      });
      setLocation("/events");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir evento",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const handleSubmitApplication = () => {
    if (!proposal.trim() || !proposedPrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    applyToEventMutation.mutate({
      proposal: proposal.trim(),
      proposedPrice: parseFloat(proposedPrice)
    });
  };

  const handleUpdateApplication = (applicationId: number, status: string) => {
    updateApplicationMutation.mutate({ applicationId, status });
  };

  const handleEditEvent = () => {
    // Por enquanto, redirecionar para a página de criação com dados preenchidos
    // Em uma implementação futura, pode ser criada uma página específica de edição
    setLocation(`/events/create?edit=${eventId}`);
  };

  const handleDeleteEvent = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteEvent = () => {
    deleteEventMutation.mutate();
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h1>
            <p className="text-gray-600">O evento que você procura não existe ou foi removido.</p>
          </div>
        </div>
      </div>
    );
  }

  const isOrganizer = user?.id === event.organizerId;
  const isPrestador = user?.userType === 'prestador';
  const hasApplied = applications.some((app: any) => app.providerId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header do Evento */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{event.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{event.guestCount} pessoas</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                {event.status === 'active' ? 'Ativo' : event.status}
              </Badge>
              
              {/* Opções de gerenciamento para o organizador */}
              {isOrganizer && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditEvent}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteEvent}
                    disabled={deleteEventMutation.isPending}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteEventMutation.isPending ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Descrição do Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>

            {/* Imagens do Evento */}
            {event.images && event.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Imagens do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {event.images.map((imageUrl: string, index: number) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer">
                        <img
                          src={imageUrl}
                          alt={`Imagem ${index + 1} do evento`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {/* Overlay para indicar que pode expandir */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Image className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {event.images.length === 0 && (
                    <div className="text-center py-8">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma imagem adicionada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Categoria</Label>
                    <p className="text-gray-900">{event.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Orçamento</Label>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">
                        R$ {event.budget?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data e Hora</Label>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Participantes</Label>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{event.guestCount} pessoas esperadas</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidaturas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Candidaturas ({applications.length})
                  {isPrestador && !isOrganizer && !hasApplied && event.status === 'active' && (
                    <Button
                      onClick={() => setShowApplicationForm(!showApplicationForm)}
                      className="bg-primary hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Candidatar-se
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showApplicationForm && (
                  <Card className="mb-6 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Enviar Proposta</CardTitle>
                      <CardDescription>
                        Descreva sua proposta e defina seu preço para este evento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="proposal">Sua Proposta</Label>
                          <Textarea
                            id="proposal"
                            placeholder="Descreva como você pode contribuir para este evento..."
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Preço Proposto (R$)</Label>
                          <Input
                            id="price"
                            type="number"
                            placeholder="0,00"
                            value={proposedPrice}
                            onChange={(e) => setProposedPrice(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitApplication}
                            disabled={applyToEventMutation.isPending}
                            className="bg-primary hover:bg-blue-700"
                          >
                            {applyToEventMutation.isPending ? 'Enviando...' : 'Enviar Proposta'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowApplicationForm(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma candidatura ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <Card key={application.id} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Avatar>
                                <AvatarImage src="" />
                                <AvatarFallback>
                                  {application.providerName?.charAt(0)?.toUpperCase() || 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{application.providerName || 'Prestador'}</h4>
                                  <Badge variant={
                                    application.status === 'approved' ? 'default' :
                                    application.status === 'rejected' ? 'destructive' : 'secondary'
                                  }>
                                    {application.status === 'pending' ? 'Pendente' :
                                     application.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{application.proposal}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span className="font-medium">R$ {parseFloat(application.price)?.toLocaleString('pt-BR')}</span>
                                  </div>
                                  <span className="text-gray-500">
                                    {new Date(application.createdAt).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {isOrganizer && application.status === 'pending' && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateApplication(application.id, 'approved')}
                                  disabled={updateApplicationMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateApplication(application.id, 'rejected')}
                                  disabled={updateApplicationMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                      {event.status === 'active' ? 'Ativo' : event.status}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Orçamento</span>
                    <span className="font-semibold text-green-600">
                      R$ {event.budget?.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Candidaturas</span>
                    <span className="font-semibold">{applications.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data</span>
                    <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isPrestador && hasApplied && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Você já se candidatou a este evento</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isPrestador && !isOrganizer && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="text-blue-700">
                    <p className="font-medium mb-2">Interessado em se candidatar?</p>
                    <p className="text-sm">
                      Você precisa ser um prestador de serviços para se candidatar a eventos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Evento
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o evento <strong>"{event?.title}"</strong>?
              <br /><br />
              Esta ação não pode ser desfeita e todas as candidaturas associadas também serão removidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteEventMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteEvent}
              disabled={deleteEventMutation.isPending}
              className="flex items-center gap-2"
            >
              {deleteEventMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}