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
    queryFn: async () => {
      const response = await apiRequest("GET", '/api/chat/contacts');
      return await response.json();
    },
    enabled: !!user
  });

  // Fetch messages for selected contact
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/messages', selectedContact?.id],
    queryFn: async () => {
      if (!selectedContact) return [];
      const response = await apiRequest("GET", `/api/chat/messages?contactId=${selectedContact.id}`);
      return await response.json();
    },
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
    <div className="h-screen flex bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-lg">
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-[#3C5BFA] to-[#4F69FF]">
          <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Conversas
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar contatos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white focus:text-gray-900 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium">Nenhuma conversa encontrada</p>
              <p className="text-sm text-gray-400 mt-1">Comece uma nova conversa</p>
            </div>
          ) : (
            filteredContacts.map((contact: ChatContact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b border-gray-100/50 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 ${
                  selectedContact?.id === contact.id 
                    ? 'bg-gradient-to-r from-[#3C5BFA]/10 to-[#4F69FF]/10 border-l-4 border-l-[#3C5BFA] shadow-sm' 
                    : 'hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="ring-2 ring-white shadow-md">
                      <AvatarImage src={contact.profileImage} />
                      <AvatarFallback className="bg-gradient-to-br from-[#3C5BFA] to-[#4F69FF] text-white font-semibold">
                        {getInitials(contact)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {getDisplayName(contact)}
                      </h3>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {format(new Date(contact.lastMessage.createdAt), "HH:mm", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate max-w-[180px]">
                        {contact.lastMessage?.message || "Iniciar conversa"}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-[#3C5BFA]/30 text-[#3C5BFA] bg-[#3C5BFA]/5"
                        >
                          {contact.userType}
                        </Badge>
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-gradient-to-r from-[#FFA94D] to-orange-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center animate-bounce">
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
            <div className="p-6 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 flex justify-between items-center shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                    <AvatarImage src={selectedContact.profileImage} />
                    <AvatarFallback className="bg-gradient-to-br from-[#3C5BFA] to-[#4F69FF] text-white font-semibold text-lg">
                      {getInitials(selectedContact)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedContact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-3 border-white rounded-full animate-pulse shadow-lg"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{getDisplayName(selectedContact)}</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedContact.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <p className="text-sm text-gray-600 font-medium">
                      {selectedContact.isOnline ? 'Online agora' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-full hover:bg-[#3C5BFA]/10 hover:text-[#3C5BFA] transition-all"
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-full hover:bg-[#3C5BFA]/10 hover:text-[#3C5BFA] transition-all"
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-full hover:bg-[#3C5BFA]/10 hover:text-[#3C5BFA] transition-all"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              {messagesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin w-8 h-8 border-3 border-[#3C5BFA] border-t-transparent rounded-full" />
                    <p className="text-sm text-gray-500 font-medium">Carregando mensagens...</p>
                  </div>
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message: ChatMessage, index: number) => {
                  const isOwn = message.senderId === user.id;
                  const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && showAvatar && (
                        <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
                          <AvatarImage src={selectedContact.profileImage} />
                          <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs">
                            {getInitials(selectedContact)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!isOwn && !showAvatar && <div className="w-8" />}
                      
                      <div className={`group max-w-xs lg:max-w-md ${isOwn ? 'order-last' : ''}`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
                          isOwn 
                            ? 'bg-gradient-to-r from-[#3C5BFA] to-[#4F69FF] text-white rounded-br-lg' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-lg hover:shadow-md'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.message}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <p className={`text-xs ${
                            isOwn ? 'text-[#3C5BFA]/70' : 'text-gray-500'
                          }`}>
                            {format(new Date(message.createdAt), "HH:mm", { locale: ptBR })}
                          </p>
                          {isOwn && (
                            <div className="text-[#3C5BFA]/70">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#3C5BFA]/10 to-[#4F69FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-[#3C5BFA]/60" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-2">Nenhuma mensagem ainda</h3>
                  <p className="text-gray-500 text-sm">Envie a primeira mensagem para começar a conversa!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white/95 backdrop-blur-sm border-t border-gray-200/50">
              <div className="flex items-end space-x-4">
                <div className="flex-1 relative">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 focus-within:border-[#3C5BFA] focus-within:ring-2 focus-within:ring-[#3C5BFA]/20 transition-all">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="border-0 bg-transparent focus:ring-0 focus:outline-none p-0 placeholder:text-gray-500 text-gray-900 resize-none"
                      style={{ boxShadow: 'none' }}
                    />
                  </div>
                  {newMessage.length > 0 && (
                    <div className="absolute -top-8 right-0 text-xs text-gray-400">
                      {newMessage.length}/500
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="h-12 w-12 rounded-full bg-gradient-to-r from-[#3C5BFA] to-[#4F69FF] hover:from-[#2A4AE8] hover:to-[#3D57ED] disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ws && ws.readyState === WebSocket.OPEN ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{ws && ws.readyState === WebSocket.OPEN ? 'Conectado' : 'Desconectado'}</span>
                </div>
                <span>Pressione Enter para enviar</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/50 to-white">
            <div className="text-center max-w-md p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-[#3C5BFA]/10 to-[#4F69FF]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-12 h-12 text-[#3C5BFA]/60" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">
                Bem-vindo ao Chat Evento+
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Selecione uma conversa à esquerda para começar a conversar com outros usuários da plataforma
              </p>
              <div className="bg-gradient-to-r from-[#3C5BFA]/5 to-[#4F69FF]/5 rounded-xl p-4 border border-[#3C5BFA]/20">
                <p className="text-sm text-gray-600">
                  💡 <strong>Dica:</strong> Use o chat para negociar serviços, esclarecer dúvidas sobre eventos e manter contato com clientes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}