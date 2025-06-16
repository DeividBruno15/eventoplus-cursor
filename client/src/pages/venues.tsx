import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Users, DollarSign, Plus, Edit2, Eye, Star, Calendar, Building } from "lucide-react";

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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    capacity: "",
    pricePerHour: "",
    category: "",
    amenities: [] as string[]
  });

  // Buscar venues do usuário (se anunciante) ou todos (se outro tipo)
  const { data: venues = [], isLoading } = useQuery<Venue[]>({
    queryKey: ["/api/venues", user?.userType === 'anunciante' ? user.id : 'all'],
  });

  // Mutation para criar venue
  const createVenueMutation = useMutation({
    mutationFn: async (venueData: any) => {
      return apiRequest("POST", "/api/venues", venueData);
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

  // Mutation para atualizar venue
  const updateVenueMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/venues/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Espaço atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/venues"] });
      setEditingVenue(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar espaço",
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
      city: "",
      state: "",
      capacity: "",
      pricePerHour: "",
      category: "",
      amenities: []
    });
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
      pricePerHour: parseFloat(formData.pricePerHour)
    };

    if (editingVenue) {
      updateVenueMutation.mutate({ id: editingVenue.id, data: venueData });
    } else {
      createVenueMutation.mutate(venueData);
    }
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      description: venue.description,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      capacity: venue.capacity.toString(),
      pricePerHour: venue.pricePerHour.toString(),
      category: venue.category,
      amenities: venue.amenities
    });
    setIsCreateDialogOpen(true);
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Filtrar e ordenar venues
  const filteredVenues = venues
    .filter((venue: Venue) => {
      const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           venue.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || venue.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: Venue, b: Venue) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.pricePerHour - b.pricePerHour;
        case "capacity":
          return b.capacity - a.capacity;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const isAnunciante = user?.userType === 'anunciante';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {isAnunciante ? 'Meus Espaços' : 'Espaços Disponíveis'}
            </h1>
            <p className="text-gray-600">
              {isAnunciante 
                ? 'Gerencie seus espaços e maximize sua ocupação'
                : 'Encontre o espaço perfeito para seu evento'
              }
            </p>
          </div>
          
          {isAnunciante && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Espaço
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingVenue ? 'Editar Espaço' : 'Cadastrar Novo Espaço'}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha as informações do seu espaço para atrair mais clientes
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Espaço *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Salão Elegante"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
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
                      placeholder="Descreva seu espaço, suas características e diferenciais..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço Completo *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número, bairro"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Nome da cidade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="SP"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capacity">Capacidade</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="Número de pessoas"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço por Hora (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.pricePerHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Comodidades</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {amenitiesList.map(amenity => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onChange={() => handleAmenityToggle(amenity)}
                            className="rounded"
                          />
                          <label htmlFor={amenity} className="text-sm">{amenity}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={createVenueMutation.isPending || updateVenueMutation.isPending}
                      className="bg-primary hover:bg-blue-700"
                    >
                      {editingVenue ? 'Atualizar' : 'Cadastrar'} Espaço
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingVenue(null);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="Buscar por nome ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
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

        {/* Lista de Venues */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isAnunciante ? 'Nenhum espaço cadastrado' : 'Nenhum espaço encontrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isAnunciante 
                ? 'Comece cadastrando seu primeiro espaço para começar a receber reservas.'
                : 'Tente ajustar os filtros ou buscar por outros termos.'
              }
            </p>
            {isAnunciante && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Espaço
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue: Venue) => (
              <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Building className="h-16 w-16 text-white opacity-50" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant={venue.active ? 'default' : 'secondary'}>
                      {venue.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg truncate">{venue.name}</h3>
                    {venue.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{venue.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{venue.city}, {venue.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Até {venue.capacity} pessoas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {venue.pricePerHour}/hora</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {venue.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {venue.amenities.slice(0, 3).map(amenity => (
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

                  <div className="flex gap-2">
                    {isAnunciante && venue.ownerId === user?.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(venue)}
                          className="flex-1"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="flex-1 bg-primary hover:bg-blue-700">
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}