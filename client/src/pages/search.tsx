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
  const [showFilters, setShowFilters] = useState(false);
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
    queryKey: [`/api/search/${activeTab}`, debouncedQuery, filters],
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.location) count++;
    if (filters.rating > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    if (filters.capacity[0] > 0 || filters.capacity[1] < 1000) count++;
    if (filters.dateRange[0] || filters.dateRange[1]) count++;
    return count;
  };

  const renderEventCard = (event: any) => (
    <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {new Date(event.eventDate).toLocaleDateString('pt-BR')}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <DollarSign className="h-4 w-4" />
            Orçamento: R$ {event.budget?.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderServiceCard = (service: any) => (
    <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            {service.category}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {service.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <DollarSign className="h-4 w-4" />
            A partir de R$ {service.price?.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderVenueCard = (venue: any) => (
    <Card key={venue.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{venue.name}</CardTitle>
          <Badge variant={venue.active ? 'default' : 'secondary'}>
            {venue.active ? 'Disponível' : 'Indisponível'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-3 line-clamp-2">{venue.description}</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            {venue.location}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            Capacidade: {venue.capacity} pessoas
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <DollarSign className="h-4 w-4" />
            A partir de R$ {venue.pricePerHour?.toLocaleString()}/hora
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Buscar na Plataforma</h1>
          <p className="text-gray-600">Encontre eventos, prestadores de serviços e espaços para seus eventos</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Digite sua busca..."
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="h-12">
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES[activeTab as keyof typeof CATEGORIES]?.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Localização</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cidade ou região"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Avaliação mín.</label>
                  <Select value={filters.rating.toString()} onValueChange={(value) => updateFilter('rating', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Qualquer</SelectItem>
                      <SelectItem value="3">3+ estrelas</SelectItem>
                      <SelectItem value="4">4+ estrelas</SelectItem>
                      <SelectItem value="5">5 estrelas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Faixa de Preço</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0] || ''}
                      onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                      className="text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1] || ''}
                      onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 10000])}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Prestadores
            </TabsTrigger>
            <TabsTrigger value="venues" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Espaços
            </TabsTrigger>
          </TabsList>

          {/* Results */}
          <div className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TabsContent value="events" className="col-span-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(renderEventCard)}
                  </div>
                </TabsContent>
                <TabsContent value="services" className="col-span-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(renderServiceCard)}
                  </div>
                </TabsContent>
                <TabsContent value="venues" className="col-span-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(renderVenueCard)}
                  </div>
                </TabsContent>
              </div>
            ) : debouncedQuery.length > 2 || filters.category ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <SearchIcon className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <SearchIcon className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Comece sua busca</h3>
                <p className="text-gray-500">Digite pelo menos 3 caracteres ou selecione uma categoria</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}