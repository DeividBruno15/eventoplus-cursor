import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, Users, MapPin, CreditCard, Check, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionData?: any;
  createdAt: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar notificações
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  // Marcar notificação como lida
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest("PUT", `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest("PUT", `/api/notifications/mark-all-read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas"
      });
    }
  });

  // Deletar notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest("DELETE", `/api/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Sucesso",
        description: "Notificação removida"
      });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_application':
      case 'event_update':
        return <Calendar className="h-5 w-5 text-primary" />;
      case 'service_request':
      case 'service_update':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'venue_booking':
      case 'venue_update':
        return <MapPin className="h-5 w-5 text-blue-600" />;
      case 'payment':
      case 'subscription':
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'event_application':
      case 'event_update':
        return 'default';
      case 'service_request':
      case 'service_update':
        return 'secondary';
      case 'venue_booking':
      case 'venue_update':
        return 'outline';
      case 'payment':
      case 'subscription':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'event_application':
        return 'Candidatura';
      case 'event_update':
        return 'Evento';
      case 'service_request':
        return 'Serviço';
      case 'service_update':
        return 'Serviço';
      case 'venue_booking':
        return 'Reserva';
      case 'venue_update':
        return 'Espaço';
      case 'payment':
        return 'Pagamento';
      case 'subscription':
        return 'Assinatura';
      default:
        return 'Sistema';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type.includes(activeTab);
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navegar para a URL de ação se existir
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Central de Notificações
              </h1>
              <p className="text-gray-600">
                Acompanhe todas as atualizações importantes da sua conta
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {unreadCount} não lidas
                </Badge>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">Não lidas</TabsTrigger>
            <TabsTrigger value="event">Eventos</TabsTrigger>
            <TabsTrigger value="service">Serviços</TabsTrigger>
            <TabsTrigger value="venue">Espaços</TabsTrigger>
            <TabsTrigger value="payment">Pagamentos</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de Notificações */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-primary bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          <Badge 
                            variant={getNotificationBadgeVariant(notification.type)}
                            className="text-xs"
                          >
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {notification.actionUrl && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm">
                            Ver detalhes
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Bell className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação encontrada
                </h3>
                <p className="text-gray-500">
                  {activeTab === "unread" 
                    ? "Você não tem notificações não lidas"
                    : "Suas notificações aparecerão aqui"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}