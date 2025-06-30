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

export default function Chat() {
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
            <h1 className="text-xl font-bold">Conversas</h1>
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
          <div className="px-4 py-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">All Chats</h2>
            <div className="w-4 h-4 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </div>
          </div>
          
          <ScrollArea className="h-full px-2">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">
                  {searchTerm ? 'Nenhum contato encontrado' : 'Nenhuma conversa ainda'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredContacts.map((contact: ChatContact) => (
                  <div
                    key={contact.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg ${
                      selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {contact.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{contact.unreadCount}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-gray-900 truncate text-sm">{contact.name}</p>
                          {contact.lastMessageTime && (
                            <span className="text-xs text-gray-500">
                              {formatTime(contact.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 truncate">
                            {contact.lastMessage || 'Nenhuma mensagem'}
                          </p>
                          <div className="flex items-center gap-1">
                            {contact.lastMessageTime && (
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-400">
                  <Search className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                  <MessageCircle className="w-5 h-5 cursor-pointer hover:text-gray-600" />
                  <div className="w-5 h-5 cursor-pointer hover:text-gray-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="19" cy="12" r="1"/>
                      <circle cx="5" cy="12" r="1"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Nenhuma mensagem ainda. Comece a conversa!
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message: ChatMessage) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${
                            message.senderId === user?.id ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                              {message.senderId === user?.id 
                                ? (user as any)?.name?.charAt(0).toUpperCase() || 'U'
                                : selectedContact.name.charAt(0).toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex flex-col ${message.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {message.senderId === user?.id ? 'You' : selectedContact.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                            
                            <div
                              className={`max-w-sm px-4 py-3 rounded-2xl ${
                                message.senderId === user?.id
                                  ? 'bg-[#3C5BFA] text-white rounded-br-md'
                                  : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            </div>
                            
                            {message.senderId === user?.id && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-400">24</span>
                                <span className="text-xs text-red-400">❤️</span>
                                <span className="text-xs text-gray-400">15</span>
                                <span className="text-xs text-yellow-400">👍</span>
                                <span className="text-xs text-gray-400">16</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Day Separator */}
                      <div className="flex items-center justify-center my-6">
                        <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs">
                          Yesterday
                        </div>
                      </div>
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendMessageMutation.isPending}
                    className="pr-12 border-gray-200 rounded-full h-12 bg-gray-50"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <div className="w-5 h-5 text-gray-400 cursor-pointer">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-[#3C5BFA] hover:bg-blue-700 rounded-full w-12 h-12 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha um contato da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}