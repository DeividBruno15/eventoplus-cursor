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
  Chip,
  Paragraph,
} from 'react-native-paper';
import { mobileApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const venueTypes = [
  'Salão de festas',
  'Casa de eventos',
  'Chácara',
  'Sítio',
  'Hotel/Pousada',
  'Restaurante',
  'Buffet',
  'Centro de convenções',
  'Espaço ao ar livre',
  'Outros'
];

const amenitiesList = [
  'Estacionamento',
  'Ar condicionado',
  'Som/Iluminação',
  'Cozinha equipada',
  'Banheiros',
  'Área externa',
  'Piscina',
  'Churrasqueira',
  'Playground',
  'Jardim',
  'Sala de apoio',
  'Decoração inclusa'
];

export default function CreateVenueScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venueType: 'Salão de festas',
    capacity: '',
    price: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    rules: '',
    additionalInfo: '',
  });

  const handleCreateVenue = async () => {
    if (!formData.name || !formData.description || !formData.capacity || !formData.price) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const venueData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price.replace(/[^\d,]/g, '').replace(',', '.')),
        location: `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade}/${formData.estado}`,
        amenities: selectedAmenities,
        ownerId: user?.id,
      };

      await mobileApi.createVenue(venueData);
      Alert.alert('Sucesso', 'Espaço cadastrado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar espaço');
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

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
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
              label="Nome do Espaço *"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
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

            <View style={styles.typeContainer}>
              <Title style={styles.typeTitle}>Tipo de Espaço</Title>
              <View style={styles.typeChips}>
                {venueTypes.map((type) => (
                  <Chip
                    key={type}
                    selected={formData.venueType === type}
                    onPress={() => setFormData({...formData, venueType: type})}
                    style={styles.typeChip}
                  >
                    {type}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <TextInput
                label="Capacidade (pessoas) *"
                value={formData.capacity}
                onChangeText={(text) => setFormData({...formData, capacity: text})}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
              <TextInput
                label="Preço por Evento *"
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: formatCurrency(text)})}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
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
            <Title style={styles.sectionTitle}>Comodidades</Title>
            <Paragraph style={styles.amenitiesDescription}>
              Selecione as comodidades disponíveis no seu espaço:
            </Paragraph>
            
            <View style={styles.amenitiesContainer}>
              {amenitiesList.map((amenity) => (
                <Chip
                  key={amenity}
                  selected={selectedAmenities.includes(amenity)}
                  onPress={() => toggleAmenity(amenity)}
                  style={styles.amenityChip}
                >
                  {amenity}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Informações Adicionais</Title>
            
            <TextInput
              label="Regras e Restrições"
              value={formData.rules}
              onChangeText={(text) => setFormData({...formData, rules: text})}
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Informações Extras"
              value={formData.additionalInfo}
              onChangeText={(text) => setFormData({...formData, additionalInfo: text})}
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={loading}
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleCreateVenue}
            style={styles.createButton}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : 'Cadastrar Espaço'}
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
  typeContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  amenitiesDescription: {
    color: '#666',
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityChip: {
    marginRight: 8,
    marginBottom: 8,
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