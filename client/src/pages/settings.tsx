import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Key
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    // Notificações
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    eventReminders: true,
    chatNotifications: true,
    
    // Privacidade
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    
    // Preferências
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light',
    
    // Segurança
    twoFactorEnabled: false,
    loginAlerts: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      return apiRequest("PUT", "/api/settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      return apiRequest("PUT", "/api/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Verifique sua senha atual",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/account", {});
    },
    onSuccess: () => {
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída permanentemente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir conta",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate(passwordForm);
  };

  const handleDeleteAccount = () => {
    if (confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) {
      deleteAccountMutation.mutate();
    }
  };

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
        <p className="text-gray-600">Faça login para acessar as configurações.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Configurações</h1>
        <p className="text-gray-600">Personalize sua experiência na plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu lateral */}
        <div className="space-y-2">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <a href="#notifications" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                  <Bell className="h-4 w-4" />
                  <span>Notificações</span>
                </a>
                <a href="#privacy" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                  <Shield className="h-4 w-4" />
                  <span>Privacidade</span>
                </a>
                <a href="#preferences" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                  <Globe className="h-4 w-4" />
                  <span>Preferências</span>
                </a>
                <a href="#security" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                  <Key className="h-4 w-4" />
                  <span>Segurança</span>
                </a>
                <a href="#danger" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-red-600">
                  <Trash2 className="h-4 w-4" />
                  <span>Zona de Perigo</span>
                </a>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notificações */}
          <Card id="notifications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email de notificações</Label>
                    <p className="text-sm text-gray-500">Receba atualizações por email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações push</Label>
                    <p className="text-sm text-gray-500">Notificações em tempo real</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emails de marketing</Label>
                    <p className="text-sm text-gray-500">Promoções e novidades</p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembretes de eventos</Label>
                    <p className="text-sm text-gray-500">Avisos sobre seus eventos</p>
                  </div>
                  <Switch
                    checked={settings.eventReminders}
                    onCheckedChange={(checked) => handleSettingChange('eventReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações de chat</Label>
                    <p className="text-sm text-gray-500">Novas mensagens no chat</p>
                  </div>
                  <Switch
                    checked={settings.chatNotifications}
                    onCheckedChange={(checked) => handleSettingChange('chatNotifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card id="privacy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade
              </CardTitle>
              <CardDescription>
                Controle quais informações são visíveis para outros usuários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Visibilidade do perfil</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                      <SelectItem value="contacts">Apenas contatos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar email</Label>
                    <p className="text-sm text-gray-500">Exibir email no perfil público</p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar telefone</Label>
                    <p className="text-sm text-gray-500">Exibir telefone no perfil público</p>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permitir mensagens</Label>
                    <p className="text-sm text-gray-500">Outros usuários podem te enviar mensagens</p>
                  </div>
                  <Switch
                    checked={settings.allowMessages}
                    onCheckedChange={(checked) => handleSettingChange('allowMessages', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card id="preferences">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Preferências
              </CardTitle>
              <CardDescription>
                Configure idioma, fuso horário e tema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fuso horário</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={settings.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('theme', 'light')}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Claro
                  </Button>
                  <Button
                    variant={settings.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('theme', 'dark')}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Escuro
                  </Button>
                  <Button
                    variant={settings.theme === 'auto' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSettingChange('theme', 'auto')}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Automático
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card id="security">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Gerencie sua senha e configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação de dois fatores</Label>
                    <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de login</Label>
                    <p className="text-sm text-gray-500">Notificar sobre novos acessos</p>
                  </div>
                  <Switch
                    checked={settings.loginAlerts}
                    onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alterar senha</h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Senha atual</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                        placeholder="Digite sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmar nova senha</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                        placeholder="Confirme sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={changePasswordMutation.isPending}
                    className="bg-primary hover:bg-blue-700"
                  >
                    {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          <Card id="danger" className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>
                Ações irreversíveis que afetam permanentemente sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Uma vez excluída, sua conta não pode ser recuperada. Todos os seus dados serão perdidos permanentemente.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteAccountMutation.isPending ? 'Excluindo...' : 'Excluir Conta'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}