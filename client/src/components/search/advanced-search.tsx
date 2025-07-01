import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  X, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star,
  Users,
  Clock,
  Filter,
  TrendingUp
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { apiRequest } from "@/lib/queryClient";

interface SearchSuggestion {
  id: string;
  type: 'event' | 'service' | 'venue' | 'location' | 'category';
  text: string;
  subtitle?: string;
  count?: number;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: any) => void;
  placeholder?: string;
  className?: string;
}

export default function AdvancedSearch({ onSearch, placeholder = "Buscar eventos, serviços, locais...", className = "" }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Buscar sugestões da API
  const { data: suggestions = [], isLoading } = useQuery<SearchSuggestion[]>({
    queryKey: ["/api/search/suggestions", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      
      // Mock data para demonstração - em produção viria da API
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: "1",
          type: "event",
          text: "Festa de casamento",
          subtitle: "142 eventos encontrados",
          count: 142
        },
        {
          id: "2", 
          type: "service",
          text: "Fotógrafo profissional",
          subtitle: "89 prestadores disponíveis",
          count: 89
        },
        {
          id: "3",
          type: "venue",
          text: "Salão de festas São Paulo",
          subtitle: "56 espaços disponíveis", 
          count: 56
        },
        {
          id: "4",
          type: "location",
          text: "São Paulo, SP",
          subtitle: "Capital"
        },
        {
          id: "5",
          type: "category",
          text: "Decoração",
          subtitle: "Categoria de serviço"
        }
      ];
      
      return mockSuggestions.filter(s => 
        s.text.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    },
    enabled: debouncedQuery.length >= 2
  });

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Salvar busca recente
  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Executar busca
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      onSearch(searchQuery.trim(), {});
      setIsOpen(false);
    }
  };

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = (suggestions.length > 0 ? suggestions.length : recentSearches.length);
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => prev < totalItems - 1 ? prev + 1 : prev);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const item = suggestions.length > 0 ? suggestions[selectedIndex] : recentSearches[selectedIndex];
          const searchText = typeof item === 'string' ? item : item.text;
          handleSearch(searchText);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'service':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'venue':
        return <MapPin className="h-4 w-4 text-purple-500" />;
      case 'location':
        return <MapPin className="h-4 w-4 text-orange-500" />;
      case 'category':
        return <Filter className="h-4 w-4 text-gray-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* Input de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 text-base border-2 focus:border-[#3C5BFA] transition-colors"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown com sugestões */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden shadow-lg border-2">
          <CardContent className="p-0">
            {/* Loading state */}
            {isLoading && query.length >= 2 && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3C5BFA] mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Buscando...</p>
              </div>
            )}

            {/* Sugestões */}
            {suggestions.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Sugestões
                  </p>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedIndex === index ? 'bg-[#3C5BFA] text-white' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSearch(suggestion.text)}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        selectedIndex === index ? 'text-white' : 'text-gray-900'
                      }`}>
                        {suggestion.text}
                      </p>
                      {suggestion.subtitle && (
                        <p className={`text-sm truncate ${
                          selectedIndex === index ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {suggestion.subtitle}
                        </p>
                      )}
                    </div>
                    {suggestion.count && (
                      <Badge 
                        variant={selectedIndex === index ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {suggestion.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Buscas recentes */}
            {suggestions.length === 0 && recentSearches.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Buscas Recentes
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("recentSearches");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 p-1 h-auto"
                  >
                    Limpar
                  </Button>
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedIndex === index ? 'bg-[#3C5BFA] text-white' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSearch(search)}
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className={`flex-1 truncate ${
                      selectedIndex === index ? 'text-white' : 'text-gray-900'
                    }`}>
                      {search}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Estado vazio */}
            {suggestions.length === 0 && recentSearches.length === 0 && query.length >= 2 && !isLoading && (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum resultado encontrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tente termos diferentes ou busque por categorias
                </p>
              </div>
            )}

            {/* Dica de uso */}
            {suggestions.length === 0 && recentSearches.length === 0 && query.length < 2 && (
              <div className="p-6 text-center">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-600">Eventos</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-600">Prestadores</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Digite pelo menos 2 caracteres para ver sugestões
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overlay para fechar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}