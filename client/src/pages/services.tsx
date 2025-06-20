import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { getQueryFn } from "@/lib/queryClient";
import { Star, MapPin, DollarSign, Search, Filter, Plus, Camera, Music, Utensils, Palette } from "lucide-react";

interface Service {
  id: number;
  providerId: number;
  title: string;
  description: string;
  category: string;
  basePrice: number;
  active: boolean;
  createdAt: string;
  providerName?: string;
  providerLocation?: string;
  rating?: number;
  reviewCount?: number;
}

const categoryIcons = {
  fotografia: Camera,
  musica: Music,
  buffet: Utensils,
  decoracao: Palette,
  outros: Filter,
};

export default function Services() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Filtrar serviços
  const filteredServices = services.filter((service: Service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || service.category === categoryFilter;
    const matchesLocation = !locationFilter || 
                           (service.providerLocation && 
                            service.providerLocation.toLowerCase().includes(locationFilter.toLowerCase()));
    
    let matchesPrice = true;
    if (priceRange && service.basePrice) {
      const [min, max] = priceRange.split('-').map(Number);
      matchesPrice = service.basePrice >= min && (!max || service.basePrice <= max);
    }
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && service.active;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-16 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Prestadores de Serviços
            </h1>
            <p className="text-gray-600">
              Encontre os melhores profissionais para o seu evento
            </p>
          </div>
          
          {user?.userType === 'prestador' && (
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Meus Serviços
            </Button>
          )}
        </div>

        {/* Filtros de busca */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Encontrar Prestadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  <SelectItem value="fotografia">Fotografia</SelectItem>
                  <SelectItem value="musica">Música</SelectItem>
                  <SelectItem value="buffet">Buffet</SelectItem>
                  <SelectItem value="decoracao">Decoração</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Localização..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Qualquer preço</SelectItem>
                  <SelectItem value="0-500">Até R$ 500</SelectItem>
                  <SelectItem value="500-1000">R$ 500 - R$ 1.000</SelectItem>
                  <SelectItem value="1000-2500">R$ 1.000 - R$ 2.500</SelectItem>
                  <SelectItem value="2500-5000">R$ 2.500 - R$ 5.000</SelectItem>
                  <SelectItem value="5000-999999">Acima de R$ 5.000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Categorias populares */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categorias Populares</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoryIcons).map(([category, Icon]) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(categoryFilter === category ? "" : category)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || categoryFilter || locationFilter || priceRange
                ? 'Nenhum serviço encontrado'
                : 'Nenhum serviço disponível'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter || locationFilter || priceRange
                ? 'Tente ajustar os filtros para encontrar mais resultados.'
                : 'Prestadores de serviços aparecerão aqui assim que se cadastrarem.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredServices.length} {filteredServices.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service: Service) => {
                const IconComponent = categoryIcons[service.category as keyof typeof categoryIcons] || Filter;
                
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="" />
                            <AvatarFallback>
                              <IconComponent className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg line-clamp-1">
                              {service.providerName || `Prestador #${service.providerId}`}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {service.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium">{typeof service.rating === 'number' ? service.rating.toFixed(1) : '0.0'}</span>
                                  <span className="text-sm text-gray-500">
                                    ({service.reviewCount || 0})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {service.category}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {service.title}
                      </CardTitle>
                      
                      <CardDescription className="line-clamp-3">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {service.providerLocation && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{service.providerLocation}</span>
                          </div>
                        )}
                        
                        {service.basePrice && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                              <DollarSign className="h-5 w-5" />
                              <span>A partir de R$ {service.basePrice.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t">
                          <Button size="sm" className="w-full bg-primary hover:bg-blue-700">
                            Ver Perfil e Contratar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}