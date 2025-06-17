import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  ActivityIndicator,
  Switch,
  Chip,
} from 'react-native-paper';
import { mobileApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const serviceCategories = [
  'Entretenimento',
  'Alimentação', 
  'Organização',
  'Produção',
  'Limpeza'
];

export default function CreateEventScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    budget: '',
    category: 'Entretenimento',
    guestCount: '',
    requirements: '',
    isPrivate: false,
  });

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.description || !formData.date || !formData.budget) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        budget: parseFloat(formData.budget.replace(/[^\d,]/g, '').replace(',', '.')),
        guestCount: parseInt(formData.guestCount) || 0,
        organizerId: user?.id,
        status: 'active',
      };

      await mobileApi.createEvent(eventData);
      Alert.alert('Sucesso', 'Evento criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleCepLookup = async () => {
    if (formData.cep.length === 8) {
      try {
        const response = await mobileApi.searchAddress(formData.cep);
        if (response && !response.erro) {
          setFormData(prev => ({
            ...prev,
            rua: response.logradouro || '',
            bairro: response.bairro || '',
            cidade: response.localidade || '',
            estado: response.uf || '',
          }));
        }
      } catch (error) {
        console.error('CEP lookup error:', error);
      }
    }
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(number) / 100);
    return formatted;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Informações Básicas</Title>
            
            <TextInput
              label="Título do Evento *"
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Descrição *"
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Data do Evento *"
              value={formData.date}
              onChangeText={(text) => setFormData({...formData, date: text})}
              placeholder="DD/MM/AAAA"
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Número de Convidados"
              value={formData.guestCount}
              onChangeText={(text) => setFormData({...formData, guestCount: text})}
              keyboardType="numeric"
              style={styles.input}
              disabled={loading}
            />

            <View style={styles.categoryContainer}>
              <Title style={styles.categoryTitle}>Categoria Principal</Title>
              <View style={styles.categoryChips}>
                {serviceCategories.map((category) => (
                  <Chip
                    key={category}
                    selected={formData.category === category}
                    onPress={() => setFormData({...formData, category})}
                    style={styles.categoryChip}
                  >
                    {category}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Localização</Title>
            
            <TextInput
              label="CEP"
              value={formData.cep}
              onChangeText={(text) => setFormData({...formData, cep: text})}
              onBlur={handleCepLookup}
              keyboardType="numeric"
              maxLength={8}
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Rua"
              value={formData.rua}
              onChangeText={(text) => setFormData({...formData, rua: text})}
              style={styles.input}
              disabled={loading}
            />

            <View style={styles.row}>
              <TextInput
                label="Número"
                value={formData.numero}
                onChangeText={(text) => setFormData({...formData, numero: text})}
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
              <TextInput
                label="Bairro"
                value={formData.bairro}
                onChangeText={(text) => setFormData({...formData, bairro: text})}
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Cidade"
                value={formData.cidade}
                onChangeText={(text) => setFormData({...formData, cidade: text})}
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
              <TextInput
                label="Estado"
                value={formData.estado}
                onChangeText={(text) => setFormData({...formData, estado: text})}
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Orçamento e Requisitos</Title>
            
            <TextInput
              label="Orçamento Total *"
              value={formData.budget}
              onChangeText={(text) => setFormData({...formData, budget: formatCurrency(text)})}
              keyboardType="numeric"
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Requisitos Especiais"
              value={formData.requirements}
              onChangeText={(text) => setFormData({...formData, requirements: text})}
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={loading}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Title style={styles.switchLabel}>Evento Privado</Title>
                <TextInput.helpers style={styles.switchDescription}>
                  Apenas prestadores convidados podem se candidatar
                </TextInput.helpers>
              </View>
              <Switch
                value={formData.isPrivate}
                onValueChange={(value) => setFormData({...formData, isPrivate: value})}
                disabled={loading}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleCreateEvent}
            style={styles.createButton}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : 'Criar Evento'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchDescription: {
    color: '#666',
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  createButton: {
    paddingVertical: 8,
    backgroundColor: '#3C5BFA',
  },
});