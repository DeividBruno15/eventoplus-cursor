import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Button, IconButton, Surface, ActivityIndicator, Badge, Chip } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { mobileApi } from '../../utils/api';

interface Notification {
  id: string;
  type: 'event' | 'message' | 'payment' | 'application' | 'review' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id, filter],
    queryFn: async () => {
      return await mobileApi.getNotifications();
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await mobileApi.markNotificationRead(parseInt(notificationId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // Implementar markAllAsRead na API
      const unreadNotifications = notifications?.filter((n: Notification) => !n.read) || [];
      for (const notification of unreadNotifications) {
        await mobileApi.markNotificationRead(parseInt(notification.id));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getFilteredNotifications = () => {
    if (!notifications) return [];
    
    switch (filter) {
      case 'unread':
        return notifications.filter((n: Notification) => !n.read);
      case 'read':
        return notifications.filter((n: Notification) => n.read);
      default:
        return notifications;
    }
  };

  const getUnreadCount = () => {
    if (!notifications) return 0;
    return notifications.filter((n: Notification) => !n.read).length;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event': return '📅';
      case 'message': return '💬';
      case 'payment': return '💳';
      case 'application': return '📋';
      case 'review': return '⭐';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3C5BFA';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const handleNotificationPress = (notification: Notification) => {
    // Marcar como lida se não estiver
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navegar baseado no tipo de notificação
    switch (notification.type) {
      case 'event':
        navigation.navigate('Events');
        break;
      case 'message':
        navigation.navigate('Chat');
        break;
      case 'payment':
        navigation.navigate('Subscription');
        break;
      case 'application':
        navigation.navigate('Events');
        break;
      default:
        // Mostrar detalhes da notificação
        Alert.alert(notification.title, notification.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Marcar todas como lidas',
      'Deseja marcar todas as notificações como lidas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => markAllAsReadMutation.mutate()
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Text style={styles.loadingText}>Carregando notificações...</Text>
      </View>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Notificações</Text>
          {getUnreadCount() > 0 && (
            <Badge style={styles.unreadBadge}>{getUnreadCount()}</Badge>
          )}
        </View>
        
        {getUnreadCount() > 0 && (
          <Button
            mode="text"
            onPress={handleMarkAllAsRead}
            loading={markAllAsReadMutation.isPending}
            compact
          >
            Marcar todas como lidas
          </Button>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Todas', count: notifications?.length || 0 },
            { key: 'unread', label: 'Não lidas', count: getUnreadCount() },
            { key: 'read', label: 'Lidas', count: (notifications?.length || 0) - getUnreadCount() },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              onPress={() => setFilter(filterOption.key as any)}
              style={[
                styles.filterChip,
                filter === filterOption.key && styles.activeFilterChip
              ]}
            >
              <Text style={[
                styles.filterText,
                filter === filterOption.key && styles.activeFilterText
              ]}>
                {filterOption.label} ({filterOption.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {filter === 'unread' ? '✅' : '🔔'}
            </Text>
            <Text style={styles.emptyTitle}>
              {filter === 'unread' 
                ? 'Tudo em dia!' 
                : 'Nenhuma notificação'
              }
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread'
                ? 'Você não tem notificações não lidas'
                : 'Suas notificações aparecerão aqui'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {filteredNotifications.map((notification: Notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
              >
                <Card style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}>
                  <Card.Content>
                    <View style={styles.notificationHeader}>
                      <View style={styles.notificationMeta}>
                        <Text style={styles.notificationIcon}>
                          {getNotificationIcon(notification.type)}
                        </Text>
                        <View style={styles.notificationInfo}>
                          <Text style={[
                            styles.notificationTitle,
                            !notification.read && styles.unreadTitle
                          ]}>
                            {notification.title}
                          </Text>
                          <Text style={styles.notificationTime}>
                            {formatTimeAgo(notification.createdAt)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.notificationStatus}>
                        <View 
                          style={[
                            styles.priorityDot,
                            { backgroundColor: getPriorityColor(notification.priority) }
                          ]}
                        />
                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                      </View>
                    </View>

                    <Text style={[
                      styles.notificationMessage,
                      !notification.read && styles.unreadMessage
                    ]}>
                      {notification.message}
                    </Text>

                    {notification.type && (
                      <Chip 
                        style={styles.typeChip}
                        textStyle={styles.typeText}
                        compact
                      >
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </Chip>
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeFilterChip: {
    backgroundColor: '#3C5BFA',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  notificationsContainer: {
    padding: 16,
  },
  notificationCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3C5BFA',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3C5BFA',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  unreadMessage: {
    color: '#1F2937',
  },
  typeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F3FF',
  },
  typeText: {
    color: '#3C5BFA',
    fontSize: 11,
  },
});

export default NotificationsScreen;