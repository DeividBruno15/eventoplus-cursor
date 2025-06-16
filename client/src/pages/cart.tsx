import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Calendar, MapPin, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CartItem {
  id: number;
  serviceId: number;
  serviceName: string;
  providerName: string;
  basePrice: number;
  quantity: number;
  customizations?: string;
  eventDate?: string;
  eventLocation?: string;
}

interface CheckoutData {
  eventDate: string;
  eventLocation: string;
  specialRequests: string;
  contactPhone: string;
}

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    eventDate: "",
    eventLocation: "",
    specialRequests: "",
    contactPhone: ""
  });

  // Buscar itens do carrinho
  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  // Mutation para atualizar quantidade
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  // Mutation para remover item
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removido",
        description: "Serviço removido do carrinho com sucesso",
      });
    },
  });

  // Mutation para finalizar compra
  const checkoutMutation = useMutation({
    mutationFn: async (data: CheckoutData) => {
      return apiRequest("POST", "/api/cart/checkout", {
        ...data,
        items: cartItems.map(item => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          customizations: item.customizations
        }))
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setIsCheckoutOpen(false);
      toast({
        title: "Pedido realizado!",
        description: "Seus serviços foram solicitados. Os prestadores entrarão em contato.",
      });
    },
  });

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const removeItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    if (!checkoutData.eventDate || !checkoutData.eventLocation || !checkoutData.contactPhone) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    checkoutMutation.mutate(checkoutData);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-[#3C5BFA]" />
        <h1 className="text-3xl font-bold text-black">Carrinho de Serviços</h1>
        {totalItems > 0 && (
          <Badge variant="default" className="bg-[#3C5BFA]">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        )}
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Carrinho vazio</h2>
            <p className="text-gray-500 mb-4">
              Adicione serviços ao seu carrinho para começar a planejar seu evento
            </p>
            <Button asChild>
              <a href="/services">Explorar Serviços</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-black">{item.serviceName}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <User className="h-4 w-4" />
                        <span>{item.providerName}</span>
                      </div>
                      
                      {item.eventDate && (
                        <div className="flex items-center gap-2 text-gray-600 mt-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.eventDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                      
                      {item.eventLocation && (
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{item.eventLocation}</span>
                        </div>
                      )}

                      {item.customizations && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Customizações:</strong> {item.customizations}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">R$ {item.basePrice.toLocaleString()} cada</p>
                        <p className="font-semibold text-lg">
                          R$ {(item.basePrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
                  <span>R$ {totalPrice.toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>R$ {totalPrice.toLocaleString()}</span>
                </div>

                <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[#3C5BFA] hover:bg-[#3C5BFA]/90">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Finalizar Pedido
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Finalizar Pedido</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Data do Evento *</label>
                        <Input
                          type="date"
                          value={checkoutData.eventDate}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, eventDate: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Local do Evento *</label>
                        <Input
                          placeholder="Endereço completo do evento"
                          value={checkoutData.eventLocation}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, eventLocation: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Telefone para Contato *</label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={checkoutData.contactPhone}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Solicitações Especiais</label>
                        <Input
                          placeholder="Detalhes adicionais sobre o evento"
                          value={checkoutData.specialRequests}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Como funciona:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Os prestadores entrarão em contato com você</li>
                          <li>• Negociem detalhes e valores finais</li>
                          <li>• Fechem o contrato diretamente</li>
                        </ul>
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={checkoutMutation.isPending}
                        className="w-full bg-[#3C5BFA] hover:bg-[#3C5BFA]/90"
                      >
                        {checkoutMutation.isPending ? "Processando..." : "Confirmar Pedido"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">✓</span>
                  <span>Sem taxas de intermediação</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span className="text-green-600">✓</span>
                  <span>Negociação direta com prestadores</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span className="text-green-600">✓</span>
                  <span>Suporte especializado</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}