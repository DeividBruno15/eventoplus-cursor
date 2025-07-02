import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Share,
  Clipboard,
  Dimensions,
} from 'react-native';
import { Card, Button, ActivityIndicator, Surface } from 'react-native-paper';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { mobileApi } from '../../utils/api';

const { width } = Dimensions.get('window');

const PIXPaymentScreen = ({ route, navigation }: any) => {
  const { plan, amount } = route.params;
  const { user } = useAuth();
  const [pixCode, setPixCode] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'paid' | 'expired'>('pending');

  // Gerar PIX
  const generatePIXMutation = useMutation({
    mutationFn: async () => {
      const response = await mobileApi.generatePIX(
        amount,
        `Assinatura ${plan.name} - Evento+`,
        plan.id
      );
      return response;
    },
    onSuccess: (data) => {
      setPixCode(data.pixCode);
      setTransactionId(data.transactionId);
      setPaymentStatus('pending');
    },
    onError: (error) => {
      Alert.alert('Erro', 'Não foi possível gerar o código PIX');
    },
  });

  // Verificar status do pagamento
  const { data: paymentStatusData } = useQuery({
    queryKey: ['pix-status', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const response = await mobileApi.checkPIXStatus(transactionId);
      return response;
    },
    enabled: !!transactionId,
    refetchInterval: 3000, // Verificar a cada 3 segundos
  });

  useEffect(() => {
    if (paymentStatusData?.status) {
      setPaymentStatus(paymentStatusData.status);
      
      if (paymentStatusData.status === 'paid') {
        Alert.alert(
          'Pagamento Confirmado!',
          'Sua assinatura foi ativada com sucesso.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      }
    }
  }, [paymentStatusData]);

  useEffect(() => {
    generatePIXMutation.mutate();
  }, []);

  const copyPIXCode = async () => {
    try {
      await Clipboard.setString(pixCode);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível copiar o código');
    }
  };

  const sharePIXCode = async () => {
    try {
      await Share.share({
        message: `Código PIX para pagamento: ${pixCode}`,
        title: 'Código PIX - Evento+',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'paid': return '#10B981';
      case 'processing': return '#F59E0B';
      case 'expired': return '#EF4444';
      default: return '#3C5BFA';
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'paid': return 'Pagamento Confirmado';
      case 'processing': return 'Processando Pagamento';
      case 'expired': return 'PIX Expirado';
      default: return 'Aguardando Pagamento';
    }
  };

  if (generatePIXMutation.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Text style={styles.loadingText}>Gerando código PIX...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
          <Surface style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </Surface>
        </Card.Content>
      </Card>

      {pixCode && (
        <Card style={styles.qrCard}>
          <Card.Content style={styles.qrContent}>
            <Text style={styles.qrTitle}>Escaneie o QR Code</Text>
            
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>📱</Text>
                <Text style={styles.qrPlaceholderSubtext}>QR Code PIX</Text>
                <Text style={styles.qrPlaceholderNote}>
                  Use o código abaixo no seu app bancário
                </Text>
              </View>
            </View>

            <Text style={styles.instructions}>
              1. Abra o app do seu banco{'\n'}
              2. Escolha a opção PIX{'\n'}
              3. Escaneie o código acima{'\n'}
              4. Confirme o pagamento
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.codeCard}>
        <Card.Content>
          <Text style={styles.codeTitle}>Ou copie o código PIX</Text>
          <Surface style={styles.codeContainer}>
            <Text style={styles.pixCodeText} numberOfLines={3}>
              {pixCode}
            </Text>
          </Surface>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={copyPIXCode}
              style={styles.copyButton}
              icon="content-copy"
            >
              Copiar Código
            </Button>
            
            <Button
              mode="outlined"
              onPress={sharePIXCode}
              style={styles.shareButton}
              icon="share"
            >
              Compartilhar
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>Informações do Pagamento</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plano:</Text>
            <Text style={styles.infoValue}>{plan.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor:</Text>
            <Text style={styles.infoValue}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          
          {transactionId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID Transação:</Text>
              <Text style={styles.infoValue}>{transactionId.slice(0, 16)}...</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.bottomContainer}>
        <Text style={styles.securityText}>
          🔒 Pagamento 100% seguro via PIX
        </Text>
        
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancelar Pagamento
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
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
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3C5BFA',
    textAlign: 'center',
    marginVertical: 8,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qrCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  qrContent: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  qrPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  qrPlaceholderSubtext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  qrPlaceholderNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  codeCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  pixCodeText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  copyButton: {
    flex: 1,
  },
  shareButton: {
    flex: 1,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  bottomContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  securityText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 16,
  },
  cancelButton: {
    marginBottom: 16,
  },
});

export default PIXPaymentScreen;