import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, DollarSign, Clock, MapPin, Eye, Star, Check, ChevronsUpDown, X, Upload } from "lucide-react";

interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  musicalGenre?: string;
  hasEquipment?: string;
  equipment?: string[];
  mediaFiles?: string[];
  basePrice: string | number; // Pode vir como string do banco
  priceType: string;
  duration?: number;
  location?: string;
  portfolio: string[];
  rating: string | number; // Pode vir como string do banco
  reviewCount: number;
  bookingCount: number;
  active: boolean;
  featured: boolean;
  createdAt: string;
}

const SERVICE_CATEGORIES = {
  "entretenimento": [
    "DJ", "Banda", "Cantor", "Animação", "Karaokê", "Show", "Dança"
  ],
  "alimentacao": [
    "Buffet", "Chef", "Bartender", "Confeitaria", "Catering", "Food Truck"
  ],
  "organizacao": [
    "Cerimonial", "Wedding Planner", "Decoração", "Floricultura", "Coordenação"
  ],
  "producao": [
    "Foto/Vídeo", "Som/Luz", "Cerimônia", "Cenografia", "Iluminação"
  ],
  "limpeza": [
    "Limpeza pré-evento", "Limpeza pós-evento", "Organização", "Manutenção"
  ]
};

const MUSICAL_GENRES = [
  "Sertanejo", "Funk", "Rock", "Pop", "MPB", "Forró", "Pagode", "Samba", 
  "Axé", "Reggae", "Eletrônica", "Hip Hop", "Jazz", "Blues", "Gospel", 
  "Clássica", "Bossa Nova", "Indie", "Country", "Reggaeton"
];

const EQUIPMENT_OPTIONS = [
  "Microfone", "Instrumentos musicais", "Caixa de som", "Mesa de som", 
  "Amplificador", "Pedestal para microfone", "Cabo de áudio", "Monitor de retorno",
  "Mixer", "Equalizador", "Processador de efeitos", "Iluminação básica"
];

const BRAZILIAN_CITIES = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Brasília, DF", "Salvador, BA", "Fortaleza, CE",
  "Belo Horizonte, MG", "Manaus, AM", "Curitiba, PR", "Recife, PE", "Goiânia, GO",
  "Belém, PA", "Porto Alegre, RS", "Guarulhos, SP", "Campinas, SP", "São Luís, MA",
  "São Gonçalo, RJ", "Maceió, AL", "Duque de Caxias, RJ", "Campo Grande, MS", "Natal, RN",
  "Teresina, PI", "São Bernardo do Campo, SP", "Nova Iguaçu, RJ", "João Pessoa, PB", "Santo André, SP",
  "Osasco, SP", "São José dos Campos, SP", "Jaboatão dos Guararapes, PE", "Ribeirão Preto, SP",
  "Uberlândia, MG", "Contagem, MG", "Sorocaba, SP", "Aracaju, SE", "Feira de Santana, BA",
  "Cuiabá, MT", "Joinville, SC", "Aparecida de Goiânia, GO", "Londrina, PR", "Juiz de Fora, MG",
  "Ananindeua, PA", "Porto Velho, RO", "Serra, ES", "Niterói, RJ", "Caxias do Sul, RS",
  "Campos dos Goytacazes, RJ", "Vila Velha, ES", "Florianópolis, SC", "Macapá, AP", "Diadema, SP"
];

const PRICE_TYPES = [
  { value: "fixed", label: "Preço fixo" },
  { value: "hourly", label: "Por hora" },
  { value: "daily", label: "Por dia" },
  { value: "negotiable", label: "Negociável" }
];

export default function ManageServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [openLocationCombobox, setOpenLocationCombobox] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    musicalGenre: "",
    hasEquipment: "",
    equipment: [] as string[],
    mediaFiles: [] as string[],
    basePrice: "",
    priceType: "fixed",
    duration: "",
    location: "",
    active: true
  });

  // Função para formatar preço em moeda brasileira
  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue || numericValue === '0') {
      return '';
    }
    
    // Converte para número dividindo por 100 (centavos)
    const numberValue = parseInt(numericValue) / 100;
    
    // Formata como moeda brasileira
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para lidar com mudança de preço
  const handlePriceChange = (value: string) => {
    if (value === '') {
      setFormData({ ...formData, basePrice: '' });
      return;
    }
    
    // Se o usuário digitou apenas números, formata
    if (/^\d+$/.test(value)) {
      const formatted = formatCurrency(value);
      setFormData({ ...formData, basePrice: formatted });
    } else {
      // Se já está formatado, pega apenas os números e reformata
      const numericValue = value.replace(/\D/g, '');
      const formatted = formatCurrency(numericValue);
      setFormData({ ...formData, basePrice: formatted });
    }
  };

  // Função para lidar com mudança de equipamento
  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipment]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        equipment: prev.equipment.filter(item => item !== equipment)
      }));
    }
  };

  // Função para redimensionar imagem
  const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converter para Base64 com qualidade reduzida
        const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(resizedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Função para lidar with upload de mídia
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Limitar a 5 arquivos
    const maxFiles = 5;
    const currentFileCount = formData.mediaFiles.length;
    const remainingSlots = maxFiles - currentFileCount;
    
    if (remainingSlots <= 0) {
      toast({
        title: "Limite excedido",
        description: "Você pode adicionar no máximo 5 arquivos de mídia.",
        variant: "destructive",
      });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    // Verificar tamanho dos arquivos
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const validFiles = filesToProcess.filter(file => {
      if (file.size > maxFileSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Processar arquivos
    const newMediaFiles: string[] = [];
    
    for (const file of validFiles) {
      try {
        if (file.type.startsWith('image/')) {
          // Redimensionar imagens
          const resizedImage = await resizeImage(file);
          newMediaFiles.push(resizedImage);
        } else {
          // Para vídeos, criar uma URL temporária mais simples
          const url = `placeholder-video-${Date.now()}-${file.name}`;
          newMediaFiles.push(url);
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        toast({
          title: "Erro no upload",
          description: `Erro ao processar ${file.name}`,
          variant: "destructive",
        });
      }
    }

    if (newMediaFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        mediaFiles: [...prev.mediaFiles, ...newMediaFiles]
      }));
      
      toast({
        title: "Mídia adicionada",
        description: `${newMediaFiles.length} arquivo(s) adicionado(s) com sucesso.`,
      });
    }
  };

  // Função para remover mídia
  const handleRemoveMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/services', user?.id],
    queryFn: () => apiRequest("GET", `/api/services?providerId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id && user?.userType === 'prestador'
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await apiRequest("POST", "/api/services", serviceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Serviço criado",
        description: "Seu serviço foi criado com sucesso.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/services', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar serviço",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Serviço atualizado",
        description: "Suas alterações foram salvas.",
      });
      setEditingService(null);
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/services', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Excluindo serviço ID:', id);
      const response = await apiRequest("DELETE", `/api/services/${id}`);
      console.log('Resposta DELETE:', response.status, response.statusText);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta DELETE:', errorData);
        throw new Error('Erro ao excluir serviço');
      }
      return response;
    },
    onMutate: async (deletedId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['/api/services', user?.id] });
      
      // Snapshot do estado anterior
      const previousServices = queryClient.getQueryData(['/api/services', user?.id]);
      
      // Atualização otimista - remove o serviço da lista imediatamente
      queryClient.setQueryData(['/api/services', user?.id], (old: any[]) => {
        if (!old) return [];
        console.log('Removendo serviço da lista otimisticamente:', deletedId);
        return old.filter(service => service.id !== deletedId);
      });
      
      return { previousServices };
    },
    onSuccess: async () => {
      console.log('Exclusão bem-sucedida!');
      toast({
        title: "Serviço excluído",
        description: "O serviço foi removido do seu catálogo.",
      });
      
      // Invalidar e recarregar para garantir sincronização
      await queryClient.invalidateQueries({ queryKey: ['/api/services', user?.id] });
    },
    onError: (error: any, deletedId, context) => {
      console.error('Erro na exclusão, revertendo otimismo:', error);
      
      // Reverter a mudança otimista em caso de erro
      if (context?.previousServices) {
        queryClient.setQueryData(['/api/services', user?.id], context.previousServices);
      }
      
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o serviço",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      musicalGenre: "",
      hasEquipment: "",
      equipment: [],
      mediaFiles: [],
      basePrice: "",
      priceType: "fixed",
      duration: "",
      location: "",
      active: true
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.category || !formData.basePrice) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Converter preço formatado para número
    let priceNumber = 0;
    if (formData.basePrice) {
      // Remove "R$" e espaços, depois converte vírgula para ponto
      let priceString = formData.basePrice.toString();
      
      // Se tem formato R$ 1.500,00
      if (priceString.includes('R$')) {
        priceString = priceString
          .replace(/R\$\s?/g, '')  // Remove R$
          .replace(/\./g, '')      // Remove pontos (separadores de milhares)
          .replace(',', '.');      // Converte vírgula para ponto decimal
      }
      
      priceNumber = parseFloat(priceString) || 0;
    }

    console.log('Preço original:', formData.basePrice);
    console.log('Preço convertido:', priceNumber);

    const serviceData = {
      ...formData,
      basePrice: priceNumber,
      duration: formData.duration ? parseInt(formData.duration) : null,
    };

    console.log('Dados do serviço sendo enviados:', serviceData);

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      subcategory: service.subcategory || "",
      musicalGenre: service.musicalGenre || "",
      hasEquipment: service.hasEquipment || "",
      equipment: service.equipment || [],
      mediaFiles: service.mediaFiles || [],
      basePrice: `R$ ${parseFloat(service.basePrice?.toString() || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      priceType: service.priceType,
      duration: service.duration?.toString() || "",
      location: service.location || "",
      active: service.active
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      deleteServiceMutation.mutate(serviceToDelete.id);
      setServiceToDelete(null);
    }
  };

  if (user?.userType !== 'prestador') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso restrito</h2>
          <p className="text-gray-600 mb-4">Apenas prestadores de serviços podem acessar esta página.</p>
          <Button onClick={() => setLocation("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Meus Serviços</h1>
          <p className="text-gray-600">Gerencie seu catálogo de serviços</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingService(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Serviço" : "Criar Novo Serviço"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: DJ para festas"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SERVICE_CATEGORIES).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.category && (
                <div>
                  <Label htmlFor="subcategory">Subcategoria</Label>
                  <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value, musicalGenre: "" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES[formData.category as keyof typeof SERVICE_CATEGORIES]?.map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.category === 'entretenimento' && formData.subcategory === 'Cantor' && (
                <div>
                  <Label htmlFor="musicalGenre">Gênero Musical</Label>
                  <Select value={formData.musicalGenre} onValueChange={(value) => setFormData({ ...formData, musicalGenre: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gênero musical" />
                    </SelectTrigger>
                    <SelectContent>
                      {MUSICAL_GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.category === 'entretenimento' && formData.subcategory && 
               ['Banda', 'DJ', 'Cantor'].includes(formData.subcategory) && (
                <>
                  <div>
                    <Label htmlFor="hasEquipment">Possui equipamentos?</Label>
                    <Select value={formData.hasEquipment} onValueChange={(value) => setFormData({ ...formData, hasEquipment: value, equipment: [] })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Possuo">Possuo</SelectItem>
                        <SelectItem value="Não Possuo">Não Possuo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.hasEquipment === 'Possuo' && (
                    <div>
                      <Label>Equipamentos disponíveis</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {EQUIPMENT_OPTIONS.map((equipment) => (
                          <div key={equipment} className="flex items-center space-x-2">
                            <Checkbox
                              id={equipment}
                              checked={formData.equipment.includes(equipment)}
                              onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                            />
                            <Label htmlFor={equipment} className="text-sm">{equipment}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {formData.subcategory === 'Cantor' && (
                <div>
                  <Label>Mídia (Imagens/Vídeos) - Máximo 5 arquivos</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para upload</span> ou arraste arquivos
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, MP4 até 10MB</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        className="hidden"
                        disabled={formData.mediaFiles.length >= 5}
                      />
                    </label>
                  </div>
                  
                  {formData.mediaFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {formData.mediaFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={file} 
                              alt={`Mídia ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Se não for imagem, mostrar ícone de vídeo
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden w-full h-full flex items-center justify-center bg-gray-300">
                              <span className="text-xs text-gray-600">Vídeo</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva seu serviço em detalhes..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePrice">Preço (R$) *</Label>
                  <Input
                    id="basePrice"
                    value={formData.basePrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="R$ 0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="priceType">Tipo de preço</Label>
                  <Select value={formData.priceType} onValueChange={(value) => setFormData({ ...formData, priceType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duração (horas)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Localização</Label>
                <Popover open={openLocationCombobox} onOpenChange={setOpenLocationCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openLocationCombobox}
                      className="w-full justify-between"
                    >
                      {formData.location || "Selecione uma cidade..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar cidade..." />
                      <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                      <CommandGroup className="max-h-48 overflow-y-auto">
                        {BRAZILIAN_CITIES.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={(currentValue) => {
                              setFormData({ ...formData, location: currentValue === formData.location ? "" : currentValue });
                              setOpenLocationCombobox(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.location === city ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>



              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Serviço ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                    setEditingService(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                >
                  {createServiceMutation.isPending || updateServiceMutation.isPending 
                    ? "Salvando..." 
                    : editingService ? "Atualizar" : "Criar"
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : !services || services.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Nenhum serviço cadastrado</h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro serviço para aparecer nas buscas.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: Service) => {
            console.log('Serviço renderizado:', service);
            return (
            <Card key={service.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                      <Badge variant="secondary">{service.category}</Badge>
                      {service.subcategory && (
                        <Badge variant="outline">{service.subcategory}</Badge>
                      )}
                      {service.musicalGenre && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">{service.musicalGenre}</Badge>
                      )}
                      {service.hasEquipment === 'Possuo' && (
                        <Badge className="bg-green-500">Com Equipamentos</Badge>
                      )}
                      {service.mediaFiles && service.mediaFiles.length > 0 && (
                        <Badge className="bg-blue-500">{service.mediaFiles.length} Mídia(s)</Badge>
                      )}
                      {!service.active && <Badge variant="destructive">Inativo</Badge>}
                      {service.featured && <Badge className="bg-yellow-500">Destaque</Badge>}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(service)}
                      disabled={deleteServiceMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>R$ {parseFloat(service.basePrice?.toString() || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({service.priceType || 'fixed'})</span>
                  </div>
                  
                  {service.duration && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{service.duration}h</span>
                    </div>
                  )}
                  
                  {service.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{service.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600">
                    <Star className="w-4 h-4 mr-2" />
                    <span>{parseFloat(service.rating?.toString() || '0').toFixed(1)} ({service.reviewCount || 0} avaliações)</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{service.bookingCount || 0} contratações</span>
                  </div>
                </div>

                {service.mediaFiles && service.mediaFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Mídia disponível:</p>
                    <div className="flex gap-1 overflow-x-auto">
                      {service.mediaFiles.slice(0, 3).map((media, index) => (
                        <div key={index} className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          <img 
                            src={media} 
                            alt={`Mídia ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center bg-gray-300">
                            <span className="text-xs text-gray-600">📹</span>
                          </div>
                        </div>
                      ))}
                      {service.mediaFiles.length > 3 && (
                        <div className="w-12 h-12 bg-gray-300 rounded flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{service.mediaFiles.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço "{serviceToDelete?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending ? "Excluindo..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}