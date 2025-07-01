import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreHorizontal,
  Users,
  MessageSquare,
  Plus,
  Paperclip,
  Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  userType: string;
}

interface Message {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export default function ChatModern() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/chat/contacts"],
    enabled: !!user,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedContact?.id],
    enabled: !!selectedContact,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: number; content: string }) => {
      return apiRequest(`/api/chat/messages`, {
        method: "POST",
        body: { receiverId, content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/contacts"] });
      setNewMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      receiverId: selectedContact.id,
      content: newMessage.trim(),
    });
  };

  const filteredContacts = contacts.filter((contact: Contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockContacts: Contact[] = [
    {
      id: 1,
      name: "João Silva",
      avatar: "",
      lastMessage: "Olá! Gostaria de conversar sobre o evento.",
      timestamp: "2 min",
      unreadCount: 2,
      isOnline: true,
      userType: "prestador"
    },
    {
      id: 2,
      name: "Maria Santos",
      avatar: "",
      lastMessage: "Perfeito! Quando podemos nos reunir?",
      timestamp: "5 min",
      unreadCount: 0,
      isOnline: true,
      userType: "contratante"
    },
    {
      id: 3,
      name: "Carlos Eduardo",
      avatar: "",
      lastMessage: "Obrigado pela proposta, vou analisar.",
      timestamp: "1h",
      unreadCount: 0,
      isOnline: false,
      userType: "anunciante"
    }
  ];

  const mockMessages: Message[] = selectedContact ? [
    {
      id: 1,
      senderId: selectedContact.id,
      content: "Olá! Como você está?",
      timestamp: "14:30",
      isRead: true
    },
    {
      id: 2,
      senderId: user?.id || 1,
      content: "Oi! Estou bem, obrigado. E você?",
      timestamp: "14:32",
      isRead: true
    },
    {
      id: 3,
      senderId: selectedContact.id,
      content: "Também estou bem! Gostaria de conversar sobre o evento que você está organizando.",
      timestamp: "14:33",
      isRead: true
    },
    {
      id: 4,
      senderId: user?.id || 1,
      content: "Claro! Ficaria muito feliz em discutir os detalhes com você.",
      timestamp: "14:35",
      isRead: false
    }
  ] : [];

  const displayContacts = filteredContacts.length > 0 ? filteredContacts : mockContacts;
  const displayMessages = messages.length > 0 ? messages : mockMessages;

  if (!user) {
    return (
      <div className="saas-page flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="saas-body-secondary">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-page h-screen flex">
      {/* Contact List Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="saas-title-lg">Mensagens</h1>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Contact List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {displayContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={cn(
                  "saas-list-item-simple cursor-pointer rounded-lg p-3",
                  selectedContact?.id === contact.id && "bg-accent"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="saas-body font-medium truncate">{contact.name}</p>
                      <span className="saas-caption">{contact.timestamp}</span>
                    </div>
                    <p className="saas-body-secondary truncate">{contact.lastMessage}</p>
                  </div>
                </div>
                
                {contact.unreadCount > 0 && (
                  <Badge className="saas-badge-info h-5 w-5 p-0 flex items-center justify-center">
                    {contact.unreadCount}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="saas-body font-medium">{selectedContact.name}</p>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "saas-status-dot",
                        selectedContact.isOnline ? "saas-status-success" : "saas-status-neutral"
                      )}></div>
                      <span className="saas-caption">
                        {selectedContact.isOnline ? "Online" : "Offline"}
                      </span>
                      <Badge variant="outline" className="saas-badge-neutral h-4 text-xs">
                        {selectedContact.userType === "prestador" && "Prestador"}
                        {selectedContact.userType === "contratante" && "Organizador"}
                        {selectedContact.userType === "anunciante" && "Anunciante"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {displayMessages.map((message) => {
                  const isOwn = message.senderId === user.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                          isOwn 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}
                      >
                        <p className="saas-body">{message.content}</p>
                        <p className={cn(
                          "saas-caption mt-1",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button size="sm" variant="ghost" type="button" className="h-9 w-9 p-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="pr-10"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    type="button" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="h-9 w-9 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="saas-empty-state">
              <MessageSquare className="saas-empty-state-icon" />
              <h3 className="saas-empty-state-title">Selecione uma conversa</h3>
              <p className="saas-empty-state-description">
                Escolha um contato para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}