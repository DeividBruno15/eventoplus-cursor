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

export default function EventsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await mobileApi.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const filteredEvents = events.filter((event: any) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'closed': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'closed': return 'Fechado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Paragraph style={styles.loadingText}>Carregando eventos...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar eventos..."
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
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>
              {searchQuery ? 'Nenhum evento encontrado' : 'Nenhum evento disponível'}
            </Paragraph>
          </View>
        ) : (
          filteredEvents.map((event: any) => (
            <Card key={event.id} style={styles.eventCard}>
              <Card.Content>
                <View style={styles.eventHeader}>
                  <Title style={styles.eventTitle}>{event.title}</Title>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
                    textStyle={styles.statusText}
                  >
                    {getStatusText(event.status)}
                  </Chip>
                </View>

                <Paragraph style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Paragraph>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Data:</Paragraph>
                    <Paragraph style={styles.detailValue}>
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Local:</Paragraph>
                    <Paragraph style={styles.detailValue} numberOfLines={1}>
                      {event.location}
                    </Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Orçamento:</Paragraph>
                    <Paragraph style={styles.detailValue}>
                      {formatCurrency(event.budget)}
                    </Paragraph>
                  </View>

                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Categoria:</Paragraph>
                    <Paragraph style={styles.detailValue}>{event.category}</Paragraph>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
                    style={styles.actionButton}
                  >
                    Ver Detalhes
                  </Button>
                  
                  {user?.userType === 'prestador' && event.status === 'active' && (
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('ApplyToEvent', { eventId: event.id })}
                      style={styles.actionButton}
                    >
                      Candidatar-se
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {user?.userType === 'contratante' && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('CreateEvent')}
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
  eventCard: {
    marginBottom: 16,
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    marginRight: 8,
  },
  statusChip: {
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDescription: {
    color: '#666',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
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