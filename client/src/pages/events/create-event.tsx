import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { CEPInput } from "@/components/ui/cep-input";
import { MediaUpload } from "@/components/ui/media-upload";
import { Plus, Trash2 } from "lucide-react";

const serviceSchema = z.object({
  type: z.string().min(1, "Tipo de serviço é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  budget: z.number().min(0, "Orçamento deve ser maior ou igual a 0")
});

const createEventSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
  date: z.string().min(1, "Data é obrigatória"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  cep: z.string().min(8, "CEP é obrigatório"),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().min(1, "Número é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  guestCount: z.string().min(1, "Número de convidados é obrigatório"),
  services: z.array(serviceSchema).min(1, "Selecione pelo menos um serviço"),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

const serviceTypes = [
  // Entretenimento
  "DJ/Som",
  "Banda/Música ao vivo",
  "Cantor - Sertanejo",
  "Cantor - MPB",
  "Cantor - Rock",
  "Cantor - Pop",
  "Cantor - Forró",
  "Cantor - Samba/Pagode",
  "Cantor - Jazz",
  "Cantor - Clássico",
  "Cantor - Gospel",
  "Cantor - Rap/Hip-Hop",
  "Cantor - Funk",
  "Cantor - Eletrônica",
  "Animadores",
  "Fotógrafo",
  "Videomaker",
  "Mágico",
  "Palhaço",
  // Alimentação
  "Buffet completo",
  "Serviço de garçons",
  "Bartender",
  "Coffee break",
  "Doces e sobremesas",
  "Churrasco",
  "Food truck",
  // Organização
  "Cerimonialista",
  "Wedding planner",
  "Coordenação geral",
  "Recepcionistas",
  "Segurança",
  "Manobrista",
  "Tradução simultânea",
  // Produção
  "Decoração",
  "Floricultura",
  "Cenografia",
  "Iluminação",
  "Estruturas (tendas/palcos)",
  "Mobiliário",
  "Equipamentos audiovisuais",
  // Limpeza
  "Limpeza pré-evento",
  "Limpeza pós-evento",
  "Manutenção durante evento",
  "Limpeza",
  "Transporte",
  "Floricultura",
  "Maquiagem"
];

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [eventImages, setEventImages] = useState<any[]>([]);
  const [addressData, setAddressData] = useState({
    cep: "",
    street: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  const form = useForm<CreateEventForm>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      city: "",
      state: "",
      cep: "",
      street: "",
      neighborhood: "",
      number: "",
      category: "",
      guestCount: "",
      services: [{ type: "", quantity: 1, budget: 0 }],
    },
  });

  const services = form.watch("services");

  const handleCEPFound = (address: any) => {
    setAddressData({
      cep: address.cep,
      street: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state
    });
    
    form.setValue('city', address.city);
    form.setValue('state', address.state);
    form.setValue('cep', address.cep);
  };

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventForm) => {
      const totalBudget = services.reduce((total, service) => total + (service.budget || 0), 0) / 100;
      const eventData = {
        ...data,
        totalBudget: totalBudget,
        guestCount: parseInt(data.guestCount),
        addressData: JSON.stringify(addressData),
        imageCount: eventImages.length,
        fullAddress: `${addressData.street}, ${data.number}, ${addressData.neighborhood}, ${data.city}/${data.state}`,
        publicLocation: `${data.city}, ${data.state}`,
        services: services.map(service => ({
          ...service,
          budget: service.budget / 100
        }))
      };
      return apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Evento criado com sucesso!",
        description: "Seu evento foi publicado e está disponível para candidaturas.",
      });
      setLocation("/events");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar evento",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateEventForm) => {
    createEventMutation.mutate(data);
  };

  const addService = () => {
    const currentServices = form.getValues("services");
    form.setValue("services", [...currentServices, { type: "", quantity: 1, budget: 0 }]);
  };

  const removeService = (index: number) => {
    const currentServices = form.getValues("services");
    if (currentServices.length > 1) {
      const newServices = currentServices.filter((_, i) => i !== index);
      form.setValue("services", newServices);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Criar Novo Evento
        </h1>
        <p className="text-gray-600">
          Preencha os detalhes do seu evento para começar a receber propostas de prestadores qualificados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
          <CardDescription>
            Forneça detalhes completos para atrair os melhores prestadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Casamento dos Sonhos - Marina & João" {...field} />
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
                      <Textarea
                        placeholder="Descreva detalhadamente seu evento, estilo, preferências e expectativas..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Evento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Convidados</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormLabel>Localização do Evento</FormLabel>
                <p className="text-sm text-gray-600">
                  O endereço completo será mostrado apenas para prestadores aceitos. 
                  Prestadores candidatos verão apenas a cidade e estado.
                </p>
                
                <CEPInput onAddressFound={handleCEPFound} placeholder="CEP" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nome da rua" 
                            {...field} 
                            value={addressData.street || field.value}
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nome do bairro" 
                            {...field} 
                            value={addressData.neighborhood || field.value}
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria do Evento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="casamento">Casamento</SelectItem>
                            <SelectItem value="festa-infantil">Festa Infantil</SelectItem>
                            <SelectItem value="evento-corporativo">Evento Corporativo</SelectItem>
                            <SelectItem value="formatura">Formatura</SelectItem>
                            <SelectItem value="aniversario">Aniversário</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={addressData.city || field.value}
                            readOnly
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={addressData.state || field.value}
                            readOnly
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Services Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Serviços Necessários</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addService}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
                
                {services.map((service, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <FormField
                        control={form.control}
                        name={`services.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Serviço</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`services.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`services.${index}.budget`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Orçamento</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                                <Input
                                  type="text"
                                  placeholder="0,00"
                                  className="pl-10"
                                  value={field.value ? (field.value / 100).toFixed(2).replace('.', ',') : ''}
                                  onChange={(e) => {
                                    let value = e.target.value.replace(/[^\d]/g, '');
                                    if (value === '') {
                                      field.onChange(0);
                                      return;
                                    }
                                    const numValue = parseFloat(value);
                                    field.onChange(numValue);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        {services.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeService(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <FormLabel className="text-lg font-semibold">Orçamento Total do Evento</FormLabel>
                <p className="text-sm text-gray-600 mb-2">Calculado automaticamente baseado nos serviços</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    type="text"
                    readOnly
                    className="pl-10 bg-white font-semibold text-lg"
                    value={services.reduce((total, service) => total + (service.budget || 0), 0) ? 
                      (services.reduce((total, service) => total + (service.budget || 0), 0) / 100).toFixed(2).replace('.', ',') : '0,00'
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este valor é privado e usado apenas para análises internas
                </p>
              </div>

              <div className="space-y-4">
                <FormLabel>Imagens do Evento</FormLabel>
                <p className="text-sm text-gray-600">
                  Adicione até 5 imagens para ilustrar seu evento e atrair mais prestadores.
                </p>
                <MediaUpload
                  onMediaChange={setEventImages}
                  maxFiles={5}
                  initialMedia={eventImages}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/events")}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-blue-700"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Criando..." : "Publicar Evento"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}