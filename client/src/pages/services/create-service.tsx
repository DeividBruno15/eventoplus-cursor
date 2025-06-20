import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

const serviceSchema = z.object({
  title: z.string().min(1, "Nome do serviço é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  subcategory: z.string().optional(),
  price: z.string().min(1, "Preço é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  portfolio: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const serviceCategories = [
  "Entretenimento",
  "Alimentação", 
  "Organização",
  "Produção",
  "Limpeza"
];

const entertainmentServices = [
  "DJ", "Banda", "Cantor", "Mágico", "Palhaço", "Animador", "Dançarinos"
];

const singerGenres = [
  "Sertanejo", "Pop", "Rock", "MPB", "Samba", "Pagode", "Funk", "Gospel", "Jazz", "Blues", "Bossa Nova", "Forró", "Axé", "Reggae"
];

const foodServices = [
  "Buffet", "Bartender", "Garçons", "Confeitaria", "Food Truck", "Churrasqueiro", "Barista"
];

const organizationServices = [
  "Wedding Planner", "Cerimonialista", "Assessor de Eventos", "Coordenador", "Produtor"
];

const productionServices = [
  "Fotógrafo", "Videomaker", "Som e Iluminação", "Decoração", "Floricultura", "Cenografia"
];

const cleaningServices = [
  "Limpeza Pré-evento", "Limpeza Pós-evento", "Manutenção durante evento", "Jardinagem", "Higienização"
];

const servicesByCategory = {
  "Entretenimento": entertainmentServices,
  "Alimentação": foodServices,
  "Organização": organizationServices,
  "Produção": productionServices,
  "Limpeza": cleaningServices,
};

export default function CreateService() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      price: "",
      location: "",
      portfolio: "",
    },
  });

  const selectedCategory = form.watch("category");
  const selectedSubcategory = form.watch("subcategory");

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const priceValue = parseFloat(data.price.replace(/[^\d,]/g, '').replace(',', '.'));
      
      const serviceData = {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        basePrice: priceValue.toString(),
        location: data.location,
        portfolio: data.portfolio ? [data.portfolio] : []
      };

      console.log("Sending service data:", JSON.stringify(serviceData, null, 2));

      const response = await apiRequest("POST", "/api/services", serviceData);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error("Server error response:", errorData);
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Serviço criado com sucesso!",
        description: "Seu serviço foi cadastrado e já está disponível para contratação.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setLocation("/services");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar serviço",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return formattedValue;
  };

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsLoadingLocation(true);
    try {
      // Using OpenStreetMap Nominatim API for location search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=br&limit=5&q=${encodeURIComponent(query + ", Brasil")}`
      );
      const data = await response.json();
      
      const suggestions = data.map((item: any) => {
        const parts = item.display_name.split(', ');
        // Get city and state
        const city = parts[0];
        const state = parts.find((part: string) => part.length === 2 && part.toUpperCase() === part) || parts[parts.length - 3];
        return `${city}, ${state}`;
      }).filter((item: string, index: number, arr: string[]) => arr.indexOf(item) === index); // Remove duplicates
      
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching location:', error);
      setLocationSuggestions([]);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/services">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Serviços
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Cadastrar Novo Serviço</h1>
        <p className="text-muted-foreground">
          Crie um novo serviço para oferecer aos organizadores de eventos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Serviço</CardTitle>
          <CardDescription>
            Preencha as informações abaixo para cadastrar seu serviço
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Serviço</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: DJ Profissional" {...field} />
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
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("subcategory", "");
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedCategory && (
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo específico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {servicesByCategory[selectedCategory as keyof typeof servicesByCategory]?.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedSubcategory === "Cantor" && (
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero Musical</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero musical" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {singerGenres.map((genre) => (
                            <SelectItem key={genre} value={`Cantor - ${genre}`}>
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva seu serviço, experiência e diferenciais..."
                        className="min-h-24"
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Base (por evento)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="R$ 0,00"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPrice(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Localização
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Digite sua cidade/estado"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              searchLocation(e.target.value);
                            }}
                          />
                          {locationSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                              {locationSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                  onClick={() => {
                                    field.onChange(suggestion);
                                    setLocationSuggestions([]);
                                  }}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio/Links (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://meuportfolio.com ou link do Instagram"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createServiceMutation.isPending}
                >
                  {createServiceMutation.isPending ? "Criando..." : "Criar Serviço"}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link href="/services">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}