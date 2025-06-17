import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, MessageCircle, Search, Phone, Video, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  eventId?: number;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

interface ChatContact {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  userType: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isOnline: boolean;
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contacts
  const { data: contacts } = useQuery({
    queryKey: ['/api/chat/contacts'],
    queryFn: () => apiRequest('/api/chat/contacts').then(res => res.json()),
    enabled: !!user
  });

  // Fetch messages for selected contact
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', selectedContact?.id],
    queryFn: () => selectedContact 
      ? apiRequest(`/api/chat/messages?contactId=${selectedContact.id}`).then(res => res.json())
      : [],
    enabled: !!selectedContact && !!user
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { receiverId: number; message: string; eventId?: number }) => {
      const response = await apiRequest("POST", "/api/chat/messages", messageData);
      return response.json();
    },
    onSuccess: (newMessage) => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedContact?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/contacts'] });
      
      // Send via WebSocket for real-time update
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'new_message',
          message: newMessage
        }));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected");
      setWs(websocket);
      
      // Send authentication
      websocket.send(JSON.stringify({
        type: 'authenticate',
        userId: user.id
      }));
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'new_message':
            // Update messages if it's for current conversation
            if (selectedContact && (
              data.message.senderId === selectedContact.id || 
              data.message.receiverId === selectedContact.id
            )) {
              queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedContact.id] });
            }
            
            // Update contacts list
            queryClient.invalidateQueries({ queryKey: ['/api/chat/contacts'] });
            break;
            
          case 'user_online':
          case 'user_offline':
            queryClient.invalidateQueries({ queryKey: ['/api/chat/contacts'] });
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      setWs(null);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (user) {
          // Recursively call this effect by updating a state or manually reconnecting
        }
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      websocket.close();
    };
  }, [user, selectedContact, queryClient]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    sendMessageMutation.mutate({
      receiverId: selectedContact.id,
      message: newMessage.trim()
    });
  };

  const getDisplayName = (contact: ChatContact) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    return contact.username;
  };

  const getInitials = (contact: ChatContact) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
    }
    return contact.username.substring(0, 2).toUpperCase();
  };

  const filteredContacts = contacts?.filter((contact: ChatContact) =>
    getDisplayName(contact).toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso restrito</h2>
          <p className="text-gray-600 mb-4">Faça login para acessar o chat.</p>
          <Button onClick={() => setLocation("/login")}>Fazer login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-black mb-4">Conversas</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar contatos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredContacts.map((contact: ChatContact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={contact.profileImage} />
                      <AvatarFallback>{getInitials(contact)}</AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-black truncate">
                        {getDisplayName(contact)}
                      </h3>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(contact.lastMessage.createdAt), "HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600 truncate">
                        {contact.lastMessage?.message || "Iniciar conversa"}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {contact.userType}
                        </Badge>
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={selectedContact.profileImage} />
                    <AvatarFallback>{getInitials(selectedContact)}</AvatarFallback>
                  </Avatar>
                  {selectedContact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-black">{getDisplayName(selectedContact)}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedContact.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message: ChatMessage) => {
                  const isOwn = message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {format(new Date(message.createdAt), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha um contato para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}