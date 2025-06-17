import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();

  const renderContratanteDashboard = () => (
    <ScrollView style={styles.container}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Bem-vindo, {user?.firstName || user?.username}!</Title>
          <Paragraph>Gerencie seus eventos e contrate serviços incríveis</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>5</Title>
            <Paragraph>Eventos Ativos</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>12</Title>
            <Paragraph>Serviços Contratados</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Title>Ações Rápidas</Title>
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              Criar Evento
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Events')}
            >
              Ver Eventos
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.recentCard}>
        <Card.Content>
          <Title>Eventos Recentes</Title>
          <View style={styles.eventItem}>
            <Avatar.Icon size={40} icon="event" />
            <View style={styles.eventInfo}>
              <Paragraph style={styles.eventTitle}>Casamento Sarah & João</Paragraph>
              <Paragraph style={styles.eventDate}>25 de Janeiro, 2025</Paragraph>
            </View>
            <Chip>Confirmado</Chip>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderPrestadorDashboard = () => (
    <ScrollView style={styles.container}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Olá, {user?.firstName || user?.username}!</Title>
          <Paragraph>Encontre oportunidades e gerencie seus serviços</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>8</Title>
            <Paragraph>Propostas Enviadas</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>3</Title>
            <Paragraph>Contratos Ativos</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Title>Ações Rápidas</Title>
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Services')}
            >
              Meus Serviços
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Events')}
            >
              Buscar Eventos
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderAnuncianteDashboard = () => (
    <ScrollView style={styles.container}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Seja bem-vindo, {user?.firstName || user?.username}!</Title>
          <Paragraph>Gerencie seus espaços e maximize suas reservas</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>4</Title>
            <Paragraph>Espaços Ativos</Paragraph>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Title style={styles.statNumber}>15</Title>
            <Paragraph>Reservas Este Mês</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.actionCard}>
        <Card.Content>
          <Title>Ações Rápidas</Title>
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreateVenue')}
            >
              Anunciar Espaço
            </Button>
            <Button
              mode="outlined"
              style={styles.actionButton}
              onPress={() => navigation.navigate('Venues')}
            >
              Meus Espaços
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderDashboard = () => {
    switch (user?.userType) {
      case 'contratante':
        return renderContratanteDashboard();
      case 'prestador':
        return renderPrestadorDashboard();
      case 'anunciante':
        return renderAnuncianteDashboard();
      default:
        return renderContratanteDashboard();
    }
  };

  return renderDashboard();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3C5BFA',
  },
  actionCard: {
    marginBottom: 16,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  recentCard: {
    marginBottom: 16,
    elevation: 4,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontWeight: 'bold',
  },
  eventDate: {
    color: '#666',
    fontSize: 12,
  },
});