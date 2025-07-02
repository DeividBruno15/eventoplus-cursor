import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { 
  Searchbar, 
  Card, 
  Chip, 
  ActivityIndicator,
  Surface,
  IconButton,
  Button 
} from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { mobileApi } from '../../utils/api';

interface SearchResult {
  id: string;
  type: 'event' | 'service' | 'venue' | 'provider';
  title: string;
  description: string;
  location?: string;
  price?: number;
  category?: string;
  image?: string;
  rating?: number;
  providerName?: string;
}

interface SearchFilters {
  category: string[];
  priceRange: { min: number; max: number };
  location: string;
  rating: number;
  availability: string;
}

const SearchScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    category: [],
    priceRange: { min: 0, max: 10000 },
    location: '',
    rating: 0,
    availability: 'all',
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Categorias disponíveis
  const categories = [
    'Entretenimento',
    'Alimentação', 
    'Organização',
    'Produção',
    'Limpeza',
    'Fotografia',
    'Decoração',
    'Segurança',
  ];

  // Busca principal com debounce
  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['search', searchQuery, activeFilters],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      // Simulação de busca - implementar com API real
      return await mobileApi.globalSearch({
        query: searchQuery,
        filters: activeFilters,
        userType: user?.userType,
      });
    },
    enabled: searchQuery.length > 2,
  });

  const { data: trendingSearches } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: async () => {
      // Buscas populares
      return [
        'DJ para festa',
        'Buffet casamento',
        'Salão de festas',
        'Fotógrafo eventos',
        'Decoração aniversário',
      ];
    },
  });

  const { data: recentSearches } = useQuery({
    queryKey: ['recent-searches', user?.id],
    queryFn: async () => {
      return searchHistory.slice(0, 5);
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        refetch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory([query.trim(), ...searchHistory.slice(0, 4)]);
    }
  };

  const toggleCategory = (category: string) => {
    setActiveFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      category: [],
      priceRange: { min: 0, max: 10000 },
      location: '',
      rating: 0,
      availability: 'all',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'event': return '📅';
      case 'service': return '🔧';
      case 'venue': return '🏢';
      case 'provider': return '👤';
      default: return '🔍';
    }
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'event':
        navigation.navigate('Events');
        break;
      case 'service':
        navigation.navigate('Services');
        break;
      case 'venue':
        navigation.navigate('Venues');
        break;
      default:
        navigation.navigate('Services');
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)}>
      <Card style={styles.resultCard}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>{getResultIcon(item.type)}</Text>
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.description}
              </Text>
              {item.providerName && (
                <Text style={styles.providerName}>por {item.providerName}</Text>
              )}
            </View>
            {item.price && (
              <Text style={styles.resultPrice}>{formatPrice(item.price)}</Text>
            )}
          </View>
          
          <View style={styles.resultMeta}>
            {item.category && (
              <Chip style={styles.categoryChip} compact>
                {item.category}
              </Chip>
            )}
            
            {item.location && (
              <Text style={styles.locationText}>📍 {item.location}</Text>
            )}
            
            {item.rating && (
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <Surface style={styles.searchHeader}>
        <Searchbar
          placeholder="Buscar eventos, serviços, espaços..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
          clearIcon="close"
        />
        
        <IconButton
          icon={showFilters ? "filter-remove" : "filter-variant"}
          mode={showFilters ? "contained" : "outlined"}
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
        />
      </Surface>

      {/* Filters */}
      {showFilters && (
        <Surface style={styles.filtersContainer}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filtros</Text>
            <Button mode="text" onPress={clearFilters} compact>
              Limpar
            </Button>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={activeFilters.category.includes(category)}
                onPress={() => toggleCategory(category)}
                style={styles.filterChip}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        </Surface>
      )}

      {/* Search Results or Suggestions */}
      <ScrollView style={styles.content}>
        {searchQuery.length < 3 ? (
          <View style={styles.suggestionsContainer}>
            {/* Trending Searches */}
            {trendingSearches && trendingSearches.length > 0 && (
              <View style={styles.suggestionSection}>
                <Text style={styles.sectionTitle}>🔥 Buscas Populares</Text>
                {trendingSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSearch(search)}
                  >
                    <Text style={styles.suggestionText}>{search}</Text>
                    <IconButton icon="trending-up" size={16} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent Searches */}
            {recentSearches && recentSearches.length > 0 && (
              <View style={styles.suggestionSection}>
                <Text style={styles.sectionTitle}>🕒 Buscas Recentes</Text>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSearch(search)}
                  >
                    <Text style={styles.suggestionText}>{search}</Text>
                    <IconButton icon="history" size={16} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Categories */}
            <View style={styles.suggestionSection}>
              <Text style={styles.sectionTitle}>📂 Categorias</Text>
              <View style={styles.categoriesGrid}>
                {categories.slice(0, 6).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryButton}
                    onPress={() => handleSearch(category)}
                  >
                    <Text style={styles.categoryButtonText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3C5BFA" />
                <Text style={styles.loadingText}>Buscando...</Text>
              </View>
            ) : searchResults && searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsHeader}>
                  {searchResults.length} resultados para "{searchQuery}"
                </Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsIcon}>🔍</Text>
                <Text style={styles.noResultsTitle}>
                  Nenhum resultado encontrado
                </Text>
                <Text style={styles.noResultsSubtitle}>
                  Tente outras palavras-chave ou ajuste os filtros
                </Text>
                <Button mode="outlined" onPress={clearFilters}>
                  Limpar Filtros
                </Button>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButton: {
    borderColor: '#3C5BFA',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterChip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  resultsContainer: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  resultCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3C5BFA',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: '#E7F3FF',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  noResultsContainer: {
    alignItems: 'center',
    marginTop: 64,
    paddingHorizontal: 32,
  },
  noResultsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});

export default SearchScreen;