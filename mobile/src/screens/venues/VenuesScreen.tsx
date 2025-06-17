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

export default function VenuesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await mobileApi.getVenues();
      setVenues(data);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVenues();
  };

  const filteredVenues = venues.filter((venue: any) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Paragraph style={styles.loadingText}>Carregando espaços...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar espaços..."
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
        {filteredVenues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              {searchQuery ? 'Nenhum espaço encontrado' : 'Nenhum espaço disponível'}
            </Paragraph>
          </View>
        ) : (
          filteredVenues.map((venue: any) => (
            <Card key={venue.id} style={styles.venueCard}>
              <Card.Content>
                <View style={styles.venueHeader}>
                  <Title style={styles.venueTitle}>{venue.name}</Title>
                  <Chip style={styles.capacityChip}>
                    {venue.capacity} pessoas
                  </Chip>
                </View>

                <Paragraph style={styles.venueDescription} numberOfLines={2}>
                  {venue.description}
                </Paragraph>

                <View style={styles.venueDetails}>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Local:</Paragraph>
                    <Paragraph style={styles.detailValue} numberOfLines={1}>
                      {venue.location}
                    </Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Preço:</Paragraph>
                    <Paragraph style={styles.detailValue}>
                      {formatCurrency(venue.price)}
                    </Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Tipo:</Paragraph>
                    <Paragraph style={styles.detailValue}>{venue.venueType}</Paragraph>
                  </View>
                </View>

                <View style={styles.amenitiesContainer}>
                  <Paragraph style={styles.amenitiesLabel}>Comodidades:</Paragraph>
                  <View style={styles.amenitiesRow}>
                    {venue.amenities?.slice(0, 3).map((amenity: string, index: number) => (
                      <Chip key={index} style={styles.amenityChip} compact>
                        {amenity}
                      </Chip>
                    ))}
                    {venue.amenities?.length > 3 && (
                      <Chip style={styles.amenityChip} compact>
                        +{venue.amenities.length - 3}
                      </Chip>
                    )}
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('VenueDetails', { venueId: venue.id })}
                    style={styles.actionButton}
                  >
                    Ver Detalhes
                  </Button>
                  
                  {user?.userType === 'contratante' && (
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('BookVenue', { venueId: venue.id })}
                      style={styles.actionButton}
                    >
                      Reservar
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {user?.userType === 'anunciante' && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('CreateVenue')}
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
  venueCard: {
    marginBottom: 16,
    elevation: 4,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  venueTitle: {
    flex: 1,
    fontSize: 18,
    marginRight: 8,
  },
  capacityChip: {
    backgroundColor: '#FFA94D',
  },
  venueDescription: {
    color: '#666',
    marginBottom: 12,
  },
  venueDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    width: 60,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#666',
  },
  amenitiesContainer: {
    marginBottom: 16,
  },
  amenitiesLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#E3F2FD',
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