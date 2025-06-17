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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, MapPin, Users, DollarSign, Calendar, Image, CheckCircle } from "lucide-react";

interface Venue {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  capacity: number;
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerWeekend?: number;
  pricingModel: string;
  amenities: string[];
  images: string[];
  addressData?: string;
  active: boolean;
  createdAt: string;
}

const VENUE_CATEGORIES = [
  "Salão de festas", "Casa de eventos", "Sítio", "Chácara", "Hotel",
  "Restaurante", "Buffet", "Clube", "Igreja", "Teatro", "Auditório",
  "Espaço ao ar livre", "Coworking", "Galeria", "Outros"
];

const AMENITIES_OPTIONS = [
  "Estacionamento", "Ar condicionado", "Som e luz", "Cozinha",
  "Piscina", "Jardim", "Playground", "Churrasqueira", "Bar",
  "Palco", "Projetor", "Wi-Fi", "Decoração", "Camarim", "Segurança"
];

const PRICING_MODELS = [
  { value: "hourly", label: "Por hora" },
  { value: "daily", label: "Por dia" },
  { value: "weekend", label: "Pacote fim de semana" },
  { value: "custom", label: "Personalizado" }
];

export default function ManageVenues() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    category: "",
    capacity: "",
    pricePerHour: "",
    pricePerDay: "",
    pricePerWeekend: "",
    pricingModel: "hourly",
    amenities: [] as string[],
    active: true,
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: ""
  });

  const { data: venues, isLoading } = useQuery({
    queryKey: ['/api/venues', user?.id],
    queryFn: () => apiRequest(`/api/venues?ownerId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id && user?.userType === 'anunciante'
  });

  const createVenueMutation = useMutation({
    mutationFn: async (venueData: any) => {
      const response = await apiRequest("POST", "/api/venues", venueData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Espaço criado",
        description: "Seu espaço foi criado com sucesso.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/venues', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar espaço",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const updateVenueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/venues/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Espaço atualizado",
        description: "Suas alterações foram salvas.",
      });
      setEditingVenue(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/venues', user?.id] });
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/venues/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Espaço excluído",
        description: "O espaço foi removido da sua lista.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/venues', user?.id] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      category: "",
      capacity: "",
      pricePerHour: "",
      pricePerDay: "",
      pricePerWeekend: "",
      pricingModel: "hourly",
      amenities: [],
      active: true,
      cep: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: ""
    });
  };

  const fetchAddressByCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
            location: `${data.localidade}, ${data.uf}`
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleCEPChange = (value: string) => {
    const cleanCEP = value.replace(/\D/g, "");
    if (cleanCEP.length <= 8) {
      setFormData(prev => ({ ...prev, cep: cleanCEP }));
      if (cleanCEP.length === 8) {
        fetchAddressByCEP(cleanCEP);
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.category || !formData.capacity || !formData.cep || !formData.numero) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios (Nome, Descrição, Categoria, Capacidade, CEP e Número)",
        variant: "destructive",
      });
      return;
    }

    const addressData = {
      cep: formData.cep,
      rua: formData.rua,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado
    };

    const venueData = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      category: formData.category,
      capacity: parseInt(formData.capacity),
      pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
      pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
      pricePerWeekend: formData.pricePerWeekend ? parseFloat(formData.pricePerWeekend) : null,
      pricingModel: formData.pricingModel,
      amenities: formData.amenities,
      active: formData.active,
      addressData: JSON.stringify(addressData)
    };

    if (editingVenue) {
      updateVenueMutation.mutate({ id: editingVenue.id, data: venueData });
    } else {
      createVenueMutation.mutate(venueData);
    }
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    const addressData = venue.addressData ? JSON.parse(venue.addressData) : {};
    setFormData({
      name: venue.name,
      description: venue.description,
      location: venue.location,
      category: venue.category,
      capacity: venue.capacity.toString(),
      pricePerHour: venue.pricePerHour?.toString() || "",
      pricePerDay: venue.pricePerDay?.toString() || "",
      pricePerWeekend: venue.pricePerWeekend?.toString() || "",
      pricingModel: venue.pricingModel,
      amenities: venue.amenities || [],
      active: venue.active,
      cep: addressData.cep || "",
      rua: addressData.rua || "",
      numero: addressData.numero || "",
      bairro: addressData.bairro || "",
      cidade: addressData.cidade || "",
      estado: addressData.estado || ""
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (venueId: number) => {
    if (window.confirm("Tem certeza que deseja excluir este espaço?")) {
      deleteVenueMutation.mutate(venueId);
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    } else {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    }
  };

  if (user?.userType !== 'anunciante') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso restrito</h2>
          <p className="text-gray-600 mb-4">Apenas anunciantes podem acessar esta página.</p>
          <Button onClick={() => setLocation("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Meus Espaços</h1>
          <p className="text-gray-600">Gerencie seus espaços para eventos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingVenue(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Espaço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVenue ? "Editar Espaço" : "Criar Novo Espaço"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do espaço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Salão das Rosas"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENUE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva seu espaço em detalhes..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleCEPChange(e.target.value)}
                    placeholder="12345678"
                    maxLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacidade (pessoas) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={formData.rua}
                    onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                    placeholder="Preenchido automaticamente"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    placeholder="Preenchido automaticamente"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Preenchido automaticamente"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    placeholder="SP"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pricingModel">Modelo de preços</Label>
                <Select value={formData.pricingModel} onValueChange={(value) => setFormData({ ...formData, pricingModel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pricePerHour">Preço por hora</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="pricePerHour"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                      placeholder="0,00"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pricePerDay">Preço por dia</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="pricePerDay"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                      placeholder="0,00"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pricePerWeekend">Preço fim de semana</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <Input
                      id="pricePerWeekend"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.pricePerWeekend}
                      onChange={(e) => setFormData({ ...formData, pricePerWeekend: e.target.value })}
                      placeholder="0,00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Comodidades e facilidades</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Espaço ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                    setEditingVenue(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createVenueMutation.isPending || updateVenueMutation.isPending}
                >
                  {createVenueMutation.isPending || updateVenueMutation.isPending 
                    ? "Salvando..." 
                    : editingVenue ? "Atualizar" : "Criar"
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
      ) : !venues || venues.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">Nenhum espaço cadastrado</h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro espaço para receber solicitações.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Espaço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue: Venue) => (
            <Card key={venue.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{venue.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{venue.category}</Badge>
                      {!venue.active && <Badge variant="destructive">Inativo</Badge>}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(venue)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(venue.id)}
                      disabled={deleteVenueMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {venue.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{venue.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Até {venue.capacity} pessoas</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>
                      {venue.pricePerHour && `R$ ${venue.pricePerHour}/h`}
                      {venue.pricePerDay && ` • R$ ${venue.pricePerDay}/dia`}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{venue.pricingModel}</span>
                  </div>
                </div>

                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {venue.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {amenity}
                        </Badge>
                      ))}
                      {venue.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{venue.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setLocation(`/venues/${venue.id}/calendar`)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Gerenciar disponibilidade
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}