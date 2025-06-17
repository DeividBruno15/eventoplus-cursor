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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { insertServiceSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, X, Upload, Image, Video } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";

const serviceSchema = z.object({
  title: z.string().min(1, "Nome do serviço é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  price: z.string().min(1, "Preço é obrigatório"),
  portfolio: z.string().optional(),
  mediaFiles: z.array(z.string()).max(5, "Máximo 5 arquivos de mídia").optional(),
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

// Helper function to format Brazilian currency
const formatCurrency = (value: string) => {
  const numericValue = value.replace(/\D/g, '');
  const number = parseFloat(numericValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(number);
};

export default function CreateService() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);

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

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (mediaFiles.length + files.length > 5) {
      toast({
        title: "Limite de arquivos",
        description: "Máximo 5 arquivos de mídia permitidos",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name} não é um arquivo de imagem ou vídeo`,
          variant: "destructive",
        });
      }
      return isValid;
    });

    setMediaFiles([...mediaFiles, ...validFiles]);
    
    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setMediaPreview([...mediaPreview, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviews = mediaPreview.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(mediaPreview[index]);
    
    setMediaFiles(newFiles);
    setMediaPreview(newPreviews);
  };

  const handlePriceChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatCurrency(value);
    onChange(formatted);
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
                        value={field.value}
                        onChange={(e) => handlePriceChange(e.target.value, field.onChange)}
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

              {/* Media Upload Section */}
              <div className="space-y-4">
                <div>
                  <Label>Mídia (Fotos e Vídeos) - Máximo 5 arquivos</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Clique para adicionar fotos e vídeos
                        </p>
                        <p className="text-xs text-gray-400">
                          {mediaFiles.length}/5 arquivos
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaPreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        {mediaFiles[index].type.startsWith('image/') ? (
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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