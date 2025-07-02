import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card, Button, IconButton, Surface, ActivityIndicator, Chip } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { mobileApi } from '../../utils/api';

interface CartItem {
  id: string;
  serviceId: number;
  serviceName: string;
  providerName: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
  duration?: string;
  eventDate?: string;
}

const CartScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart-items', user?.id],
    queryFn: async () => {
      return await mobileApi.getCartItems();
    },
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return await mobileApi.addToCart(parseInt(itemId), quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // Implementar removeFromCart na API
      return await mobileApi.addToCart(parseInt(itemId), 0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
  });

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total: number, item: CartItem) => 
      total + (item.price * item.quantity), 0
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      Alert.alert(
        'Remover Item',
        'Deseja remover este item do carrinho?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Remover', 
            style: 'destructive',
            onPress: () => removeItemMutation.mutate(itemId)
          }
        ]
      );
      return;
    }
    
    updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Carrinho Vazio', 'Adicione itens ao carrinho antes de finalizar a compra.');
      return;
    }

    navigation.navigate('Checkout', {
      items: cartItems,
      total: calculateTotal(),
    });
  };

  const handleContinueShopping = () => {
    navigation.navigate('Services');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Text style={styles.loadingText}>Carregando carrinho...</Text>
      </View>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptySubtitle}>
          Explore nossos serviços e adicione itens ao seu carrinho
        </Text>
        <Button
          mode="contained"
          onPress={handleContinueShopping}
          style={styles.continueButton}
        >
          Explorar Serviços
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu Carrinho</Text>
          <Text style={styles.itemCount}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
          </Text>
        </View>

        <View style={styles.itemsContainer}>
          {cartItems.map((item: CartItem) => (
            <Card key={item.id} style={styles.itemCard}>
              <Card.Content>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.serviceName}>{item.serviceName}</Text>
                    <Text style={styles.providerName}>por {item.providerName}</Text>
                    <Chip 
                      style={styles.categoryChip}
                      textStyle={styles.categoryText}
                    >
                      {item.category}
                    </Chip>
                  </View>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => removeItemMutation.mutate(item.id)}
                  />
                </View>

                {item.description && (
                  <Text style={styles.description}>{item.description}</Text>
                )}

                {item.duration && (
                  <Text style={styles.duration}>Duração: {item.duration}</Text>
                )}

                {item.eventDate && (
                  <Text style={styles.eventDate}>Data: {item.eventDate}</Text>
                )}

                <View style={styles.priceContainer}>
                  <View style={styles.quantityContainer}>
                    <IconButton
                      icon="minus"
                      size={20}
                      mode="outlined"
                      onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updateQuantityMutation.isPending}
                    />
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <IconButton
                      icon="plus"
                      size={20}
                      mode="outlined"
                      onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updateQuantityMutation.isPending}
                    />
                  </View>
                  <View style={styles.priceInfo}>
                    <Text style={styles.unitPrice}>
                      {formatCurrency(item.price)} cada
                    </Text>
                    <Text style={styles.totalPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(calculateTotal())}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de serviço:</Text>
              <Text style={styles.summaryValue}>Grátis</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Surface style={styles.checkoutContainer}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutTotal}>{formatCurrency(calculateTotal())}</Text>
          <Text style={styles.checkoutItems}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleCheckout}
          style={styles.checkoutButton}
          loading={isCheckingOut}
          disabled={cartItems.length === 0}
        >
          Finalizar Compra
        </Button>
      </Surface>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8F9FA',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemCount: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  itemsContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F3FF',
  },
  categoryText: {
    color: '#3C5BFA',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  duration: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C5BFA',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3C5BFA',
  },
  checkoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 8,
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C5BFA',
  },
  checkoutItems: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkoutButton: {
    marginLeft: 16,
    paddingHorizontal: 24,
  },
});

export default CartScreen;