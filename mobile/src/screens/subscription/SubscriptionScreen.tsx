import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  stripePriceId: string;
  userType: string;
}

const SubscriptionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans', user?.userType],
    queryFn: async () => {
      const response = await api.get('/api/subscription/plans');
      return response.data.filter((plan: Plan) => 
        plan.userType === user?.userType || plan.userType === 'all'
      );
    },
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      const response = await api.get('/api/subscription/current');
      return response.data;
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await api.post('/api/subscription/create-checkout', {
        priceId: planId,
        successUrl: 'evento://subscription/success',
        cancelUrl: 'evento://subscription/cancel',
      });
      return response.data;
    },
    onSuccess: (data) => {
      navigation.navigate('PaymentWebView', { 
        url: data.url,
        title: 'Finalizar Assinatura'
      });
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível iniciar o pagamento');
    },
  });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'usd' ? 'BRL' : currency,
    }).format(price / 100);
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('premium')) return '#FFD700';
    if (planName.toLowerCase().includes('profissional')) return '#3C5BFA';
    return '#6B7280';
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.stripePriceId === planId;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Text style={styles.loadingText}>Carregando planos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escolha seu Plano</Text>
        <Text style={styles.subtitle}>
          Desbloqueie todo o potencial do Evento+
        </Text>
      </View>

      {currentSubscription && (
        <Card style={styles.currentPlanCard}>
          <Card.Content>
            <Text style={styles.currentPlanTitle}>Plano Atual</Text>
            <Text style={styles.currentPlanName}>
              {currentSubscription.planName}
            </Text>
            <Text style={styles.currentPlanStatus}>
              Status: {currentSubscription.status === 'active' ? 'Ativo' : 'Inativo'}
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.plansContainer}>
        {plans?.map((plan: Plan) => (
          <Card 
            key={plan.id} 
            style={[
              styles.planCard,
              selectedPlan === plan.stripePriceId && styles.selectedPlan,
              isCurrentPlan(plan.stripePriceId) && styles.currentPlan
            ]}
          >
            <TouchableOpacity
              onPress={() => setSelectedPlan(plan.stripePriceId)}
              disabled={isCurrentPlan(plan.stripePriceId)}
            >
              <Card.Content>
                <View style={styles.planHeader}>
                  <View 
                    style={[
                      styles.planBadge, 
                      { backgroundColor: getPlanColor(plan.name) }
                    ]}
                  >
                    <Text style={styles.planBadgeText}>{plan.name}</Text>
                  </View>
                  {isCurrentPlan(plan.stripePriceId) && (
                    <Text style={styles.currentBadge}>ATUAL</Text>
                  )}
                </View>

                <Text style={styles.planPrice}>
                  {formatPrice(plan.price, plan.currency)}
                  <Text style={styles.planInterval}>/{plan.interval}</Text>
                </Text>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureCheck}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {!isCurrentPlan(plan.stripePriceId) && (
                  <Button
                    mode={selectedPlan === plan.stripePriceId ? "contained" : "outlined"}
                    onPress={() => {
                      if (plan.price === 0) {
                        // Plano grátis - ativar direto
                        Alert.alert('Plano Grátis', 'Você já tem acesso ao plano grátis!');
                      } else {
                        navigation.navigate('PIXPayment', { 
                          plan,
                          amount: plan.price / 100
                        });
                      }
                    }}
                    style={styles.selectButton}
                  >
                    {plan.price === 0 ? 'Plano Atual' : 'Assinar com PIX'}
                  </Button>
                )}
              </Card.Content>
            </TouchableOpacity>
          </Card>
        ))}
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>Informações Importantes</Text>
          <Text style={styles.infoText}>
            • Cancelamento a qualquer momento{'\n'}
            • Pagamento seguro via PIX{'\n'}
            • Suporte técnico incluído{'\n'}
            • Atualizações automáticas
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  currentPlanCard: {
    margin: 16,
    backgroundColor: '#E7F3FF',
    borderColor: '#3C5BFA',
    borderWidth: 1,
  },
  currentPlanTitle: {
    fontSize: 14,
    color: '#3C5BFA',
    fontWeight: '600',
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  currentPlanStatus: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 4,
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  selectedPlan: {
    borderColor: '#3C5BFA',
    borderWidth: 2,
  },
  currentPlan: {
    backgroundColor: '#F0F9FF',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  currentBadge: {
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  planInterval: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'normal',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    color: '#10B981',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  selectButton: {
    marginTop: 8,
  },
  infoCard: {
    margin: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default SubscriptionScreen;