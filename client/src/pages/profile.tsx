import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AutocompleteLocation } from "@/components/ui/autocomplete-location";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Star,
  Award,
  Briefcase,
  Clock,
  Lock,
  MessageCircle,
  Bell,
  Settings
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    company: ''
  });

  const [whatsappSettings, setWhatsappSettings] = useState({
    whatsappNumber: user?.whatsappNumber || '',
    whatsappNotificationsEnabled: user?.whatsappNotificationsEnabled || false,
    whatsappNewEventNotifications: user?.whatsappNewEventNotifications || true,
    whatsappNewChatNotifications: user?.whatsappNewChatNotifications || true,
    whatsappVenueReservationNotifications: user?.whatsappVenueReservationNotifications || true,
    whatsappApplicationNotifications: user?.whatsappApplicationNotifications || true,
    whatsappStatusNotifications: user?.whatsappStatusNotifications || true
  });

  // Buscar serviços do prestador se for prestador
  const { data: userServices = [] } = useQuery({
    queryKey: ["/api/services", user?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/services?providerId=${user?.id}`);
      if (!response.ok) throw new Error('Erro ao carregar serviços');
      return await response.json();
    },
    enabled: !!user && user.userType === 'prestador',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const updateWhatsAppMutation = useMutation({
    mutationFn: async (data: typeof whatsappSettings) => {
      return apiRequest("PUT", "/api/profile/whatsapp-settings", data);
    },
    onSuccess: () => {
      toast({
        title: "Configurações WhatsApp atualizadas",
        description: "Suas preferências de notificação foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar configurações",
        description: error.message || "Verifique o número do WhatsApp",
        variant: "destructive",
      });
    },
  });

  const testWhatsAppMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/test");
    },
    onSuccess: () => {
      toast({
        title: "Teste enviado!",
        description: "Verifique seu WhatsApp para confirmar o recebimento.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no teste",
        description: error.message || "Erro ao enviar mensagem de teste",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: '',
      location: '',
      bio: '',
      website: '',
      company: ''
    });
    setIsEditing(false);
  };

  const handleWhatsAppSettingChange = (field: string, value: string | boolean) => {
    setWhatsappSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveWhatsApp = () => {
    updateWhatsAppMutation.mutate(whatsappSettings);
  };

  const handleTestWhatsApp = () => {
    if (!whatsappSettings.whatsappNumber) {
      toast({
        title: "Número necessário",
        description: "Configure seu número de WhatsApp antes de testar.",
        variant: "destructive",
      });
      return;
    }
    testWhatsAppMutation.mutate();
  };

  const getUserTypeLabel = () => {
    switch (user?.userType) {
      case 'prestador':
        return 'Prestador de Serviços';
      case 'contratante':
        return 'Organizador de Eventos';
      case 'anunciante':
        return 'Anunciante de Espaços';
      default:
        return user?.userType;
    }
  };

  // Verificar se o serviço pode ser editado
  const canEditService = (service: any) => {
    const createdAt = new Date(service.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Para plano gratuito, só pode editar após 30 dias
    // Para planos pagos, pode editar a qualquer momento
    const userPlan = user?.subscription?.plan || 'free';
    
    if (userPlan === 'free') {
      return daysSinceCreation >= 30;
    }
    
    return true; // Planos pagos podem editar sempre
  };

  const getEditTooltipMessage = (service: any) => {
    const createdAt = new Date(service.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = 30 - daysSinceCreation;
    
    const userPlan = user?.subscription?.plan || 'free';
    
    if (userPlan === 'free' && daysSinceCreation < 30) {
      return `Você poderá editar este serviço em ${daysRemaining} dia(s). Upgrade para plano pago para editar a qualquer momento.`;
    }
    
    return 'Editar serviço';
  };

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
        <p className="text-gray-600">Faça login para acessar seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className={isEditing ? "" : "bg-primary hover:bg-blue-700"}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Perfil
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar com informações básicas */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-primary text-white text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-black">{user.username}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {getUserTypeLabel()}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {new Date().getFullYear()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Avaliação</span>
                </div>
                <span className="font-semibold">4.8</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Projetos</span>
                </div>
                <span className="font-semibold">12</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Conexões</span>
                </div>
                <span className="font-semibold">45</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de edição */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Mantenha suas informações atualizadas para melhor experiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome completo</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-gray-50 flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {user.username}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="p-3 border rounded-md bg-gray-50 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {user.email}
                  </div>
                  <p className="text-xs text-gray-500">Email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-gray-50 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {formData.phone || 'Não informado'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  {isEditing ? (
                    <AutocompleteLocation
                      value={formData.location}
                      onChange={(value) => handleInputChange('location', value)}
                      placeholder="São Paulo, SP"
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-gray-50 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {formData.location || 'Não informado'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você e sua experiência..."
                    rows={3}
                  />
                ) : (
                  <div className="p-3 border rounded-md bg-gray-50 min-h-[80px]">
                    {formData.bio || 'Nenhuma biografia adicionada'}
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://seusite.com"
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-gray-50">
                      {formData.website || 'Não informado'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Nome da sua empresa"
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-gray-50">
                      {formData.company || 'Não informado'}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="bg-primary hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção de Serviços para Prestadores */}
          {user.userType === 'prestador' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Meus Serviços
                </CardTitle>
                <CardDescription>
                  Gerencie seus serviços cadastrados e suas restrições de edição
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userServices.length > 0 ? (
                  <div className="space-y-4">
                    {userServices.map((service: any) => {
                      const canEdit = canEditService(service);
                      const tooltipMessage = getEditTooltipMessage(service);
                      
                      return (
                        <div key={service.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{service.title}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary">{service.category}</Badge>
                                {service.subcategory && (
                                  <Badge variant="outline">{service.subcategory}</Badge>
                                )}
                                {service.musicalGenre && (
                                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                    {service.musicalGenre}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!canEdit}
                                        onClick={() => window.location.href = `/services/manage`}
                                      >
                                        {canEdit ? <Edit3 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                      </Button>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{tooltipMessage}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <p className="line-clamp-2">{service.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {service.location || 'Não especificado'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Criado em {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            
                            <div className="font-semibold text-green-600">
                              {service.basePrice ? `R$ ${parseFloat(service.basePrice).toLocaleString('pt-BR')}` : 'Preço sob consulta'}
                            </div>
                          </div>
                          
                          {!canEdit && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                              <p className="text-sm text-yellow-800">
                                <Lock className="h-4 w-4 inline mr-1" />
                                Este serviço só poderá ser editado após 30 dias da criação (plano gratuito) ou com upgrade para plano pago.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum serviço cadastrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Cadastre seus serviços para começar a receber propostas de trabalho.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/services/create'}
                      className="bg-primary hover:bg-blue-700"
                    >
                      Cadastrar Primeiro Serviço
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Configurações de Notificação via n8n */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações Inteligentes
              </CardTitle>
              <CardDescription>
                Configure suas notificações via WhatsApp para não perder nenhuma oportunidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Número do WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  value={whatsappSettings.whatsappNumber}
                  onChange={(e) => handleWhatsAppSettingChange('whatsappNumber', e.target.value)}
                  placeholder="+5511999999999"
                  type="tel"
                />
                <p className="text-sm text-gray-500">
                  Use o formato internacional: +55 + DDD + número (ex: +5511999999999)
                </p>
              </div>

              {/* Switch principal */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Ativar notificações inteligentes</Label>
                  <p className="text-sm text-gray-500">
                    Receba notificações via WhatsApp sobre oportunidades relevantes para você
                  </p>
                </div>
                <Switch
                  checked={whatsappSettings.whatsappNotificationsEnabled}
                  onCheckedChange={(checked) => handleWhatsAppSettingChange('whatsappNotificationsEnabled', checked)}
                />
              </div>

              {/* Informações sobre n8n */}
              {whatsappSettings.whatsappNotificationsEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Settings className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Sistema de Automação Inteligente
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Suas notificações são processadas por um sistema automático que envia:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
                        <li>• Novos eventos compatíveis com seus serviços</li>
                        <li>• Novas conversas e mensagens</li>
                        {user.userType === 'contratante' && <li>• Candidaturas recebidas em seus eventos</li>}
                        {user.userType === 'prestador' && <li>• Status das suas candidaturas</li>}
                        {user.userType === 'anunciante' && <li>• Pré-reservas nos seus espaços</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveWhatsApp}
                  disabled={updateWhatsAppMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateWhatsAppMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
                
                {whatsappSettings.whatsappNumber && whatsappSettings.whatsappNotificationsEnabled && (
                  <Button
                    variant="outline"
                    onClick={handleTestWhatsApp}
                    disabled={testWhatsAppMutation.isPending}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {testWhatsAppMutation.isPending ? 'Testando...' : 'Testar Conectividade'}
                  </Button>
                )}
              </div>

              {whatsappSettings.whatsappNumber && !whatsappSettings.whatsappNotificationsEnabled && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Ative as notificações para receber alertas importantes sobre oportunidades de trabalho.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}