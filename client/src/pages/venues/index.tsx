import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, Users, Wifi, Car, Camera, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Venue {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  capacity: number;
  price: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  availability: boolean;
}

export default function VenuesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["/api/venues", searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      const response = await fetch(`/api/venues?${params}`);
      if (!response.ok) throw new Error("Falha ao carregar espaços");
      return response.json();
    },
  });

  const categories = [
    { value: "all", label: "Todos os Espaços" },
    { value: "salao-festa", label: "Salão de Festa" },
    { value: "espaco-eventos", label: "Espaço de Eventos" },
    { value: "casa-festas", label: "Casa de Festas" },
    { value: "chacara", label: "Chácara" },
    { value: "hotel", label: "Hotel" },
    { value: "restaurante", label: "Restaurante" },
  ];

  const amenityIcons = {
    "Wi-Fi": Wifi,
    "Estacionamento": Car,
    "Som": Camera,
    "Catering": Users,
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espaços para Eventos</h1>
          <p className="text-gray-600 mt-1">
            Encontre o local perfeito para seu evento
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar espaços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              style={selectedCategory === category.value ? { backgroundColor: '#3C5BFA' } : {}}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue: Venue) => (
          <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {venue.images?.[0] ? (
                <img
                  src={venue.images[0]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Calendar className="h-12 w-12" />
                </div>
              )}
              <Badge className="absolute top-2 left-2" variant="secondary">
                {venue.category}
              </Badge>
              {venue.availability && (
                <Badge className="absolute top-2 right-2 bg-green-500">
                  Disponível
                </Badge>
              )}
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">{venue.name}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">{venue.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">
                      {venue.rating || 5.0}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({venue.reviewCount || 0} avaliações)
                  </span>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{venue.capacity || 100} pessoas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{venue.location}</span>
                  </div>
                </div>

                {/* Amenities */}
                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {venue.amenities.slice(0, 3).map((amenity) => {
                      const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Users;
                      return (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          <IconComponent className="h-3 w-3 mr-1" />
                          {amenity}
                        </Badge>
                      );
                    })}
                    {venue.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{venue.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-bold" style={{ color: '#3C5BFA' }}>
                    {formatPrice(venue.price || "0")}
                    <span className="text-sm font-normal text-gray-600">/dia</span>
                  </div>
                  <Button size="sm" style={{ backgroundColor: '#3C5BFA' }}>
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {venues.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum espaço encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== "all" 
              ? "Tente ajustar os filtros de busca"
              : "Nenhum espaço disponível no momento"
            }
          </p>
        </div>
      )}
    </div>
  );
}