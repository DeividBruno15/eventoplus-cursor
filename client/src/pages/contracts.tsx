import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Edit, Calendar, DollarSign, User, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Contract {
  id: number;
  title: string;
  serviceType: string;
  providerName: string;
  clientName: string;
  eventDate: string;
  eventLocation: string;
  value: number;
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'cancelled';
  terms: string;
  paymentTerms: string;
  cancellationPolicy: string;
  createdAt: string;
  signedAt?: string;
  providerId: number;
  clientId: number;
}

interface ContractForm {
  title: string;
  serviceType: string;
  eventDate: string;
  eventLocation: string;
  value: string;
  terms: string;
  paymentTerms: string;
  cancellationPolicy: string;
  clientId: string;
}

export default function Contracts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [contractForm, setContractForm] = useState<ContractForm>({
    title: "",
    serviceType: "",
    eventDate: "",
    eventLocation: "",
    value: "",
    terms: "",
    paymentTerms: "",
    cancellationPolicy: "",
    clientId: ""
  });

  // Buscar contratos
  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
    enabled: !!user,
  });

  // Mutation para criar contrato
  const createContractMutation = useMutation({
    mutationFn: async (data: ContractForm) => {
      return apiRequest("POST", "/api/contracts", {
        ...data,
        value: parseFloat(data.value),
        clientId: parseInt(data.clientId)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setIsCreateOpen(false);
      setContractForm({
        title: "",
        serviceType: "",
        eventDate: "",
        eventLocation: "",
        value: "",
        terms: "",
        paymentTerms: "",
        cancellationPolicy: "",
        clientId: ""
      });
      toast({
        title: "Contrato criado",
        description: "Contrato criado com sucesso e enviado para assinatura",
      });
    },
  });

  // Mutation para assinar contrato
  const signContractMutation = useMutation({
    mutationFn: async (contractId: number) => {
      return apiRequest("POST", `/api/contracts/${contractId}/sign`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Contrato assinado",
        description: "Contrato assinado digitalmente com sucesso",
      });
    },
  });

  const handleCreateContract = () => {
    if (!contractForm.title || !contractForm.eventDate || !contractForm.value) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createContractMutation.mutate(contractForm);
  };

  const handleSignContract = (contractId: number) => {
    signContractMutation.mutate(contractId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Rascunho" },
      pending: { variant: "destructive" as const, label: "Pendente" },
      signed: { variant: "default" as const, label: "Assinado" },
      completed: { variant: "default" as const, label: "Concluído" },
      cancelled: { variant: "secondary" as const, label: "Cancelado" }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredContracts = {
    all: contracts,
    pending: contracts.filter(c => c.status === 'pending'),
    signed: contracts.filter(c => c.status === 'signed'),
    completed: contracts.filter(c => c.status === 'completed')
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-[#3C5BFA]" />
          <h1 className="text-3xl font-bold text-black">Contratos Digitais</h1>
        </div>
        
        {user?.userType === 'prestador' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3C5BFA] hover:bg-[#3C5BFA]/90">
                <FileText className="h-4 w-4 mr-2" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Contrato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Título do Contrato *</label>
                    <Input
                      placeholder="Ex: Serviço de DJ para Casamento"
                      value={contractForm.title}
                      onChange={(e) => setContractForm(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo de Serviço *</label>
                    <Input
                      placeholder="Ex: DJ, Fotografia, Decoração"
                      value={contractForm.serviceType}
                      onChange={(e) => setContractForm(prev => ({ ...prev, serviceType: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data do Evento *</label>
                    <Input
                      type="date"
                      value={contractForm.eventDate}
                      onChange={(e) => setContractForm(prev => ({ ...prev, eventDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valor do Serviço *</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={contractForm.value}
                      onChange={(e) => setContractForm(prev => ({ ...prev, value: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Local do Evento</label>
                  <Input
                    placeholder="Endereço completo do evento"
                    value={contractForm.eventLocation}
                    onChange={(e) => setContractForm(prev => ({ ...prev, eventLocation: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">ID do Cliente</label>
                  <Input
                    type="number"
                    placeholder="ID do usuário cliente"
                    value={contractForm.clientId}
                    onChange={(e) => setContractForm(prev => ({ ...prev, clientId: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Termos e Condições</label>
                  <Textarea
                    placeholder="Descreva os termos gerais do serviço..."
                    value={contractForm.terms}
                    onChange={(e) => setContractForm(prev => ({ ...prev, terms: e.target.value }))}
                    className="mt-1 h-20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Condições de Pagamento</label>
                  <Textarea
                    placeholder="Ex: 50% antecipado, 50% no dia do evento..."
                    value={contractForm.paymentTerms}
                    onChange={(e) => setContractForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="mt-1 h-20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Política de Cancelamento</label>
                  <Textarea
                    placeholder="Condições para cancelamento do serviço..."
                    value={contractForm.cancellationPolicy}
                    onChange={(e) => setContractForm(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                    className="mt-1 h-20"
                  />
                </div>

                <Button
                  onClick={handleCreateContract}
                  disabled={createContractMutation.isPending}
                  className="w-full bg-[#3C5BFA] hover:bg-[#3C5BFA]/90"
                >
                  {createContractMutation.isPending ? "Criando..." : "Criar Contrato"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({contracts.length})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({filteredContracts.pending.length})</TabsTrigger>
          <TabsTrigger value="signed">Assinados ({filteredContracts.signed.length})</TabsTrigger>
          <TabsTrigger value="completed">Concluídos ({filteredContracts.completed.length})</TabsTrigger>
        </TabsList>

        {Object.entries(filteredContracts).map(([key, contractList]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {contractList.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Nenhum contrato {key === 'all' ? 'encontrado' : key === 'pending' ? 'pendente' : key === 'signed' ? 'assinado' : 'concluído'}
                  </h3>
                  <p className="text-gray-500">
                    {key === 'all' && "Comece criando seu primeiro contrato digital"}
                    {key === 'pending' && "Todos os contratos foram assinados"}
                    {key === 'signed' && "Nenhum contrato foi assinado ainda"}
                    {key === 'completed' && "Nenhum contrato foi concluído ainda"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contractList.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{contract.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{contract.serviceType}</p>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{user?.userType === 'prestador' ? contract.clientName : contract.providerName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(contract.eventDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>R$ {contract.value.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Criado em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsViewOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        
                        {contract.status === 'pending' && (
                          user?.userType === 'contratante' ? (
                            <Button
                              size="sm"
                              onClick={() => handleSignContract(contract.id)}
                              disabled={signContractMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Assinar
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="flex-1" disabled>
                              Aguardando
                            </Button>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal de Visualização do Contrato */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedContract?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedContract && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {getStatusBadge(selectedContract.status)}
                </div>
                <div>
                  <strong>Tipo de Serviço:</strong> {selectedContract.serviceType}
                </div>
                <div>
                  <strong>Data do Evento:</strong> {new Date(selectedContract.eventDate).toLocaleDateString('pt-BR')}
                </div>
                <div>
                  <strong>Valor:</strong> R$ {selectedContract.value.toLocaleString()}
                </div>
                <div>
                  <strong>Prestador:</strong> {selectedContract.providerName}
                </div>
                <div>
                  <strong>Cliente:</strong> {selectedContract.clientName}
                </div>
              </div>

              {selectedContract.eventLocation && (
                <div>
                  <strong>Local do Evento:</strong>
                  <p className="mt-1 text-sm text-gray-600">{selectedContract.eventLocation}</p>
                </div>
              )}

              <div>
                <strong>Termos e Condições:</strong>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedContract.terms || "Não especificado"}
                </p>
              </div>

              <div>
                <strong>Condições de Pagamento:</strong>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedContract.paymentTerms || "Não especificado"}
                </p>
              </div>

              <div>
                <strong>Política de Cancelamento:</strong>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedContract.cancellationPolicy || "Não especificado"}
                </p>
              </div>

              {selectedContract.signedAt && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <strong>Contrato Assinado Digitalmente</strong>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Assinado em {new Date(selectedContract.signedAt).toLocaleDateString('pt-BR')} às {new Date(selectedContract.signedAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                
                {selectedContract.status === 'pending' && user?.userType === 'contratante' && (
                  <Button
                    onClick={() => {
                      handleSignContract(selectedContract.id);
                      setIsViewOpen(false);
                    }}
                    disabled={signContractMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Assinar Contrato
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