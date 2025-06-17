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
import { MapPin, Users, DollarSign, Plus, Edit2, Eye, Star, Calendar, Building, MapPinIcon } from "lucide-react";
import { CEPInput } from "@/components/ui/cep-input";
import { MediaUpload } from "@/components/ui/media-upload";

interface Venue {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  active: boolean;
  createdAt: string;
}

export default function Venues() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  // Form state with CEP integration
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    cep: "",
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
  const { data: userVenues = [], isLoading: venuesLoading } = useQuery({
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
        description: "Seu espaço foi cadastrado com sucesso e as mídias foram enviadas.",
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
    "Cozinha",
    "Bar",
    "Jardim",
    "Piscina",
    "WiFi",
    "Acessibilidade"
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      neighborhood: "",
      city: "",
      state: "",
      cep: "",
      capacity: "",
      pricePerHour: "",
      category: "",
      amenities: []
    });
    setMediaFiles([]);
  };

  const handleCEPFound = (address: any) => {
    setFormData(prev => ({
      ...prev,
      cep: address.cep,
      address: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.address || !formData.city) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const venueData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      pricePerHour: parseFloat(formData.pricePerHour),
      amenities: JSON.stringify(formData.amenities)
    };

    createVenueMutation.mutate(venueData);
  };

  const handleNewVenue = () => {
    setEditingVenue(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Filter and sort venues
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = searchTerm === "" || 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || venue.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "price": return a.pricePerHour - b.pricePerHour;
      case "capacity": return b.capacity - a.capacity;
      case "rating": return b.rating - a.rating;
      default: return 0;
    }
  });

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user.userType === 'anunciante' ? 'Meus Espaços' : 'Espaços Disponíveis'}
          </h1>
          <p className="text-gray-600">
            {user.userType === 'anunciante' 
              ? 'Gerencie seus espaços e visualize reservas'
              : 'Encontre o espaço perfeito para seu evento'
            }
          </p>
        </div>
        
        {user.userType === 'anunciante' && (
          <Button onClick={handleNewVenue} className="bg-[#3C5BFA] hover:bg-[#2C46E8]">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Espaço
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Buscar espaços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="price">Preço</SelectItem>
            <SelectItem value="capacity">Capacidade</SelectItem>
            <SelectItem value="rating">Avaliação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Venues Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {venue.images && venue.images.length > 0 ? (
                  <img 
                    src={venue.images[0]} 
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Building className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-white text-gray-800">
                  {venue.category}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{venue.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{venue.city}, {venue.state}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{venue.capacity} pessoas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        R$ {venue.pricePerHour}/hora
                      </span>
                    </div>
                  </div>
                  
                  {venue.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{venue.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({venue.reviewCount} avaliações)</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {venue.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {venue.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{venue.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredVenues.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum espaço encontrado
            </h3>
            <p className="text-gray-600">
              {user.userType === 'anunciante'
                ? 'Você ainda não cadastrou nenhum espaço.'
                : 'Não há espaços disponíveis com os filtros selecionados.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Venue Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVenue ? 'Editar Espaço' : 'Adicionar Novo Espaço'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do seu espaço e adicione fotos e vídeos para atrair mais clientes.
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
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
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
                placeholder="Descreva seu espaço, destacando os principais atrativos..."
                rows={3}
              />
            </div>

            {/* Address with CEP Integration */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Endereço</h4>
              
              <div>
                <Label htmlFor="cep">CEP</Label>
                <CEPInput
                  onAddressFound={handleCEPFound}
                  initialValue={formData.cep}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Rua/Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua, número"
                  />
                </div>
                
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Estado"
                  />
                </div>
              </div>
            </div>

            {/* Capacity and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacidade (pessoas) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="100"
                />
              </div>
              
              <div>
                <Label htmlFor="pricePerHour">Preço por Hora (R$) *</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  step="0.01"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                  placeholder="150.00"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <Label>Comodidades</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <Label>Fotos e Vídeos do Espaço</Label>
              <MediaUpload
                onMediaChange={setMediaFiles}
                maxFiles={10}
                initialMedia={mediaFiles}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createVenueMutation.isPending}
                className="bg-[#3C5BFA] hover:bg-[#2C46E8]"
              >
                {createVenueMutation.isPending ? "Salvando..." : "Salvar Espaço"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}