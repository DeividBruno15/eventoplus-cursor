import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Users, DollarSign, Plus, Edit2, Eye, Star, Calendar, Building } from "lucide-react";
import { CEPInput } from "@/components/ui/cep-input";
import { MediaUpload } from "@/components/ui/media-upload";

interface Venue {
  id: number;
  ownerId: number;
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
  active: boolean;
  createdAt: string;
}

export default function Venues() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    capacity: "",
    pricePerHour: "",
    pricePerDay: "",
    pricePerWeekend: "",
    pricingModel: "hourly",
    category: "",
    amenities: [] as string[]
  });

  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [addressData, setAddressData] = useState({
    cep: "",
    street: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  // Fetch user venues
  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["/api/venues"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/venues");
      return response;
    },
  });

  const createVenueMutation = useMutation({
    mutationFn: async (venueData: any) => {
      return apiRequest("POST", "/api/venues", {
        ...venueData,
        images: mediaFiles.map(m => m.url),
        addressData: JSON.stringify(addressData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Espaço criado!",
        description: "Seu espaço foi cadastrado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar espaço",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const categories = [
    "Salão de Festas",
    "Casa de Eventos", 
    "Hotel/Pousada",
    "Espaço Corporativo",
    "Área ao Ar Livre",
    "Espaço Cultural",
    "Outros"
  ];

  const amenitiesList = [
    "Estacionamento",
    "Ar Condicionado",
    "Sistema de Som",
    "Projetor",
    "Wi-Fi",
    "Cozinha",
    "Banheiros",
    "Acessibilidade",
    "Segurança 24h",
    "Área Externa",
    "Piscina",
    "Jardim"
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      capacity: "",
      pricePerHour: "",
      pricePerDay: "",
      pricePerWeekend: "",
      pricingModel: "hourly",
      category: "",
      amenities: []
    });
    setMediaFiles([]);
    setAddressData({
      cep: "",
      street: "",
      neighborhood: "",
      city: "",
      state: ""
    });
  };

  const handleCEPFound = (address: any) => {
    setAddressData({
      cep: address.cep,
      street: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state
    });
    
    const fullAddress = `${address.street}, ${address.neighborhood}, ${address.city}/${address.state}`;
    setFormData(prev => ({
      ...prev,
      location: fullAddress
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.location || !formData.capacity || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (formData.pricingModel === "hourly" && !formData.pricePerHour) {
      toast({
        title: "Preço obrigatório",
        description: "Informe o preço por hora",
        variant: "destructive",
      });
      return;
    }

    if (formData.pricingModel === "daily" && !formData.pricePerDay) {
      toast({
        title: "Preço obrigatório",
        description: "Informe o preço por dia",
        variant: "destructive",
      });
      return;
    }

    if (formData.pricingModel === "weekend" && !formData.pricePerWeekend) {
      toast({
        title: "Preço obrigatório",
        description: "Informe o preço por final de semana",
        variant: "destructive",
      });
      return;
    }

    createVenueMutation.mutate({
      ...formData,
      capacity: parseInt(formData.capacity),
      pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
      pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
      pricePerWeekend: formData.pricePerWeekend ? parseFloat(formData.pricePerWeekend) : null,
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const formatPrice = (venue: Venue) => {
    if (venue.pricingModel === "hourly" && venue.pricePerHour) {
      return `R$ ${venue.pricePerHour}/hora`;
    }
    if (venue.pricingModel === "daily" && venue.pricePerDay) {
      return `R$ ${venue.pricePerDay}/dia`;
    }
    if (venue.pricingModel === "weekend" && venue.pricePerWeekend) {
      return `R$ ${venue.pricePerWeekend}/fim de semana`;
    }
    return "Consultar preço";
  };

  // Filter venues
  const filteredVenues = Array.isArray(venues) ? venues.filter((venue: Venue) => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || venue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  if (user?.userType !== "anunciante") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600">Esta página é apenas para usuários anunciantes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Meus Espaços</h1>
          <p className="text-gray-600">
            Gerencie seus espaços para eventos e acompanhe as reservas
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Anunciar Espaço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Anunciar Novo Espaço</DialogTitle>
              <DialogDescription>
                Preencha as informações do seu espaço para eventos
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Espaço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Salão de Festas Paradise"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva seu espaço, diferenciais e características..."
                  rows={4}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <Label>Endereço *</Label>
                <CEPInput onAddressFound={handleCEPFound} />
                <div>
                  <Label htmlFor="location">Endereço Completo</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Será preenchido automaticamente com o CEP"
                  />
                </div>
              </div>

              {/* Capacity and Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacidade (pessoas) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="pricingModel">Modelo de Precificação *</Label>
                  <RadioGroup
                    value={formData.pricingModel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, pricingModel: value }))}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly">Por Hora</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Por Dia</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekend" id="weekend" />
                      <Label htmlFor="weekend">Fim de Semana</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Pricing Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.pricingModel === "hourly" && (
                  <div>
                    <Label htmlFor="pricePerHour">Preço por Hora (R$) *</Label>
                    <Input
                      id="pricePerHour"
                      type="number"
                      step="0.01"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                      placeholder="200.00"
                    />
                  </div>
                )}
                {formData.pricingModel === "daily" && (
                  <div>
                    <Label htmlFor="pricePerDay">Preço por Dia (R$) *</Label>
                    <Input
                      id="pricePerDay"
                      type="number"
                      step="0.01"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: e.target.value }))}
                      placeholder="1500.00"
                    />
                  </div>
                )}
                {formData.pricingModel === "weekend" && (
                  <div>
                    <Label htmlFor="pricePerWeekend">Preço por Fim de Semana (R$) *</Label>
                    <Input
                      id="pricePerWeekend"
                      type="number"
                      step="0.01"
                      value={formData.pricePerWeekend}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerWeekend: e.target.value }))}
                      placeholder="3000.00"
                    />
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <Label>Comodidades</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <Label>Fotos do Espaço</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Adicione até 10 fotos para mostrar seu espaço
                </p>
                <MediaUpload
                  onMediaChange={setMediaFiles}
                  maxFiles={10}
                  initialMedia={mediaFiles}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createVenueMutation.isPending}
                  className="bg-primary hover:bg-blue-700"
                >
                  {createVenueMutation.isPending ? "Criando..." : "Criar Espaço"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar espaços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Venues Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="p-4 bg-white rounded-b-lg border">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory !== "all" ? "Nenhum espaço encontrado" : "Nenhum espaço cadastrado"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== "all" 
              ? "Tente ajustar os filtros de busca"
              : "Comece criando seu primeiro espaço para eventos"
            }
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Anunciar Primeiro Espaço
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue: Venue) => (
            <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {venue.images && venue.images.length > 0 ? (
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={venue.active ? "default" : "secondary"}>
                    {venue.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{venue.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {venue.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="line-clamp-1">{venue.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Até {venue.capacity} pessoas</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="font-medium text-primary">
                      {formatPrice(venue)}
                    </span>
                  </div>
                </div>
                
                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {venue.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {venue.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{venue.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4" />
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