import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Download,
  Star,
  Zap
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  planName: string;
  planPrice: number;
  cancelAtPeriodEnd: boolean;
}

interface UsageStats {
  current: number;
  limit: number;
  percentage: number;
}

interface PlanLimits {
  events: UsageStats;
  services: UsageStats;
  venues: UsageStats;
  applications: UsageStats;
}

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Buscar dados da assinatura
  const { data: subscription } = useQuery({
    queryKey: ["/api/subscription"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Buscar estatísticas de uso
  const { data: usage } = useQuery({
    queryKey: ["/api/subscription/usage"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Buscar histórico de faturas
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/subscription/invoices"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Cancelar assinatura
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/subscription/cancel", {});
    },
    onSuccess: () => {
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada e será encerrada no final do período atual.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  // Reativar assinatura
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/subscription/reactivate", {});
    },
    onSuccess: () => {
      toast({
        title: "Assinatura reativada",
        description: "Sua assinatura foi reativada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reativar assinatura",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'past_due':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      canceled: 'destructive',
      past_due: 'secondary',
      trialing: 'secondary'
    };
    
    const labels = {
      active: 'Ativo',
      canceled: 'Cancelado',
      past_due: 'Em atraso',
      trialing: 'Período de teste'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const renderUsageCard = (title: string, stats: UsageStats, icon: React.ReactNode) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uso atual</span>
            <span className="font-medium">
              {stats.current} / {stats.limit === -1 ? '∞' : stats.limit}
            </span>
          </div>
          {stats.limit !== -1 && (
            <Progress 
              value={stats.percentage} 
              className={`h-2 ${stats.percentage > 80 ? 'bg-red-100' : ''}`}
            />
          )}
          <p className="text-xs text-gray-500">
            {stats.limit === -1 ? 'Ilimitado' : `${stats.percentage.toFixed(0)}% utilizado`}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Faça login para gerenciar sua assinatura.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Gerenciar Assinatura</h1>
          <p className="text-gray-600">
            Controle sua assinatura, monitore o uso e visualize seu histórico de pagamentos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações da Assinatura */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{subscription.planName}</h3>
                        <p className="text-gray-600">
                          {formatCurrency(subscription.planPrice)}/mês
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(subscription.status)}
                        {getStatusBadge(subscription.status)}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Início do período</span>
                        <p className="font-medium">
                          {formatDate(subscription.currentPeriodStart)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Final do período</span>
                        <p className="font-medium">
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Sua assinatura será cancelada em {formatDate(subscription.currentPeriodEnd)}.
                          Você pode reativá-la a qualquer momento antes dessa data.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                        <Button
                          variant="outline"
                          onClick={() => cancelSubscriptionMutation.mutate()}
                          disabled={cancelSubscriptionMutation.isPending}
                        >
                          Cancelar Assinatura
                        </Button>
                      )}
                      
                      {subscription.cancelAtPeriodEnd && (
                        <Button
                          onClick={() => reactivateSubscriptionMutation.mutate()}
                          disabled={reactivateSubscriptionMutation.isPending}
                          className="bg-primary hover:bg-blue-700"
                        >
                          Reativar Assinatura
                        </Button>
                      )}
                      
                      <Button variant="outline">
                        Alterar Plano
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhuma assinatura ativa
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Você está usando o plano gratuito
                    </p>
                    <Button className="bg-primary hover:bg-blue-700">
                      Escolher Plano
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uso do Plano */}
            {usage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Uso do Plano
                  </CardTitle>
                  <CardDescription>
                    Monitore seu uso em relação aos limites do seu plano
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.userType === 'contratante' && (
                      renderUsageCard("Eventos", usage.events, <Calendar className="h-4 w-4" />)
                    )}
                    {user.userType === 'prestador' && (
                      <>
                        {renderUsageCard("Serviços", usage.services, <Star className="h-4 w-4" />)}
                        {renderUsageCard("Candidaturas", usage.applications, <Zap className="h-4 w-4" />)}
                      </>
                    )}
                    {user.userType === 'anunciante' && (
                      renderUsageCard("Espaços", usage.venues, <CreditCard className="h-4 w-4" />)
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Faturas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Histórico de Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma fatura encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {formatCurrency(invoice.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(invoice.date)} • {invoice.status}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {invoices.length > 5 && (
                      <Button variant="outline" className="w-full">
                        Ver Todas as Faturas
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade para Premium
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Atualizar Forma de Pagamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Comprovantes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    Precisa de ajuda com sua assinatura?
                  </p>
                  <Button variant="outline" className="w-full">
                    Falar com Suporte
                  </Button>
                  <div className="text-xs text-gray-500">
                    <p>• Cancelamento até o último dia</p>
                    <p>• Reembolso em até 7 dias</p>
                    <p>• Suporte 24/7</p>
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