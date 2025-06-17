import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Check, X, Crown, Zap, Shield, ArrowRight } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  userType: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // Prestadores
  {
    id: "prestador_essencial",
    name: "Essencial",
    price: 0,
    interval: "month",
    userType: "prestador",
    features: [
      "Perfil público básico",
      "1 serviço ativo",
      "Suporte via FAQ",
      "Avaliações de clientes",
      "Acesso limitado às oportunidades"
    ]
  },
  {
    id: "prestador_profissional",
    name: "Profissional",
    price: 14.90,
    interval: "month",
    userType: "prestador",
    popular: true,
    features: [
      "Até 5 serviços ativos",
      "Prioridade no ranking de busca",
      "Métricas básicas (visitas, contatos)",
      "Suporte via chat comercial"
    ]
  },
  {
    id: "prestador_premium",
    name: "Premium",
    price: 29.90,
    interval: "month",
    userType: "prestador",
    features: [
      "Serviços ilimitados",
      "Destaque nas categorias",
      "Painel completo de performance",
      "Agendamento com cliente",
      "Suporte prioritário + grupo WhatsApp"
    ]
  },
  // Contratantes
  {
    id: "contratante_descubra",
    name: "Descubra",
    price: 0,
    interval: "month",
    userType: "contratante",
    features: [
      "Busca ilimitada",
      "Favoritar perfis",
      "Avaliar prestadores",
      "Histórico básico"
    ]
  },
  {
    id: "contratante_conecta",
    name: "Conecta",
    price: 14.90,
    interval: "month",
    userType: "contratante",
    popular: true,
    features: [
      "Contato direto sem limite",
      "Briefings personalizados",
      "Agendamento e lembretes",
      "Suporte via chat"
    ]
  },
  {
    id: "contratante_gestao",
    name: "Gestão",
    price: 29.90,
    interval: "month",
    userType: "contratante",
    features: [
      "Histórico completo com exportação",
      "Requisições múltiplas",
      "Dashboard de controle",
      "Suporte premium + atendimento exclusivo"
    ]
  },
  // Anunciantes
  {
    id: "anunciante_divulgue",
    name: "Divulgue",
    price: 0,
    interval: "month",
    userType: "anunciante",
    features: [
      "Cadastro de 1 local com fotos",
      "Aparecimento no diretório básico",
      "Até 3 leads por mês",
      "Estatísticas simples",
      "Visibilidade geográfica limitada"
    ]
  },
  {
    id: "anunciante_alcance",
    name: "Alcance",
    price: 14.90,
    interval: "month",
    userType: "anunciante",
    popular: true,
    features: [
      "Cadastro de até 5 locais",
      "Destaque intermediário nas buscas",
      "Leads ilimitados",
      "Visibilidade segmentada por categoria",
      "Estatísticas completas"
    ]
  },
  {
    id: "anunciante_vitrine",
    name: "Vitrine",
    price: 29.90,
    interval: "month",
    userType: "anunciante",
    features: [
      "Locais ilimitados",
      "Posição de destaque + selo",
      "Exibição em páginas de eventos",
      "Vídeos e tours virtuais",
      "Suporte prioritário + consultoria"
    ]
  }
];

const CheckoutForm = ({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/subscription/success",
      },
      redirect: "if_required"
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pagamento processado",
        description: "Sua assinatura foi ativada com sucesso!",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processando..." : "Confirmar assinatura"}
      </Button>
    </form>
  );
};

export default function ManageSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { data: currentSubscription } = useQuery({
    queryKey: ['/api/user/subscription'],
    queryFn: () => apiRequest("GET", '/api/user/subscription').then(res => res.json()),
    enabled: !!user
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/create-subscription", { planId });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowCheckout(true);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar assinatura",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cancel-subscription");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
    },
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
    if (plan?.price === 0) {
      // Free plan - no payment needed
      toast({
        title: "Plano ativado",
        description: `Você está agora no plano ${plan.name}`,
      });
      return;
    }

    createSubscriptionMutation.mutate(planId);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setClientSecret(null);
    setSelectedPlan(null);
    queryClient.invalidateQueries({ queryKey: ['/api/user/subscription'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  const getCurrentPlan = () => {
    if (!currentSubscription || !user) return null;
    return SUBSCRIPTION_PLANS.find(plan => 
      plan.userType === user.userType && 
      (currentSubscription.planId === plan.id || 
       (currentSubscription.status === 'free' && plan.price === 0))
    );
  };

  const getPlansForUserType = () => {
    if (!user) return [];
    return SUBSCRIPTION_PLANS.filter(plan => plan.userType === user.userType);
  };

  const currentPlan = getCurrentPlan();
  const availablePlans = getPlansForUserType();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso restrito</h2>
          <p className="text-gray-600 mb-4">Faça login para gerenciar sua assinatura.</p>
          <Button onClick={() => setLocation("/login")}>Fazer login</Button>
        </div>
      </div>
    );
  }

  if (showCheckout && clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Finalizar assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  clientSecret={clientSecret} 
                  onSuccess={handleCheckoutSuccess}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-4">Gerenciar Assinatura</h1>
        <p className="text-gray-600">
          Escolha o plano que melhor atende às suas necessidades
        </p>
      </div>

      {currentPlan && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-primary" />
                  Plano Atual: {currentPlan.name}
                </CardTitle>
                <p className="text-gray-600">
                  {currentPlan.price === 0 ? 'Gratuito' : `R$ ${currentPlan.price.toFixed(2)}/mês`}
                </p>
              </div>
              {currentPlan.price > 0 && currentSubscription?.status === 'active' && (
                <Button
                  variant="outline"
                  onClick={() => cancelSubscriptionMutation.mutate()}
                  disabled={cancelSubscriptionMutation.isPending}
                >
                  Cancelar assinatura
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const isPopular = plan.popular;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${isCurrentPlan ? 'border-primary bg-primary/5' : ''} ${isPopular ? 'border-orange-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white">
                    Recomendado
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-primary text-white">
                    Atual
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  {plan.price === 0 ? <Shield className="w-5 h-5 mr-2" /> : 
                   plan.price < 20 ? <Zap className="w-5 h-5 mr-2" /> : 
                   <Crown className="w-5 h-5 mr-2" />}
                  {plan.name}
                </CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? 'Gratuito' : `R$ ${plan.price.toFixed(2)}`}
                </div>
                {plan.price > 0 && (
                  <p className="text-gray-600">por mês</p>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan || createSubscriptionMutation.isPending}
                >
                  {isCurrentPlan ? (
                    "Plano atual"
                  ) : createSubscriptionMutation.isPending && selectedPlan === plan.id ? (
                    "Processando..."
                  ) : plan.price === 0 ? (
                    "Usar gratuito"
                  ) : (
                    <>
                      Assinar agora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Perguntas frequentes</h3>
            <div className="space-y-4 text-left">
              <div>
                <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
                <p className="text-gray-600 text-sm">
                  Sim, você pode cancelar sua assinatura a qualquer momento. 
                  O acesso aos recursos premium continua até o final do período pago.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Como funciona o período de teste?</h4>
                <p className="text-gray-600 text-sm">
                  Oferecemos 7 dias de teste gratuito para todos os planos pagos. 
                  Você só será cobrado após o período de teste.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Posso mudar de plano?</h4>
                <p className="text-gray-600 text-sm">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As alterações entram em vigor imediatamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}