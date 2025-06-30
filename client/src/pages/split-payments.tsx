import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Percent,
  Calculator,
  RefreshCw,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const splitCalculationSchema = z.object({
  eventId: z.number().positive(),
  totalAmount: z.number().positive(),
  platformFee: z.number().min(0).max(50).optional(),
  providerId: z.number().positive(),
  organizerId: z.number().positive(),
  venueId: z.number().positive().optional(),
  paymentMethod: z.enum(['stripe', 'pix']),
});

const processPaymentSchema = splitCalculationSchema;

const refundSchema = z.object({
  transactionId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().min(10).max(500)
});

type SplitCalculation = {
  totalAmount: number;
  platformFee: number;
  platformAmount: number;
  providerAmount: number;
  organizerAmount?: number;
  venueAmount?: number;
  taxAmount: number;
  netAmounts: {
    platform: number;
    provider: number;
    organizer?: number;
    venue?: number;
  };
};

type SplitTransaction = {
  id: string;
  eventId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  totalAmount: number;
  createdAt: string;
  completedAt?: string;
  paymentMethod: string;
  splitDetails: SplitCalculation;
  externalTransactionId?: string;
  failureReason?: string;
};

export default function SplitPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("calculator");
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculatorForm = useForm<z.infer<typeof splitCalculationSchema>>({
    resolver: zodResolver(splitCalculationSchema),
    defaultValues: {
      eventId: 1,
      totalAmount: 1000,
      platformFee: 8.5,
      providerId: 1,
      organizerId: 1,
      paymentMethod: 'pix'
    }
  });

  const processForm = useForm<z.infer<typeof processPaymentSchema>>({
    resolver: zodResolver(processPaymentSchema),
    defaultValues: {
      eventId: 1,
      totalAmount: 1000,
      platformFee: 8.5,
      providerId: 1,
      organizerId: 1,
      paymentMethod: 'pix'
    }
  });

  const refundForm = useForm<z.infer<typeof refundSchema>>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      reason: ''
    }
  });

  // Query para cálculo de split
  const [calculationResult, setCalculationResult] = useState<SplitCalculation | null>(null);

  // Query para histórico de transações
  const { data: transactionHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/split-payments/history'],
    queryFn: () => apiRequest('/api/split-payments/history')
  });

  // Query para estatísticas de receita
  const { data: revenueStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/split-payments/revenue-stats', selectedPeriod],
    queryFn: () => apiRequest(`/api/split-payments/revenue-stats?period=${selectedPeriod}`)
  });

  // Mutation para calcular split
  const calculateSplit = useMutation({
    mutationFn: async (data: z.infer<typeof splitCalculationSchema>) => {
      const queryParams = new URLSearchParams({
        eventId: data.eventId.toString(),
        totalAmount: data.totalAmount.toString(),
        platformFee: (data.platformFee || 8.5).toString(),
        providerId: data.providerId.toString(),
        organizerId: data.organizerId.toString(),
        paymentMethod: data.paymentMethod,
        ...(data.venueId && { venueId: data.venueId.toString() })
      });
      
      return apiRequest(`/api/split-payments/calculate?${queryParams}`);
    },
    onSuccess: (data) => {
      setCalculationResult(data.calculation);
      toast({
        title: "Cálculo realizado",
        description: "Split calculado com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cálculo",
        description: error.message || "Erro ao calcular split",
        variant: "destructive"
      });
    }
  });

  // Mutation para processar pagamento
  const processPayment = useMutation({
    mutationFn: (data: z.infer<typeof processPaymentSchema>) => 
      apiRequest('/api/split-payments/process', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({
        title: "Pagamento processado",
        description: "Split payment processado com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/split-payments/history'] });
      processForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro no processamento",
        description: error.message || "Erro ao processar pagamento",
        variant: "destructive"
      });
    }
  });

  // Mutation para reembolso
  const processRefund = useMutation({
    mutationFn: (data: z.infer<typeof refundSchema>) =>
      apiRequest('/api/split-payments/refund', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({
        title: "Reembolso processado",
        description: "Reembolso realizado com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/split-payments/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no reembolso",
        description: error.message || "Erro ao processar reembolso",
        variant: "destructive"
      });
    }
  });

  const onCalculate = (data: z.infer<typeof splitCalculationSchema>) => {
    calculateSplit.mutate(data);
  };

  const onProcessPayment = (data: z.infer<typeof processPaymentSchema>) => {
    processPayment.mutate(data);
  };

  const onRefund = (data: z.infer<typeof refundSchema>) => {
    processRefund.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Necessário</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar o sistema de split payments.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Split Payments</h1>
          <p className="text-gray-600">Sistema automático de divisão de pagamentos</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="process">Processar</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Calculadora de Split
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...calculatorForm}>
                  <form onSubmit={calculatorForm.handleSubmit(onCalculate)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={calculatorForm.control}
                        name="eventId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID do Evento</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={calculatorForm.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Total (R$)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={calculatorForm.control}
                        name="providerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID do Prestador</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={calculatorForm.control}
                        name="organizerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID do Organizador</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={calculatorForm.control}
                        name="venueId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID do Local (Opcional)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={calculatorForm.control}
                        name="platformFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Taxa da Plataforma (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="8.5" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={calculatorForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="stripe">Cartão (Stripe)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={calculateSplit.isPending}>
                      {calculateSplit.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        <>
                          <Calculator className="w-4 h-4 mr-2" />
                          Calcular Split
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {calculationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Resultado do Split
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Valor Total</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculationResult.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#3C5BFA] rounded-full"></div>
                        <span className="text-sm">Plataforma ({calculationResult.platformFee}%)</span>
                      </div>
                      <span className="font-bold">{formatCurrency(calculationResult.platformAmount)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                        <span className="text-sm">Prestador</span>
                      </div>
                      <span className="font-bold">{formatCurrency(calculationResult.providerAmount)}</span>
                    </div>

                    {calculationResult.organizerAmount && (
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#FFA94D] rounded-full"></div>
                          <span className="text-sm">Organizador</span>
                        </div>
                        <span className="font-bold">{formatCurrency(calculationResult.organizerAmount)}</span>
                      </div>
                    )}

                    {calculationResult.venueAmount && (
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#8B5CF6] rounded-full"></div>
                          <span className="text-sm">Local</span>
                        </div>
                        <span className="font-bold">{formatCurrency(calculationResult.venueAmount)}</span>
                      </div>
                    )}

                    {calculationResult.taxAmount > 0 && (
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-sm">Impostos</span>
                        </div>
                        <span className="font-bold">{formatCurrency(calculationResult.taxAmount)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Processar Split Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...processForm}>
                <form onSubmit={processForm.handleSubmit(onProcessPayment)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={processForm.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Evento</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={processForm.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Total (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={processForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="stripe">Cartão (Stripe)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={processPayment.isPending}>
                    {processPayment.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Processar Pagamento
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Carregando histórico...</p>
                </div>
              ) : transactionHistory?.transactions?.length > 0 ? (
                <div className="space-y-4">
                  {transactionHistory.transactions.map((transaction: SplitTransaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <h3 className="font-semibold">Transação {transaction.id}</h3>
                            <p className="text-sm text-gray-600">
                              Evento #{transaction.eventId} • {transaction.paymentMethod.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(transaction.totalAmount)}</div>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Plataforma:</span>
                          <div className="font-medium">{formatCurrency(transaction.splitDetails.platformAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Prestador:</span>
                          <div className="font-medium">{formatCurrency(transaction.splitDetails.providerAmount)}</div>
                        </div>
                        {transaction.splitDetails.organizerAmount && (
                          <div>
                            <span className="text-gray-600">Organizador:</span>
                            <div className="font-medium">{formatCurrency(transaction.splitDetails.organizerAmount)}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Data:</span>
                          <div className="font-medium">
                            {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </div>

                      {transaction.status === 'completed' && (
                        <div className="mt-4 flex justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reembolsar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Processar Reembolso</DialogTitle>
                              </DialogHeader>
                              <Form {...refundForm}>
                                <form onSubmit={refundForm.handleSubmit((data) => {
                                  onRefund({ ...data, transactionId: transaction.id });
                                })} className="space-y-4">
                                  <FormField
                                    control={refundForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Valor do Reembolso (R$)</FormLabel>
                                        <FormControl>
                                          <Input 
                                            type="number" 
                                            step="0.01" 
                                            placeholder={`Máximo: ${formatCurrency(transaction.totalAmount)}`}
                                            {...field} 
                                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={refundForm.control}
                                    name="reason"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Motivo do Reembolso</FormLabel>
                                        <FormControl>
                                          <Input {...field} placeholder="Descreva o motivo do reembolso..." />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <Button type="submit" disabled={processRefund.isPending}>
                                    {processRefund.isPending ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Processando...
                                      </>
                                    ) : (
                                      <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Confirmar Reembolso
                                      </>
                                    )}
                                  </Button>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
                  <p className="text-gray-600">As transações de split payment aparecerão aqui.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
              <div className="col-span-4 text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Carregando estatísticas...</p>
              </div>
            ) : revenueStats?.stats ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Receita Total</p>
                        <p className="text-2xl font-bold">{formatCurrency(revenueStats.stats.totalRevenue)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Receita Plataforma</p>
                        <p className="text-2xl font-bold">{formatCurrency(revenueStats.stats.platformRevenue)}</p>
                      </div>
                      <Percent className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Transações</p>
                        <p className="text-2xl font-bold">{revenueStats.stats.transactionCount}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                        <p className="text-2xl font-bold">{formatCurrency(revenueStats.stats.averageTransaction)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-4 text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sem dados disponíveis</h3>
                <p className="text-gray-600">As estatísticas aparecerão após as primeiras transações.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}