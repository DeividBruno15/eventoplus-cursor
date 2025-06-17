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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { insertServiceSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

const serviceSchema = z.object({
  title: z.string().min(1, "Nome do serviço é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  price: z.string().min(1, "Preço é obrigatório"),
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
  "DJ", "Banda", "Cantor/Cantora", "Mágico", "Palhaço", "Animador", "Dançarinos"
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
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      portfolio: "",
    },
  });

  const selectedCategory = form.watch("category");

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const priceValue = parseFloat(data.price.replace(/[^\d,]/g, '').replace(',', '.'));
      
      const serviceData = {
        ...data,
        price: priceValue,
        tags: tags.join(','),
      };

      const response = await apiRequest("POST", "/api/services", serviceData);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
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

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const price = (parseInt(numbers) || 0) / 100;
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="category"
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

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Base (por evento)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value ? formatPrice(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Tags */}
              <div className="space-y-3">
                <FormLabel>Tags/Palavras-chave</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

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