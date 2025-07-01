import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  CreditCard,
  Smartphone,
  Shield,
  CheckCircle,
  AlertCircle,
  Calculator,
  Clock,
  Lock,
  Info
} from "lucide-react";

interface CheckoutItem {
  id: string;
  type: 'subscription' | 'service' | 'booking';
  title: string;
  description: string;
  price: number;
  quantity: number;
  metadata?: any;
}

interface CheckoutSummary {
  subtotal: number;
  taxes: number;
  platformFee: number;
  discount: number;
  total: number;
}

interface OnePageCheckoutProps {
  items: CheckoutItem[];
  onSuccess: (paymentData: any) => void;
  onCancel?: () => void;
  className?: string;
}

export default function OnePageCheckout({
  items,
  onSuccess,
  onCancel,
  className = ""
}: OnePageCheckoutProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pixExpiry, setPixExpiry] = useState<Date | null>(null);
  
  // Dados do cartão de crédito
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  // Calcular resumo do checkout
  const calculateSummary = (): CheckoutSummary => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const platformFee = subtotal * 0.05; // 5% taxa da plataforma
    const taxes = subtotal * 0.1; // 10% impostos
    const discount = 0; // Desconto aplicado
    const total = subtotal + platformFee + taxes - discount;

    return { subtotal, taxes, platformFee, discount, total };
  };

  const summary = calculateSummary();

  // Timer para expiração do PIX
  useEffect(() => {
    if (paymentMethod === 'pix' && !pixExpiry) {
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15); // PIX expira em 15 minutos
      setPixExpiry(expiry);
    }
  }, [paymentMethod]);

  // Mutation para processar pagamento
  const paymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payments/process", paymentData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao processar pagamento');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pagamento Processado",
        description: "Seu pagamento foi processado com sucesso!",
      });
      onSuccess(data);
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Termos de Uso",
        description: "Você deve aceitar os termos para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    const paymentData = {
      items,
      paymentMethod,
      summary,
      ...(paymentMethod === 'credit_card' && { cardData }),
      userId: user?.id,
    };

    await paymentMutation.mutateAsync(paymentData);
    setIsProcessing(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  return (
    <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      {/* Coluna Esquerda - Formulário de Pagamento */}
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Checkout Seguro
            </CardTitle>
            <p className="text-sm text-gray-600">
              Suas informações estão protegidas com criptografia SSL
            </p>
          </CardHeader>
        </Card>

        {/* Método de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: 'credit_card' | 'pix') => setPaymentMethod(value)}
              className="space-y-4"
            >
              {/* PIX */}
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="pix" id="pix" />
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-green-600" />
                    <div>
                      <Label htmlFor="pix" className="font-medium">PIX</Label>
                      <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Recomendado
                  </Badge>
                </div>
              </div>

              {/* Cartão de Crédito */}
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                  <div>
                    <Label htmlFor="credit_card" className="font-medium">Cartão de Crédito</Label>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {/* Formulário do Cartão */}
            {paymentMethod === 'credit_card' && (
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="card-number">Número do Cartão</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      number: formatCardNumber(e.target.value)
                    }))}
                    maxLength={19}
                  />
                </div>

                <div>
                  <Label htmlFor="card-name">Nome no Cartão</Label>
                  <Input
                    id="card-name"
                    placeholder="Nome como está no cartão"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card-expiry">Validade</Label>
                    <Input
                      id="card-expiry"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => setCardData(prev => ({
                        ...prev,
                        expiry: formatExpiry(e.target.value)
                      }))}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({
                        ...prev,
                        cvv: e.target.value.replace(/\D/g, '')
                      }))}
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Info PIX */}
            {paymentMethod === 'pix' && (
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Após confirmar, você receberá um QR Code para pagamento via PIX.
                  {pixExpiry && (
                    <span className="block mt-1 text-orange-600 font-medium">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Expira em 15 minutos
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Termos e Condições */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              />
              <div className="text-sm">
                <Label htmlFor="terms" className="font-medium">
                  Aceito os termos de uso e política de privacidade
                </Label>
                <p className="text-gray-600 mt-1">
                  Li e concordo com os{" "}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    termos de uso
                  </a>{" "}
                  e{" "}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    política de privacidade
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coluna Direita - Resumo do Pedido */}
      <div className="space-y-6">
        {/* Resumo dos Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} cada
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cálculo de Preços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cálculo de Preços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxa da plataforma (5%)</span>
                <span>{formatCurrency(summary.platformFee)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Impostos (10%)</span>
                <span>{formatCurrency(summary.taxes)}</span>
              </div>
              
              {summary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>-{formatCurrency(summary.discount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(summary.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Pagamento Seguro</h4>
                <p className="text-sm text-green-700 mt-1">
                  Seus dados são protegidos com criptografia SSL de 256 bits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !acceptedTerms}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Finalizar Pagamento • {formatCurrency(summary.total)}
              </div>
            )}
          </Button>

          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full"
            >
              Cancelar
            </Button>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Ao finalizar, você receberá um email de confirmação.
          </p>
          <p className="mt-1">
            Suporte disponível 24/7 via chat ou email.
          </p>
        </div>
      </div>
    </div>
  );
}