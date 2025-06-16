import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter, MapPin, DollarSign, Star, Users, Search, X } from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  priceRange: [number, number];
  rating: number;
  capacity: [number, number];
  amenities: string[];
}

interface AdvancedSearchProps {
  searchType: 'events' | 'services' | 'venues';
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function AdvancedSearch({ searchType, onFiltersChange, initialFilters = {} }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    location: '',
    priceRange: [0, 10000],
    rating: 0,
    capacity: [1, 1000],
    amenities: [],
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const debouncedQuery = useDebounce(filters.query, 300);

  useEffect(() => {
    onFiltersChange({ ...filters, query: debouncedQuery });
  }, [debouncedQuery, filters, onFiltersChange]);

  const categories = {
    events: [
      'Casamentos',
      'Aniversários',
      'Formaturas',
      'Eventos Corporativos',
      'Conferências',
      'Workshops',
      'Feiras',
      'Shows',
      'Exposições'
    ],
    services: [
      'Fotografia',
      'Filmagem',
      'Decoração',
      'Buffet',
      'DJ/Som',
      'Banda/Música',
      'Iluminação',
      'Segurança',
      'Limpeza',
      'Floricultura'
    ],
    venues: [
      'Salão de Festas',
      'Casa de Eventos',
      'Hotel/Pousada',
      'Espaço Corporativo',
      'Área ao Ar Livre',
      'Espaço Cultural',
      'Restaurante',
      'Clube',
      'Igreja/Templo'
    ]
  };

  const amenitiesList = [
    'Estacionamento',
    'Ar Condicionado',
    'Sistema de Som',
    'Projetor',
    'Cozinha',
    'Bar',
    'Jardim',
    'Piscina',
    'WiFi',
    'Acessibilidade'
  ];

  const locations = [
    'São Paulo - SP',
    'Rio de Janeiro - RJ',
    'Belo Horizonte - MG',
    'Brasília - DF',
    'Salvador - BA',
    'Fortaleza - CE',
    'Recife - PE',
    'Porto Alegre - RS',
    'Curitiba - PR',
    'Goiânia - GO'
  ];

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (key !== 'query') {
      onFiltersChange(newFilters);
    }
    
    updateActiveFilters(newFilters);
  };

  const updateActiveFilters = (currentFilters: SearchFilters) => {
    const active: string[] = [];
    
    if (currentFilters.category) active.push(`Categoria: ${currentFilters.category}`);
    if (currentFilters.location) active.push(`Local: ${currentFilters.location}`);
    if (currentFilters.priceRange[0] > 0 || currentFilters.priceRange[1] < 10000) {
      active.push(`Preço: R$ ${currentFilters.priceRange[0]} - R$ ${currentFilters.priceRange[1]}`);
    }
    if (currentFilters.rating > 0) active.push(`Avaliação: ${currentFilters.rating}+ estrelas`);
    if (currentFilters.capacity[0] > 1 || currentFilters.capacity[1] < 1000) {
      active.push(`Capacidade: ${currentFilters.capacity[0]} - ${currentFilters.capacity[1]} pessoas`);
    }
    if (currentFilters.amenities.length > 0) {
      active.push(`${currentFilters.amenities.length} comodidade(s)`);
    }
    
    setActiveFilters(active);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: filters.query,
      category: '',
      location: '',
      priceRange: [0, 10000],
      rating: 0,
      capacity: [1, 1000],
      amenities: []
    };
    
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setActiveFilters([]);
  };

  const removeFilter = (filterText: string) => {
    const newFilters = { ...filters };
    
    if (filterText.startsWith('Categoria:')) newFilters.category = '';
    else if (filterText.startsWith('Local:')) newFilters.location = '';
    else if (filterText.startsWith('Preço:')) newFilters.priceRange = [0, 10000];
    else if (filterText.startsWith('Avaliação:')) newFilters.rating = 0;
    else if (filterText.startsWith('Capacidade:')) newFilters.capacity = [1, 1000];
    else if (filterText.includes('comodidade')) newFilters.amenities = [];
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
    updateActiveFilters(newFilters);
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    updateFilter('amenities', newAmenities);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder={`Buscar ${searchType === 'events' ? 'eventos' : searchType === 'services' ? 'serviços' : 'espaços'}...`}
          value={filters.query}
          onChange={(e) => updateFilter('query', e.target.value)}
          className="pl-10 pr-12"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-red-100"
              onClick={() => removeFilter(filter)}
            >
              {filter}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            Limpar todos
          </Button>
        </div>
      )}

      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories[searchType].map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Localização
                </label>
                <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Avaliação Mínima
                </label>
                <Select value={filters.rating.toString()} onValueChange={(value) => updateFilter('rating', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Qualquer avaliação</SelectItem>
                    <SelectItem value="1">1+ estrelas</SelectItem>
                    <SelectItem value="2">2+ estrelas</SelectItem>
                    <SelectItem value="3">3+ estrelas</SelectItem>
                    <SelectItem value="4">4+ estrelas</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Faixa de Preço (R$)
              </label>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value)}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>R$ {filters.priceRange[0]}</span>
                  <span>R$ {filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {(searchType === 'venues' || searchType === 'events') && (
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Capacidade (pessoas)
                </label>
                <div className="px-3">
                  <Slider
                    value={filters.capacity}
                    onValueChange={(value) => updateFilter('capacity', value)}
                    max={1000}
                    min={1}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{filters.capacity[0]} pessoas</span>
                    <span>{filters.capacity[1]} pessoas</span>
                  </div>
                </div>
              </div>
            )}

            {searchType === 'venues' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Comodidades</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenitiesList.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label htmlFor={amenity} className="text-sm cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}