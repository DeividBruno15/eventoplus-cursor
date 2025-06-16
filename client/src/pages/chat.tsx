import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Send, MessageCircle, Users, Search } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Mensagens</h1>
          <p className="text-gray-600">
            Comunique-se diretamente com prestadores e organizadores
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Lista de Contatos */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Conversas ({filteredContacts.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm ? 'Nenhum contato encontrado' : 'Nenhuma conversa ainda'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredContacts.map((contact: ChatContact) => (
                      <div
                        key={contact.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedContact?.id === contact.id ? 'bg-blue-50 border-r-2 border-primary' : ''
                        }`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>
                              {contact.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{contact.name}</p>
                              {contact.lastMessageTime && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(contact.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 truncate">
                                {contact.lastMessage || 'Nenhuma mensagem'}
                              </p>
                              {contact.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {contact.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {contact.userType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className="lg:col-span-2">
            {selectedContact ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {selectedContact.userType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col h-[500px]">
                  {/* Mensagens */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            Nenhuma mensagem ainda. Comece a conversa!
                          </p>
                        </div>
                      ) : (
                        messages.map((message: ChatMessage) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user?.id
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderId === user?.id
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <Separator />

                  {/* Input de Nova Mensagem */}
                  <div className="p-4">
                    <div className="flex gap-2">
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
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        className="bg-primary hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-gray-500">
                    Escolha um contato da lista para começar a conversar
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}