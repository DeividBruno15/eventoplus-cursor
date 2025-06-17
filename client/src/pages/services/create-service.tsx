import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Plus, X } from "lucide-react";

const serviceSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  subcategory: z.string().optional(),
  basePrice: z.string().min(1, "Preço base é obrigatório"),
  priceType: z.enum(["fixed", "hourly", "daily", "negotiable"]),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  duration: z.string().optional(),
  location: z.string().min(1, "Localização é obrigatória"),
  portfolio: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const serviceCategories = [
  { value: "Entretenimento", label: "Entretenimento", subcategories: ["DJ", "Banda", "Cantor", "Mágico", "Palhaço", "Animação"] },
  { value: "Alimentação", label: "Alimentação", subcategories: ["Buffet", "Catering", "Bartender", "Confeitaria", "Food Truck", "Churrasqueiro"] },
  { value: "Organização", label: "Organização", subcategories: ["Wedding Planner", "Cerimonial", "Coordenação", "Assessoria", "Consultoria"] },
  { value: "Produção", label: "Produção", subcategories: ["Fotógrafo", "Videomaker", "Som e Luz", "Decoração", "Floricultura", "Cenografia"] },
  { value: "Limpeza", label: "Limpeza", subcategories: ["Limpeza Pós-evento", "Limpeza Prévia", "Manutenção", "Zeladoria"] }
];

export default function CreateService() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [portfolioItems, setPortfolioItems] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      priceType: "fixed",
      portfolio: [],
      tags: [],
    },
  });

  const selectedCategory = form.watch("category");
  const selectedCategoryData = serviceCategories.find(cat => cat.value === selectedCategory);

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return apiRequest("POST", "/api/services", {
        ...data,
        basePrice: parseFloat(data.basePrice),
        minPrice: data.minPrice ? parseFloat(data.minPrice) : null,
        maxPrice: data.maxPrice ? parseFloat(data.maxPrice) : null,
        portfolio: portfolioItems,
        tags: tags,
      });
    },
    onSuccess: () => {
      toast({
        title: "Serviço criado!",
        description: "Seu serviço foi adicionado ao catálogo com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      navigate("/services");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar serviço",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  const addPortfolioItem = () => {
    const input = document.getElementById("portfolio-input") as HTMLInputElement;
    if (input.value.trim()) {
      setPortfolioItems([...portfolioItems, input.value.trim()]);
      input.value = "";
    }
  };

  const removePortfolioItem = (index: number) => {
    setPortfolioItems(portfolioItems.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (user?.userType !== 'prestador') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Apenas prestadores de serviços podem criar serviços.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/services")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Serviços
          </Button>
          <h1 className="text-3xl font-bold text-black">Criar Novo Serviço</h1>
          <p className="text-gray-600 mt-2">Adicione um novo serviço ao seu catálogo</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Serviço</CardTitle>
            <CardDescription>
              Preencha os detalhes do seu serviço para atrair mais clientes
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
                        <FormLabel>Título do Serviço</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: DJ para Casamentos" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedCategoryData && (
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a subcategoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedCategoryData.subcategories.map((sub) => (
                              <SelectItem key={sub} value={sub}>
                                {sub}
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
                          placeholder="Descreva seu serviço em detalhes..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Inclua informações sobre experiência, equipamentos, estilo, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Base (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0,00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Preço</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixo</SelectItem>
                            <SelectItem value="hourly">Por Hora</SelectItem>
                            <SelectItem value="daily">Por Dia</SelectItem>
                            <SelectItem value="negotiable">Negociável</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração Típica</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 4 horas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Mínimo (R$) - Opcional</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0,00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Máximo (R$) - Opcional</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0,00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Atendimento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São Paulo, SP e região metropolitana" {...field} />
                      </FormControl>
                      <FormDescription>
                        Onde você oferece seus serviços
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Portfolio */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Portfolio (URLs de imagens/vídeos)</label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        id="portfolio-input"
                        placeholder="https://exemplo.com/imagem.jpg"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioItem())}
                      />
                      <Button type="button" onClick={addPortfolioItem}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {portfolioItems.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Itens do Portfolio:</p>
                      {portfolioItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="flex-1 text-sm truncate">{item}</span>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => removePortfolioItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tags/Palavras-chave</label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Ex: casamento, festa, música"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          <span>{tag}</span>
                          <button 
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-primary/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createServiceMutation.isPending}
                    className="bg-primary hover:bg-blue-700"
                  >
                    {createServiceMutation.isPending ? 'Criando...' : 'Criar Serviço'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/services")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}