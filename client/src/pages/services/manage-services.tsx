import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, DollarSign, Clock, MapPin, Eye, Star } from "lucide-react";

interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  basePrice: number;
  priceType: string;
  duration?: number;
  location?: string;
  serviceArea: string[];
  portfolio: string[];
  requirements?: string;
  includes: string[];
  excludes: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  bookingCount: number;
  active: boolean;
  featured: boolean;
  createdAt: string;
}

const SERVICE_CATEGORIES = {
  "entretenimento": [
    "DJ", "Banda", "MC", "Animação", "Karaokê", "Show", "Dança"
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    basePrice: "",
    priceType: "fixed",
    duration: "",
    location: "",
    serviceArea: "",
    requirements: "",
    includes: "",
    excludes: "",
    tags: "",
    active: true
  });

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
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/services', user?.id] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Serviço excluído",
        description: "O serviço foi removido do seu catálogo.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services', user?.id] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      subcategory: "",
      basePrice: "",
      priceType: "fixed",
      duration: "",
      location: "",
      serviceArea: "",
      requirements: "",
      includes: "",
      excludes: "",
      tags: "",
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

    const serviceData = {
      ...formData,
      basePrice: parseFloat(formData.basePrice),
      duration: formData.duration ? parseInt(formData.duration) : null,
      serviceArea: formData.serviceArea.split(',').map(s => s.trim()).filter(s => s),
      includes: formData.includes.split(',').map(s => s.trim()).filter(s => s),
      excludes: formData.excludes.split(',').map(s => s.trim()).filter(s => s),
      tags: formData.tags.split(',').map(s => s.trim()).filter(s => s),
    };

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
      basePrice: service.basePrice.toString(),
      priceType: service.priceType,
      duration: service.duration?.toString() || "",
      location: service.location || "",
      serviceArea: service.serviceArea.join(', '),
      requirements: service.requirements || "",
      includes: service.includes.join(', '),
      excludes: service.excludes.join(', '),
      tags: service.tags.join(', '),
      active: service.active
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (serviceId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteServiceMutation.mutate(serviceId);
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
                  <Select value={formData.subcategory} onValueChange={(value) => setFormData({ ...formData, subcategory: value })}>
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
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceArea">Áreas de atendimento</Label>
                  <Input
                    id="serviceArea"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    placeholder="Separado por vírgula"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Requisitos específicos para este serviço..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="includes">O que está incluso</Label>
                  <Textarea
                    id="includes"
                    value={formData.includes}
                    onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                    placeholder="Separado por vírgula"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="excludes">O que não está incluso</Label>
                  <Textarea
                    id="excludes"
                    value={formData.excludes}
                    onChange={(e) => setFormData({ ...formData, excludes: e.target.value })}
                    placeholder="Separado por vírgula"
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Separado por vírgula: festa, casamento, aniversário"
                />
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
          {services.map((service: Service) => (
            <Card key={service.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{service.category}</Badge>
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
                      onClick={() => handleDelete(service.id)}
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
                    <span>R$ {service.basePrice.toLocaleString()} ({service.priceType})</span>
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
                    <span>{service.rating.toFixed(1)} ({service.reviewCount} avaliações)</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{service.bookingCount} contratações</span>
                  </div>
                </div>

                {service.tags.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {service.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {service.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{service.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}