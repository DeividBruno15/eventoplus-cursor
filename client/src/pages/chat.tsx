import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, MessageCircle, Search } from "lucide-react";

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
  senderName?: string;
}

interface ChatContact {
  id: number;
  name: string;
  userType: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export default function ModernChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conectar ao WebSocket
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'chat_message') {
          // Atualizar mensagens em tempo real
          queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
          queryClient.invalidateQueries({ queryKey: ["/api/chat/contacts"] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [user, queryClient]);

  // Buscar contatos de chat
  const { data: contacts = [] } = useQuery<ChatContact[]>({
    queryKey: ["/api/chat/contacts"],
  });

  // Buscar mensagens do contato selecionado
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", selectedContact?.id],
    enabled: !!selectedContact,
  });

  // Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, message }: { receiverId: number; message: string }) => {
      return apiRequest("POST", "/api/chat/messages", { receiverId, message });
    },
    onSuccess: (data) => {
      // Enviar via WebSocket para tempo real
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'chat_message',
          data: data
        }));
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedContact?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/contacts"] });
      setNewMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  // Filtrar contatos
  const filteredContacts = contacts.filter((contact: ChatContact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll para a última mensagem
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white/80 backdrop-blur-lg border-r border-white/20 shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#3C5BFA] to-[#5B7CFF] text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">💬 Conversas</h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">{filteredContacts.length}</span>
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-4 h-4 w-4 text-white/70" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 rounded-xl h-12 focus:bg-white/30 transition-all"
            />
          </div>
        </div>

        {/* Recent Chats Avatars */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Conversas Recentes</h2>
          </div>
          <div className="flex gap-4">
            {filteredContacts.slice(0, 5).map((contact: ChatContact) => (
              <div
                key={contact.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-white shadow-lg group-hover:scale-110 transition-transform">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[#3C5BFA] to-[#5B7CFF] text-white font-bold text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {contact.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#FFA94D] to-[#FF8A3D] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs text-white font-bold">{contact.unreadCount}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-xs text-gray-700 mt-2 text-center truncate w-16 font-medium">
                  {contact.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* All Chats List */}
        <div className="flex-1 overflow-hidden">
          <div className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">Todas as Conversas</h2>
            <div className="w-4 h-4 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </div>
          </div>
          
          <ScrollArea className="h-full px-3">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3C5BFA]/20 to-[#5B7CFF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-[#3C5BFA]" />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {searchTerm ? 'Nenhum contato encontrado' : 'Nenhuma conversa ainda'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Suas conversas aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-3">
                {filteredContacts.map((contact: ChatContact) => (
                  <div
                    key={contact.id}
                    className={`p-4 cursor-pointer hover:bg-white/60 transition-all duration-200 rounded-2xl group ${
                      selectedContact?.id === contact.id 
                        ? 'bg-gradient-to-r from-[#3C5BFA]/10 to-[#5B7CFF]/10 shadow-md border-l-4 border-[#3C5BFA]' 
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12 ring-2 ring-white shadow-md group-hover:shadow-lg transition-shadow">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-[#3C5BFA] to-[#5B7CFF] text-white font-bold">
                            {contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {contact.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#FFA94D] to-[#FF8A3D] rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xs text-white font-bold">{contact.unreadCount}</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 truncate">{contact.name}</p>
                          {contact.lastMessageTime && (
                            <span className="text-xs text-gray-500 font-medium">
                              {formatTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {contact.lastMessage || 'Nenhuma mensagem ainda'}
                          </p>
                          <div className="flex items-center gap-2">
                            {contact.lastMessageTime && (
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-[#3C5BFA] to-[#5B7CFF] text-white font-bold">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{selectedContact.name}</h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-green-600 font-medium">Online agora</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-[#3C5BFA]/10">
                    <Search className="w-5 h-5 text-[#3C5BFA]" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-[#3C5BFA]/10">
                    <MessageCircle className="w-5 h-5 text-[#3C5BFA]" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full hover:bg-[#3C5BFA]/10">
                    <svg className="w-5 h-5 text-[#3C5BFA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="19" cy="12" r="1"/>
                      <circle cx="5" cy="12" r="1"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#3C5BFA]/20 to-[#5B7CFF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="h-10 w-10 text-[#3C5BFA]" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Comece uma conversa
                      </h3>
                      <p className="text-gray-500">
                        Envie uma mensagem para {selectedContact.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Day Separator */}
                      <div className="flex items-center justify-center my-8">
                        <div className="bg-white/80 backdrop-blur-sm text-gray-600 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                          Hoje
                        </div>
                      </div>
                      
                      {messages.map((message: ChatMessage) => (
                        <div
                          key={message.id}
                          className={`flex items-end gap-3 ${
                            message.senderId === user?.id ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-white shadow-md">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-[#3C5BFA] to-[#5B7CFF] text-white font-bold text-sm">
                              {message.senderId === user?.id 
                                ? (user as any)?.username?.charAt(0).toUpperCase() || 'U'
                                : selectedContact.name.charAt(0).toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex flex-col max-w-md ${message.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-gray-600">
                                {message.senderId === user?.id ? 'Você' : selectedContact.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                            
                            <div
                              className={`px-6 py-4 rounded-2xl shadow-md backdrop-blur-sm ${
                                message.senderId === user?.id
                                  ? 'bg-gradient-to-r from-[#3C5BFA] to-[#5B7CFF] text-white rounded-br-md'
                                  : 'bg-white/90 text-gray-800 rounded-bl-md border border-white/40'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            </div>
                            
                            <div className={`flex items-center gap-2 mt-2 ${message.senderId === user?.id ? 'flex-row-reverse' : ''}`}>
                              <span className="text-xs text-gray-500">
                                {message.senderId === user?.id ? 'Entregue' : ''}
                              </span>
                              {message.senderId === user?.id && (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 text-[#3C5BFA]">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="20,6 9,17 4,12"/>
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white/90 backdrop-blur-lg border-t border-white/20">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendMessageMutation.isPending}
                    className="pl-6 pr-16 border-gray-200 rounded-2xl h-14 bg-gray-50/80 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-[#3C5BFA]/20 transition-all"
                  />
                  <div className="absolute right-4 top-4 flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-[#3C5BFA]/10 rounded-full">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49"/>
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-[#3C5BFA]/10 rounded-full">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="2" r="1"/>
                        <circle cx="12" cy="22" r="1"/>
                        <circle cx="2" cy="12" r="1"/>
                        <circle cx="22" cy="12" r="1"/>
                      </svg>
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-[#3C5BFA] to-[#5B7CFF] hover:from-[#2A4AE8] hover:to-[#4A6BFE] rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all group"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  )}
                </Button>
              </div>
              
              {/* Character counter and typing indicator */}
              <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">
                      {selectedContact.name} está online
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {newMessage.length}/1000
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50/50 via-blue-50/30 to-indigo-50/50">
            <div className="text-center p-8">
              <div className="w-32 h-32 bg-gradient-to-br from-[#3C5BFA]/10 to-[#5B7CFF]/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                <MessageCircle className="h-16 w-16 text-[#3C5BFA]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Bem-vindo ao Chat
              </h3>
              <p className="text-gray-600 text-lg mb-4">
                Selecione uma conversa para começar
              </p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Escolha um contato da lista ao lado para visualizar o histórico de mensagens e começar a conversar
              </p>
              
              <div className="mt-12 flex items-center justify-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3C5BFA]/20 to-[#5B7CFF]/20 rounded-xl flex items-center justify-center mb-2">
                    <Search className="w-6 h-6 text-[#3C5BFA]" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Buscar</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FFA94D]/20 to-[#FF8A3D]/20 rounded-xl flex items-center justify-center mb-2">
                    <MessageCircle className="w-6 h-6 text-[#FFA94D]" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Conversar</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-500/20 rounded-xl flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Conectar</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}