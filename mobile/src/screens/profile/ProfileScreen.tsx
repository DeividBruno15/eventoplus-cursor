import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Avatar,
  ActivityIndicator,
  Switch,
  Divider,
} from 'react-native-paper';
import { mobileApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
  });
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const updatedUser = await mobileApi.updateProfile(formData);
      updateUser(updatedUser);
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case 'contratante': return 'Contratante';
      case 'prestador': return 'Prestador de Serviços';
      case 'anunciante': return 'Anunciante de Espaços';
      default: return userType;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={user?.username?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Title style={styles.username}>{user?.username}</Title>
            <Paragraph style={styles.userType}>
              {getUserTypeDisplay(user?.userType || '')}
            </Paragraph>
            <Paragraph style={styles.email}>{user?.email}</Paragraph>
          </View>
        </Card.Content>
      </Card>

      {/* Personal Information */}
      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Informações Pessoais</Title>
            <Button
              mode="text"
              onPress={() => setEditing(!editing)}
              disabled={loading}
            >
              {editing ? 'Cancelar' : 'Editar'}
            </Button>
          </View>

          {editing ? (
            <>
              <TextInput
                label="Nome"
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
                style={styles.input}
                disabled={loading}
              />
              <TextInput
                label="Sobrenome"
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
                style={styles.input}
                disabled={loading}
              />
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                style={styles.input}
                disabled={loading}
              />
              <TextInput
                label="Nome de usuário"
                value={formData.username}
                onChangeText={(text) => setFormData({...formData, username: text})}
                style={styles.input}
                disabled={loading}
              />
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : 'Salvar'}
              </Button>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Paragraph style={styles.infoLabel}>Nome:</Paragraph>
                <Paragraph style={styles.infoValue}>
                  {formData.firstName} {formData.lastName}
                </Paragraph>
              </View>
              <View style={styles.infoRow}>
                <Paragraph style={styles.infoLabel}>Email:</Paragraph>
                <Paragraph style={styles.infoValue}>{formData.email}</Paragraph>
              </View>
              <View style={styles.infoRow}>
                <Paragraph style={styles.infoLabel}>Usuário:</Paragraph>
                <Paragraph style={styles.infoValue}>{formData.username}</Paragraph>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.section}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Configurações</Title>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Paragraph style={styles.settingLabel}>Notificações</Paragraph>
              <Paragraph style={styles.settingDescription}>
                Receber notificações de mensagens e atualizações
              </Paragraph>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Paragraph style={styles.settingLabel}>Autenticação Biométrica</Paragraph>
              <Paragraph style={styles.settingDescription}>
                Use digital ou Face ID para fazer login
              </Paragraph>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.section}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Ações Rápidas</Title>
          
          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            Alterar Senha
          </Button>

          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Support')}
          >
            Suporte
          </Button>

          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            Política de Privacidade
          </Button>

          <Button
            mode="outlined"
            style={styles.actionButton}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            Termos de Uso
          </Button>
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={[styles.section, styles.logoutSection]}>
        <Card.Content>
          <Button
            mode="contained"
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            Sair da Conta
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3C5BFA',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userType: {
    color: '#3C5BFA',
    fontWeight: '500',
  },
  email: {
    color: '#666',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  infoValue: {
    flex: 1,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#666',
    fontSize: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutSection: {
    backgroundColor: '#FFEBEE',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  bottomPadding: {
    height: 20,
  },
});