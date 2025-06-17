import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  Avatar,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { mobileApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen({ navigation }: any) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact]);

  const loadContacts = async () => {
    try {
      const data = await mobileApi.getChatContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contactId: number) => {
    try {
      const data = await mobileApi.getChatMessages(contactId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    setSendingMessage(true);
    try {
      await mobileApi.sendMessage(selectedContact.id, newMessage.trim());
      setNewMessage('');
      loadMessages(selectedContact.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContact = ({ item }: { item: any }) => (
    <Card
      style={[
        styles.contactCard,
        selectedContact?.id === item.id && styles.selectedContact,
      ]}
      onPress={() => setSelectedContact(item)}
    >
      <Card.Content style={styles.contactContent}>
        <Avatar.Text
          size={50}
          label={item.name.charAt(0).toUpperCase()}
          style={styles.avatar}
        />
        <View style={styles.contactInfo}>
          <Title style={styles.contactName}>{item.name}</Title>
          <Paragraph style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'Sem mensagens'}
          </Paragraph>
        </View>
        <View style={styles.contactMeta}>
          <Paragraph style={styles.timeText}>
            {item.lastMessageTime && formatTime(item.lastMessageTime)}
          </Paragraph>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Paragraph style={styles.unreadText}>{item.unreadCount}</Paragraph>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === user?.id;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Paragraph style={styles.messageText}>{item.message}</Paragraph>
          <Paragraph style={styles.messageTime}>
            {formatTime(item.createdAt)}
          </Paragraph>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C5BFA" />
        <Paragraph style={styles.loadingText}>Carregando conversas...</Paragraph>
      </View>
    );
  }

  if (!selectedContact) {
    return (
      <View style={styles.container}>
        <Title style={styles.header}>Conversas</Title>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id.toString()}
          style={styles.contactList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>
                Nenhuma conversa encontrada
              </Paragraph>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with contact info */}
      <View style={styles.chatHeader}>
        <Button
          mode="text"
          onPress={() => setSelectedContact(null)}
          style={styles.backButton}
        >
          ← Voltar
        </Button>
        <Title style={styles.chatTitle}>{selectedContact.name}</Title>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        inverted
        ListEmptyComponent={
          <View style={styles.emptyMessagesContainer}>
            <Paragraph style={styles.emptyText}>
              Inicie uma conversa
            </Paragraph>
          </View>
        }
      />

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Digite uma mensagem..."
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.messageInput}
          multiline
          disabled={sendingMessage}
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          disabled={!newMessage.trim() || sendingMessage}
          style={styles.sendButton}
        >
          {sendingMessage ? <ActivityIndicator color="white" size="small" /> : 'Enviar'}
        </Button>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  contactList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contactCard: {
    marginBottom: 8,
    elevation: 2,
  },
  selectedContact: {
    backgroundColor: '#E3F2FD',
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#3C5BFA',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    marginBottom: 4,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
  },
  contactMeta: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#999',
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: '#3C5BFA',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    marginRight: 8,
  },
  chatTitle: {
    fontSize: 18,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#3C5BFA',
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    elevation: 1,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyMessagesContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});