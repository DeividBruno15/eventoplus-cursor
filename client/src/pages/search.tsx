import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, MapPin, Star, Users, Calendar, DollarSign, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  priceRange: [number, number];
  rating: number;
  capacity: [number, number];
  dateRange: [string, string];
}

const CATEGORIES = {
  events: ["Casamento", "Festa Corporativa", "Aniversário", "Formatura", "Show", "Conferência"],
  services: ["DJ", "Fotografia", "Decoração", "Catering", "Segurança", "Som e Luz", "Animação"],
  venues: ["Salão de Festas", "Casa de Shows", "Hotel", "Espaço ao Ar Livre", "Centro de Convenções"]
};

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState("events");
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    location: "",
    priceRange: [0, 10000],
    rating: 0,
    capacity: [0, 1000],
    dateRange: ["", ""]
  });

  const debouncedQuery = useDebounce(filters.query, 300);

  // Buscar resultados baseados na tab ativa
  const { data: results = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/${activeTab}`, filters],
    enabled: debouncedQuery.length > 2 || filters.category !== "",
  });

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      location: "",
      priceRange: [0, 10000],
      rating: 0,
      capacity: [0, 1000],
      dateRange: ["", ""]
    });
  };

  const renderEventCard = (event: any) => (
    <Card key={event.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
          <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{event.expectedAttendees} pessoas esperadas</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Orçamento: R$ {event.budget?.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{event.description}</p>
          <Badge variant="outline">{event.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderServiceCard = (service: any) => (
    <Card key={service.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.title}</CardTitle>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <span>{service.providerName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{service.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>A partir de R$ {service.basePrice}</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{service.description}</p>
          <Badge variant="outline">{service.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderVenueCard = (venue: any) => (
    <Card key={venue.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{venue.name}</CardTitle>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{venue.city}, {venue.state}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{venue.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Capacidade: {venue.capacity} pessoas</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>R$ {venue.pricePerHour}/hora</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{venue.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {venue.amenities?.slice(0, 3).map((amenity: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {venue.amenities?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.amenities.length - 3} mais
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Busca Avançada</h1>
        <p className="text-gray-600">Encontre eventos, serviços e espaços de forma detalhada</p>
      </div>

      {/* Filtros de Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {CATEGORIES[activeTab as keyof typeof CATEGORIES]?.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Localização"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
            />

            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Resultados */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="venues">Espaços</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : results.length > 0 ? (
              results.map(renderEventCard)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Nenhum evento encontrado</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : results.length > 0 ? (
              results.map(renderServiceCard)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Nenhum serviço encontrado</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="venues" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : results.length > 0 ? (
              results.map(renderVenueCard)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Nenhum espaço encontrado</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}