import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Key, 
  Code, 
  BookOpen, 
  Eye,
  Copy,
  Plus,
  BarChart3,
  Settings,
  Shield,
  Globe,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  ExternalLink,
  Download
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const createApiKeySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  permissions: z.array(z.string()).min(1, "Selecione pelo menos uma permissão"),
  rateLimitPerHour: z.number().min(100).max(10000).default(1000)
});

type ApiKey = {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimitPerHour: number;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
};

const availablePermissions = [
  { value: "events:read", label: "Ler Eventos", description: "Acesso de leitura aos eventos da plataforma" },
  { value: "events:write", label: "Escrever Eventos", description: "Criar e editar eventos" },
  { value: "services:read", label: "Ler Serviços", description: "Acesso de leitura aos serviços disponíveis" },
  { value: "services:write", label: "Escrever Serviços", description: "Criar e editar serviços" },
  { value: "venues:read", label: "Ler Locais", description: "Acesso de leitura aos locais disponíveis" },
  { value: "venues:write", label: "Escrever Locais", description: "Criar e editar locais" },
  { value: "users:read", label: "Ler Usuários", description: "Acesso de leitura aos dados básicos de usuários" }
];

export default function PublicApi() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedApiKey, setSelectedApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const form = useForm<z.infer<typeof createApiKeySchema>>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      permissions: [],
      rateLimitPerHour: 1000
    }
  });

  // Mock data for demonstration
  const mockApiKeys: ApiKey[] = [
    {
      id: "key-1",
      name: "Desenvolvimento",
      key: "evt_dev_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
      permissions: ["events:read", "services:read", "venues:read"],
      rateLimitPerHour: 1000,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
      usageCount: 156
    },
    {
      id: "key-2", 
      name: "Produção",
      key: "evt_prod_xyz987wvu654tsr321pon098mlk765jih432gfe109dcb876a543",
      permissions: ["events:read", "events:write", "services:read", "venues:read"],
      rateLimitPerHour: 5000,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastUsedAt: new Date(Date.now() - 1800000).toISOString(),
      usageCount: 2341
    }
  ];

  // Query for API usage stats (mock)
  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/api-keys/usage', selectedApiKey],
    queryFn: () => ({
      totalRequests: 2497,
      successfulRequests: 2389,
      failedRequests: 108,
      averageResponseTime: 245,
      topEndpoints: [
        { endpoint: '/api/v1/events', count: 856 },
        { endpoint: '/api/v1/services', count: 645 },
        { endpoint: '/api/v1/venues', count: 432 },
        { endpoint: '/api/v1/events/:id', count: 564 }
      ],
      errorBreakdown: {
        '400': 45,
        '401': 23,
        '404': 28,
        '429': 12
      },
      dailyUsage: [
        { date: '2025-06-24', requests: 234 },
        { date: '2025-06-25', requests: 289 },
        { date: '2025-06-26', requests: 345 },
        { date: '2025-06-27', requests: 298 },
        { date: '2025-06-28', requests: 412 },
        { date: '2025-06-29', requests: 378 },
        { date: '2025-06-30', requests: 541 }
      ]
    }),
    enabled: !!selectedApiKey
  });

  // Mutation to create API key
  const createApiKey = useMutation({
    mutationFn: (data: z.infer<typeof createApiKeySchema>) =>
      apiRequest('/api/api-keys', 'POST', data),
    onSuccess: () => {
      toast({
        title: "API Key criada",
        description: "Sua nova API key foi criada com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar API key",
        description: error.message || "Erro ao criar API key",
        variant: "destructive"
      });
    }
  });

  const onCreateApiKey = (data: z.infer<typeof createApiKeySchema>) => {
    createApiKey.mutate(data);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    toast({
      title: "Copiado!",
      description: "API key copiada para a área de transferência"
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Necessário</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar a API pública.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Pública</h1>
          <p className="text-gray-600">Gerencie suas API keys e integre sua aplicação com a Evento+</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.open('/api/v1/docs', '_blank')}>
            <BookOpen className="w-4 h-4 mr-2" />
            Documentação
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova API Key</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateApiKey)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Aplicação de Produção" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rateLimitPerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Requisições/Hora</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={100} 
                            max={10000} 
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                      <FormItem>
                        <FormLabel>Permissões</FormLabel>
                        <div className="space-y-3">
                          {availablePermissions.map((permission) => (
                            <FormField
                              key={permission.value}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, permission.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== permission.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium">
                                      {permission.label}
                                    </FormLabel>
                                    <p className="text-xs text-gray-500">
                                      {permission.description}
                                    </p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createApiKey.isPending} className="w-full">
                    {createApiKey.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Criar API Key
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Uso & Analytics</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Keys Ativas</p>
                    <p className="text-2xl font-bold">{mockApiKeys.filter(k => k.isActive).length}</p>
                  </div>
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Requisições Hoje</p>
                    <p className="text-2xl font-bold">541</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold">95.7%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tempo de Resposta</p>
                    <p className="text-2xl font-bold">245ms</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Endpoints Mais Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats?.topEndpoints.map((endpoint, index) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{endpoint.endpoint}</p>
                          <p className="text-sm text-gray-600">{endpoint.count} requisições</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{endpoint.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Status de Erros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(usageStats?.errorBreakdown || {}).map(([code, count]) => (
                    <div key={code} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={code === '200' ? 'default' : 'destructive'}>
                          {code}
                        </Badge>
                        <span className="text-sm">
                          {code === '400' && 'Bad Request'}
                          {code === '401' && 'Unauthorized'}
                          {code === '404' && 'Not Found'}
                          {code === '429' && 'Rate Limited'}
                        </span>
                      </div>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <div className="space-y-4">
            {mockApiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <p className="text-sm text-gray-600">
                          Criada em {formatDate(apiKey.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                        {apiKey.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedApiKey(apiKey.id)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Ver Uso
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={`${apiKey.key.slice(0, 20)}...${apiKey.key.slice(-8)}`}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        >
                          {copiedKey === apiKey.id ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Permissões</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Limite/Hora</Label>
                        <p className="text-sm mt-1">{apiKey.rateLimitPerHour.toLocaleString()} requisições</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Uso Total</Label>
                        <p className="text-sm mt-1">{apiKey.usageCount.toLocaleString()} requisições</p>
                      </div>
                    </div>

                    {apiKey.lastUsedAt && (
                      <div>
                        <Label className="text-sm font-medium">Último Uso</Label>
                        <p className="text-sm mt-1">{formatDate(apiKey.lastUsedAt)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {!selectedApiKey ? (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecione uma API Key</h3>
                <p className="text-gray-600">Escolha uma API key na aba "API Keys" para ver suas estatísticas de uso.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Requisições</p>
                        <p className="text-2xl font-bold">{usageStats?.totalRequests.toLocaleString()}</p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Bem-sucedidas</p>
                        <p className="text-2xl font-bold">{usageStats?.successfulRequests.toLocaleString()}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Com Erro</p>
                        <p className="text-2xl font-bold">{usageStats?.failedRequests.toLocaleString()}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                        <p className="text-2xl font-bold">{usageStats?.averageResponseTime}ms</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Uso nos Últimos 7 Dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageStats?.dailyUsage.map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm">{format(new Date(day.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(day.requests / 600) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">{day.requests}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Começando
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Obtenha sua API Key</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Crie uma nova API key na aba "API Keys" com as permissões necessárias.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("keys")}>
                    <Key className="w-4 h-4 mr-2" />
                    Ir para API Keys
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. Faça sua primeira requisição</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <code className="text-sm">
                      curl -H "X-API-Key: sua_api_key" \<br />
                      &nbsp;&nbsp;https://api.eventoplus.com/v1/events
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. Explore os endpoints</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Consulte a documentação completa da API para ver todos os endpoints disponíveis.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => window.open('/api/v1/docs', '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Documentação
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Exemplos de Código
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">JavaScript</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <code>
                      const response = await fetch('/api/v1/events', {"{"}
                      <br />
                      &nbsp;&nbsp;headers: {"{"}
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;'X-API-Key': 'sua_api_key'
                      <br />
                      &nbsp;&nbsp;{"}"}
                      <br />
                      {"}"});
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Python</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <code>
                      import requests
                      <br />
                      <br />
                      headers = {"{"}'X-API-Key': 'sua_api_key'{"}"}
                      <br />
                      response = requests.get('/api/v1/events', headers=headers)
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Rate Limits</h4>
                  <p className="text-sm text-gray-600">
                    Cada API key tem um limite de requisições por hora. Verifique os headers de resposta:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <code>
                      X-RateLimit-Limit: 1000
                      <br />
                      X-RateLimit-Remaining: 999
                      <br />
                      X-RateLimit-Reset: 1640995200
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Endpoints Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Eventos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-sm">/api/v1/events</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-sm">/api/v1/events/:id</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Serviços</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-sm">/api/v1/services</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-sm">/api/v1/services/:id</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Locais</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-sm">/api/v1/venues</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">GET</Badge>
                      <code className="text-sm">/api/v1/venues/:id</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Parâmetros Comuns</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><code>?page=1</code> - Número da página</p>
                    <p><code>?limit=20</code> - Itens por página</p>
                    <p><code>?category=music</code> - Filtro por categoria</p>
                    <p><code>?location=cidade</code> - Filtro por localização</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}