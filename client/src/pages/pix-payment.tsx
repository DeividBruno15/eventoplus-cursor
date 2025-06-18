import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QrCode, Copy, Clock, CheckCircle, XCircle } from "lucide-react";

const pixPaymentSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  payerCpf: z.string().optional(),
});

type PixPaymentForm = z.infer<typeof pixPaymentSchema>;

interface PixPaymentData {
  id: string;
  status: string;
  pixCode: string;
  pixKey: string;
  qrCodeBase64: string;
  expirationDate: string;
  amount: number;
  transactionId: string;
}

export default function PixPayment() {
  const [paymentData, setPaymentData] = useState<PixPaymentData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const { toast } = useToast();

  const form = useForm<PixPaymentForm>({
    resolver: zodResolver(pixPaymentSchema),
    defaultValues: {
      amount: "",
      description: "",
      payerCpf: "",
    },
  });

  // Create PIX payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: PixPaymentForm) => {
      const response = await apiRequest("POST", "/api/payments/pix/create", data);
      return response.json();
    },
    onSuccess: (data: PixPaymentData) => {
      setPaymentData(data);
      setIsPolling(true);
      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX para efetuar o pagamento.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar PIX",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check payment status
  const { data: paymentStatus } = useQuery({
    queryKey: ["/api/payments/pix", paymentData?.id, "status"],
    enabled: !!paymentData?.id && isPolling,
    refetchInterval: 3000, // Check every 3 seconds
    retry: false,
  });

  // Stop polling when payment is completed
  if (paymentStatus?.status === 'approved' && isPolling) {
    setIsPolling(false);
    toast({
      title: "Pagamento aprovado!",
      description: "Seu pagamento PIX foi processado com sucesso.",
    });
  }

  const onSubmit = (data: PixPaymentForm) => {
    createPaymentMutation.mutate(data);
  };

  const copyPixCode = () => {
    if (paymentData?.pixKey) {
      navigator.clipboard.writeText(paymentData.pixKey);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu app de banco para efetuar o pagamento.",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Aguardando Pagamento';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Processando';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento PIX</h1>
          <p className="text-gray-600">Gere um código PIX para receber pagamentos instantâneos</p>
        </div>

        {!paymentData ? (
          <Card>
            <CardHeader>
              <CardTitle>Criar Pagamento PIX</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para gerar um código PIX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="100.00" 
                            type="number" 
                            step="0.01"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Pagamento de serviço" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payerCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF do Pagador (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="000.000.000-00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-[#3C5BFA] hover:bg-blue-700" 
                    disabled={createPaymentMutation.isPending}
                  >
                    {createPaymentMutation.isPending ? "Gerando PIX..." : "Gerar PIX"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Payment Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Status do Pagamento</CardTitle>
                  <Badge className={`${getStatusColor(paymentStatus?.status || paymentData.status)} text-white`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(paymentStatus?.status || paymentData.status)}
                      {getStatusText(paymentStatus?.status || paymentData.status)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Valor</p>
                    <p className="text-lg font-bold">{formatCurrency(paymentData.amount)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">ID da Transação</p>
                    <p className="font-mono text-sm">{paymentData.transactionId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code and PIX Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code PIX
                </CardTitle>
                <CardDescription>
                  Escaneie o QR Code com seu app bancário ou copie o código PIX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                {paymentData.qrCodeBase64 && (
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 border border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                <Separator />

                {/* PIX Code */}
                <div>
                  <p className="font-medium text-gray-700 mb-2">Código PIX:</p>
                  <div className="flex gap-2">
                    <Input 
                      value={paymentData.pixKey} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyPixCode}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Abra o app do seu banco</li>
                    <li>2. Procure por "PIX" ou "Pagar com QR Code"</li>
                    <li>3. Escaneie o QR Code ou cole o código PIX</li>
                    <li>4. Confirme o pagamento</li>
                  </ol>
                </div>

                {/* Expiration */}
                <div className="text-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Expira em: {new Date(paymentData.expirationDate).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPaymentData(null);
                  setIsPolling(false);
                  form.reset();
                }}
                className="flex-1"
              >
                Novo Pagamento
              </Button>
              <Button 
                onClick={() => window.print()}
                variant="outline"
                className="flex-1"
              >
                Imprimir QR Code
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}