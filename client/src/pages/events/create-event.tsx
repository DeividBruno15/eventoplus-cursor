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
  number: z.string().min(1, "Número é obrigatório"),
  totalBudget: z.string().min(1, "Orçamento total é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  guestCount: z.string().min(1, "Número de convidados é obrigatório"),
  services: z.array(serviceSchema).min(1, "Selecione pelo menos um serviço"),
});

type CreateEventForm = z.infer<typeof createEventSchema>;

const serviceTypes = [
  "Fotógrafo",
  "Videomaker", 
  "DJ",
  "Banda",
  "Decoração",
  "Buffet",
  "Cerimonialista",
  "Segurança",
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
      number: "",
      totalBudget: "",
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
      const eventData = {
        ...data,
        totalBudget: parseFloat(data.totalBudget),
        guestCount: parseInt(data.guestCount),
        addressData: JSON.stringify(addressData),
        imageCount: eventImages.length,
        fullAddress: `${addressData.street}, ${data.number}, ${addressData.neighborhood}, ${data.city}/${data.state}`,
        // Only show city and state to prestadores, full address only after acceptance
        publicLocation: `${data.city}, ${data.state}`
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
                
                <CEPInput onAddressFound={handleCEPFound} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="00000-000" 
                            {...field} 
                            value={addressData.cep || field.value}
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
                            <FormLabel>Orçamento (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
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

              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orçamento Total do Evento (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="15000.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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