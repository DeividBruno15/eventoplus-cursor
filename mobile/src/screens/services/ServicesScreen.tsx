import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Searchbar,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { mobileApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ServicesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await mobileApi.getServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const filteredServices = services.filter((service: any) =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Entretenimento': '#FF6B6B',
      'Alimentação': '#4ECDC4',
      'Organização': '#45B7D1',
      'Produção': '#96CEB4',
      'Limpeza': '#FECA57',
    };
    return colors[category] || '#95A5A6';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Paragraph style={styles.loadingText}>Carregando serviços...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar serviços..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              {searchQuery ? 'Nenhum serviço encontrado' : 'Nenhum serviço disponível'}
            </Paragraph>
          </View>
        ) : (
          filteredServices.map((service: any) => (
            <Card key={service.id} style={styles.serviceCard}>
              <Card.Content>
                <View style={styles.serviceHeader}>
                  <Title style={styles.serviceTitle}>{service.title}</Title>
                  <Chip
                    style={[styles.categoryChip, { backgroundColor: getCategoryColor(service.category) }]}
                    textStyle={styles.categoryText}
                  >
                    {service.category}
                  </Chip>
                </View>

                <Paragraph style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Paragraph>

                <View style={styles.serviceDetails}>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Preço:</Paragraph>
                    <Paragraph style={styles.detailValue}>
                      {formatCurrency(service.basePrice)}
                    </Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Tipo:</Paragraph>
                    <Paragraph style={styles.detailValue}>{service.serviceType}</Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Prestador:</Paragraph>
                    <Paragraph style={styles.detailValue}>{service.providerName}</Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Avaliação:</Paragraph>
                    <View style={styles.ratingRow}>
                      <Paragraph style={styles.ratingText}>
                        ⭐ {service.rating || '5.0'}
                      </Paragraph>
                      <Paragraph style={styles.reviewCount}>
                        ({service.reviewCount || 0} avaliações)
                      </Paragraph>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('ServiceDetails', { serviceId: service.id })}
                    style={styles.actionButton}
                  >
                    Ver Detalhes
                  </Button>
                  
                  {user?.userType === 'contratante' && (
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('ContactProvider', { serviceId: service.id })}
                      style={styles.actionButton}
                    >
                      Contratar
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {user?.userType === 'prestador' && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('CreateService')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  serviceCard: {
    marginBottom: 16,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceTitle: {
    flex: 1,
    fontSize: 18,
    marginRight: 8,
  },
  categoryChip: {
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceDescription: {
    color: '#666',
    marginBottom: 12,
  },
  serviceDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingText: {
    color: '#FFA94D',
    fontWeight: 'bold',
    marginRight: 8,
  },
  reviewCount: {
    color: '#666',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3C5BFA',
  },
});