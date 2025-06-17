import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SupportTicket {
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: "",
    category: "general",
    priority: "medium",
    description: ""
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: SupportTicket) => {
      const response = await apiRequest("POST", "/api/support/tickets", ticketData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket criado com sucesso!",
        description: "Nossa equipe entrará em contato em breve."
      });
      setTicket({
        subject: "",
        category: "general", 
        priority: "medium",
        description: ""
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar ticket",
        description: "Tente novamente ou entre em contato por email.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticket.subject || !ticket.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o assunto e a descrição do problema.",
        variant: "destructive"
      });
      return;
    }

    createTicketMutation.mutate(ticket);
  };

  const categories = [
    { value: "general", label: "Dúvida Geral" },
    { value: "technical", label: "Problema Técnico" },
    { value: "billing", label: "Cobrança e Pagamentos" },
    { value: "account", label: "Conta e Login" },
    { value: "features", label: "Funcionalidades" },
    { value: "bug", label: "Reportar Bug" }
  ];

  const priorities = [
    { value: "low", label: "Baixa", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Média", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "Alta", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-800" }
  ];

  const supportStats = [
    { label: "Tempo médio de resposta", value: "2 horas", icon: Clock },
    { label: "Taxa de resolução", value: "98%", icon: CheckCircle },
    { label: "Disponibilidade", value: "24/7", icon: AlertCircle }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Central de Suporte</h1>
        <p className="text-xl text-gray-600">
          Nossa equipe está aqui para ajudar você
        </p>
      </div>

      {/* Support Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supportStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <Icon className="h-12 w-12 text-[#3C5BFA] mx-auto mb-4" />
                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Support Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Criar Ticket de Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Info Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Informações da Conta</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Nome:</strong> {user?.username}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Tipo:</strong> {user?.userType}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  value={ticket.subject}
                  onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Resuma seu problema em poucas palavras"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={ticket.category}
                  onChange={(e) => setTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <Label>Prioridade</Label>
                <div className="flex gap-2 mt-2">
                  {priorities.map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => setTicket(prev => ({ ...prev, priority: priority.value as any }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        ticket.priority === priority.value 
                          ? priority.color 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Descrição do Problema *</Label>
                <Textarea
                  id="description"
                  value={ticket.description}
                  onChange={(e) => setTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva detalhadamente seu problema, incluindo os passos que levaram ao erro..."
                  rows={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quanto mais detalhes você fornecer, mais rápido poderemos ajudar.
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Ticket
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="space-y-6">
          {/* Other Contact Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Outras Formas de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                  <p className="text-sm text-gray-600">suporte@evento.com</p>
                  <p className="text-xs text-gray-500">Resposta em até 4 horas</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <Phone className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Telefone</h4>
                  <p className="text-sm text-gray-600">(11) 99999-9999</p>
                  <p className="text-xs text-gray-500">Seg-Sex: 8h às 18h</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Chat ao Vivo</h4>
                  <p className="text-sm text-gray-600">Disponível 24/7</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Iniciar Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Link */}
          <Card>
            <CardContent className="p-6 text-center">
              <h4 className="font-medium text-gray-900 mb-2">Não encontrou sua resposta?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Consulte nossa Central de Ajuda com mais de 100 artigos
              </p>
              <Button variant="outline" asChild>
                <a href="/help-center">
                  Visitar Central de Ajuda
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Status Page */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-medium text-gray-900">Status dos Serviços</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Todos os sistemas operando normalmente
              </p>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3 h-3 mr-1" />
                Ver Status Detalhado
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}