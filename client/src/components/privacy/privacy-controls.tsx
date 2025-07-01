import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Shield,
  Eye,
  Lock,
  Users,
  Globe,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  MapPin,
  Info,
  AlertTriangle,
  Download,
  Trash2,
  Database,
  Star
} from "lucide-react";

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'contacts_only';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  allowEventInvites: boolean;
  allowServiceRequests: boolean;
  shareActivityStatus: boolean;
  shareCompletedEvents: boolean;
  shareReviews: boolean;
  marketingEmails: boolean;
  notificationEmails: boolean;
  smsNotifications: boolean;
  dataRetentionDays: number;
  allowDataExport: boolean;
  twoFactorEnabled: boolean;
}

interface DataUsage {
  totalDataSize: string;
  lastBackup: string;
  accountAge: string;
  eventsCreated: number;
  messagesCount: number;
  reviewsGiven: number;
  loginHistory: Array<{
    date: string;
    ip: string;
    device: string;
    location: string;
  }>;
}

interface PrivacyControlsProps {
  className?: string;
}

export default function PrivacyControls({ className = "" }: PrivacyControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [activeTab, setActiveTab] = useState("visibility");

  // Buscar configurações de privacidade
  const { data: privacySettings, isLoading } = useQuery<PrivacySettings>({
    queryKey: ["/api/privacy/settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/privacy/settings");
      if (!response.ok) throw new Error('Erro ao carregar configurações');
      return response.json();
    },
  });

  // Buscar dados de uso
  const { data: dataUsage } = useQuery<DataUsage>({
    queryKey: ["/api/privacy/data-usage"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/privacy/data-usage");
      if (!response.ok) throw new Error('Erro ao carregar dados de uso');
      return response.json();
    },
  });

  // Atualizar configurações
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<PrivacySettings>) => {
      const response = await apiRequest("PUT", "/api/privacy/settings", settings);
      if (!response.ok) throw new Error('Erro ao atualizar configurações');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Configurações de privacidade atualizadas" });
      queryClient.invalidateQueries({ queryKey: ["/api/privacy/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar configurações",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Exportar dados
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/privacy/export-data");
      if (!response.ok) throw new Error('Erro ao exportar dados');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evento-plus-data-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Dados exportados com sucesso!" });
    },
  });

  // Deletar conta
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/privacy/delete-account", {
        confirmation: deleteConfirmation
      });
      if (!response.ok) throw new Error('Erro ao deletar conta');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Conta deletada com sucesso" });
      window.location.href = '/auth/login';
    },
  });

  const updateSetting = (key: keyof PrivacySettings, value: any) => {
    if (privacySettings) {
      updateSettingsMutation.mutate({ [key]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Controles de Privacidade</h2>
              <p className="text-blue-100">Gerencie suas configurações de privacidade e dados pessoais</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visibility">Visibilidade</TabsTrigger>
          <TabsTrigger value="communications">Comunicações</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Visibilidade do Perfil */}
        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visibilidade do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profile-visibility">Quem pode ver meu perfil</Label>
                <Select
                  value={privacySettings?.profileVisibility}
                  onValueChange={(value) => updateSetting('profileVisibility', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        Público - Todos podem ver
                      </div>
                    </SelectItem>
                    <SelectItem value="contacts_only">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-yellow-600" />
                        Apenas Contatos - Só quem conversei
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-red-600" />
                        Privado - Ninguém pode ver
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="show-email">Mostrar email</Label>
                    </div>
                    <Switch
                      id="show-email"
                      checked={privacySettings?.showEmail || false}
                      onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <Label htmlFor="show-phone">Mostrar telefone</Label>
                    </div>
                    <Switch
                      id="show-phone"
                      checked={privacySettings?.showPhone || false}
                      onCheckedChange={(checked) => updateSetting('showPhone', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <Label htmlFor="show-location">Mostrar localização</Label>
                    </div>
                    <Switch
                      id="show-location"
                      checked={privacySettings?.showLocation || false}
                      onCheckedChange={(checked) => updateSetting('showLocation', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Label htmlFor="show-online">Status online</Label>
                    </div>
                    <Switch
                      id="show-online"
                      checked={privacySettings?.showOnlineStatus || false}
                      onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <Label htmlFor="share-events">Eventos concluídos</Label>
                    </div>
                    <Switch
                      id="share-events"
                      checked={privacySettings?.shareCompletedEvents || false}
                      onCheckedChange={(checked) => updateSetting('shareCompletedEvents', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <Label htmlFor="share-reviews">Avaliações públicas</Label>
                    </div>
                    <Switch
                      id="share-reviews"
                      checked={privacySettings?.shareReviews || false}
                      onCheckedChange={(checked) => updateSetting('shareReviews', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comunicações */}
        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Preferências de Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="direct-messages">Mensagens diretas</Label>
                    <p className="text-sm text-gray-600">Permitir que outros usuários me enviem mensagens</p>
                  </div>
                  <Switch
                    id="direct-messages"
                    checked={privacySettings?.allowDirectMessages || false}
                    onCheckedChange={(checked) => updateSetting('allowDirectMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="event-invites">Convites para eventos</Label>
                    <p className="text-sm text-gray-600">Receber convites para participar de eventos</p>
                  </div>
                  <Switch
                    id="event-invites"
                    checked={privacySettings?.allowEventInvites || false}
                    onCheckedChange={(checked) => updateSetting('allowEventInvites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="service-requests">Solicitações de serviço</Label>
                    <p className="text-sm text-gray-600">Receber solicitações diretas para meus serviços</p>
                  </div>
                  <Switch
                    id="service-requests"
                    checked={privacySettings?.allowServiceRequests || false}
                    onCheckedChange={(checked) => updateSetting('allowServiceRequests', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <div>
                      <Label htmlFor="marketing-emails">E-mails de marketing</Label>
                      <p className="text-sm text-gray-600">Receber ofertas, novidades e promoções</p>
                    </div>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={privacySettings?.marketingEmails || false}
                    onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <div>
                      <Label htmlFor="notification-emails">E-mails de notificação</Label>
                      <p className="text-sm text-gray-600">Mensagens, convites e atualizações importantes</p>
                    </div>
                  </div>
                  <Switch
                    id="notification-emails"
                    checked={privacySettings?.notificationEmails || false}
                    onCheckedChange={(checked) => updateSetting('notificationEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <div>
                      <Label htmlFor="sms-notifications">Notificações SMS</Label>
                      <p className="text-sm text-gray-600">Receber SMS para eventos urgentes</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={privacySettings?.smsNotifications || false}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestão de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {dataUsage && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dataUsage.totalDataSize}</div>
                    <p className="text-sm text-gray-600">Total de Dados</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dataUsage.eventsCreated}</div>
                    <p className="text-sm text-gray-600">Eventos Criados</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{dataUsage.messagesCount}</div>
                    <p className="text-sm text-gray-600">Mensagens</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{dataUsage.accountAge}</div>
                    <p className="text-sm text-gray-600">Idade da Conta</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => exportDataMutation.mutate()}
                  disabled={!privacySettings?.allowDataExport || exportDataMutation.isPending}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Meus Dados
                </Button>

                <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Info className="h-4 w-4 mr-2" />
                      Ver Histórico
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Histórico de Acesso</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {dataUsage?.loginHistory.map((login, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{login.date}</p>
                            <p className="text-sm text-gray-600">{login.device}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{login.location}</p>
                            <p className="text-xs text-gray-500">{login.ip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Autenticação de dois fatores</Label>
                  <p className="text-sm text-gray-600">Adicionar camada extra de segurança à sua conta</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={privacySettings?.twoFactorEnabled || false}
                  onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
                />
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Para alterar sua senha, acesse as configurações de conta no menu perfil.
                </AlertDescription>
              </Alert>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-red-600 mb-4">Zona de Perigo</h3>
                
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Conta Permanentemente
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600">Deletar Conta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                        </AlertDescription>
                      </Alert>
                      
                      <div>
                        <Label htmlFor="delete-confirmation">
                          Digite "DELETAR MINHA CONTA" para confirmar:
                        </Label>
                        <Textarea
                          id="delete-confirmation"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="DELETAR MINHA CONTA"
                          className="mt-2"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={deleteConfirmation !== "DELETAR MINHA CONTA" || deleteAccountMutation.isPending}
                          onClick={() => deleteAccountMutation.mutate()}
                        >
                          Deletar Conta
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}