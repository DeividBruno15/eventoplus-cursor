import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  RadioButton,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'contratante',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        userType: formData.userType as any,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    } catch (error) {
      Alert.alert('Erro', 'Falha no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Evento+</Text>
          <Text style={styles.subtitle}>Cadastre-se e comece agora</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Tipo de Usuário</Text>
            <RadioButton.Group
              onValueChange={(value) => setFormData({...formData, userType: value})}
              value={formData.userType}
            >
              <View style={styles.radioItem}>
                <RadioButton value="contratante" />
                <Text>Contratante (Organizo eventos)</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="prestador" />
                <Text>Prestador (Ofereço serviços)</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="anunciante" />
                <Text>Anunciante (Alugo espaços)</Text>
              </View>
            </RadioButton.Group>

            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            
            <View style={styles.row}>
              <TextInput
                label="Nome"
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
              <TextInput
                label="Sobrenome"
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
                style={[styles.input, styles.halfInput]}
                disabled={loading}
              />
            </View>

            <TextInput
              label="Nome de usuário *"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
              autoCapitalize="none"
              style={styles.input}
              disabled={loading}
            />
            
            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              disabled={loading}
            />
            
            <TextInput
              label="Senha *"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Confirmar senha *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry
              style={styles.input}
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : 'Cadastrar'}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
              disabled={loading}
            >
              Já tem conta? Faça login
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3C5BFA',
  },
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    elevation: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});