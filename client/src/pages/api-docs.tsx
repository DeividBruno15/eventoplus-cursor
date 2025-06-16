import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Code, Copy, Globe, Key, ChevronDown, ChevronRight, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  response: any;
  example: string;
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/api/public/events',
    description: 'Listar eventos públicos ativos',
    auth: false,
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Página para paginação (padrão: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Limite de itens por página (padrão: 20)' },
      { name: 'category', type: 'string', required: false, description: 'Filtrar por categoria' },
      { name: 'location', type: 'string', required: false, description: 'Filtrar por localização' }
    ],
    response: {
      data: [
        {
          id: 1,
          title: "Casamento João e Maria",
          category: "Casamento",
          location: "São Paulo, SP",
          date: "2025-07-15",
          budget: 50000,
          expectedAttendees: 150,
          status: "active"
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3
      }
    },
    example: `curl -X GET "https://evento-plus.replit.app/api/public/events?page=1&limit=10" \\
  -H "Content-Type: application/json"`
  },
  {
    method: 'GET',
    path: '/api/public/services',
    description: 'Listar serviços disponíveis',
    auth: false,
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'Filtrar por categoria' },
      { name: 'location', type: 'string', required: false, description: 'Filtrar por localização' },
      { name: 'min_price', type: 'number', required: false, description: 'Preço mínimo' },
      { name: 'max_price', type: 'number', required: false, description: 'Preço máximo' }
    ],
    response: {
      data: [
        {
          id: 1,
          title: "DJ para Festas",
          description: "Serviço de DJ profissional",
          category: "DJ",
          basePrice: 800,
          provider: {
            name: "João DJ",
            rating: 4.8
          },
          location: "São Paulo, SP"
        }
      ]
    },
    example: `curl -X GET "https://evento-plus.replit.app/api/public/services?category=DJ" \\
  -H "Content-Type: application/json"`
  },
  {
    method: 'GET',
    path: '/api/public/venues',
    description: 'Listar espaços para eventos',
    auth: false,
    parameters: [
      { name: 'city', type: 'string', required: false, description: 'Filtrar por cidade' },
      { name: 'capacity', type: 'number', required: false, description: 'Capacidade mínima' },
      { name: 'category', type: 'string', required: false, description: 'Tipo de espaço' }
    ],
    response: {
      data: [
        {
          id: 1,
          name: "Salão Crystal",
          description: "Elegante salão para eventos",
          capacity: 200,
          pricePerHour: 150,
          city: "São Paulo",
          state: "SP",
          amenities: ["Ar condicionado", "Sistema de som", "Decoração"]
        }
      ]
    },
    example: `curl -X GET "https://evento-plus.replit.app/api/public/venues?city=São Paulo" \\
  -H "Content-Type: application/json"`
  },
  {
    method: 'POST',
    path: '/api/webhooks/event-application',
    description: 'Webhook para notificações de candidaturas',
    auth: true,
    parameters: [
      { name: 'webhook_url', type: 'string', required: true, description: 'URL para receber notifications' },
      { name: 'events', type: 'array', required: true, description: 'Tipos de eventos: ["application_created", "application_approved"]' }
    ],
    response: {
      id: 1,
      webhook_url: "https://sua-aplicacao.com/webhook",
      events: ["application_created", "application_approved"],
      active: true,
      created_at: "2025-01-01T00:00:00Z"
    },
    example: `curl -X POST "https://evento-plus.replit.app/api/webhooks/event-application" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "webhook_url": "https://sua-aplicacao.com/webhook",
    "events": ["application_created", "application_approved"]
  }'`
  }
];

export default function APIDocs() {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [testUrl, setTestUrl] = useState("");
  const [testResponse, setTestResponse] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência",
    });
  };

  const testEndpoint = async (endpoint: APIEndpoint) => {
    try {
      const url = `${window.location.origin}${endpoint.path}`;
      setTestUrl(url);
      
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...(endpoint.auth ? { 'Authorization': 'Bearer YOUR_API_KEY' } : {})
        }
      });
      
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResponse(`Erro: ${error}`);
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={`${colors[method as keyof typeof colors]} font-mono`}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Globe className="h-8 w-8 text-[#3C5BFA]" />
        <div>
          <h1 className="text-3xl font-bold text-black">API Pública</h1>
          <p className="text-gray-600">Documentação da API REST para integração com sistemas externos</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="authentication">Autenticação</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">Teste da API</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre a API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A API pública do Evento+ permite que desenvolvedores integrem nossos dados de eventos, 
                serviços e espaços em suas próprias aplicações. Nossa API RESTful utiliza JSON para 
                todas as respostas e segue padrões da indústria.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">URL Base</h3>
                  <code className="text-sm bg-white p-2 rounded border block">
                    https://evento-plus.replit.app/api/public
                  </code>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Formato de Resposta</h3>
                  <code className="text-sm bg-white p-2 rounded border block">
                    Content-Type: application/json
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Recursos Disponíveis:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Eventos:</strong> Consultar eventos públicos ativos</li>
                  <li>• <strong>Serviços:</strong> Listar prestadores de serviços disponíveis</li>
                  <li>• <strong>Espaços:</strong> Explorar locais para eventos</li>
                  <li>• <strong>Webhooks:</strong> Receber notificações em tempo real</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limites de Taxa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#3C5BFA]">1000</div>
                  <div className="text-sm text-gray-600">Requisições/hora</div>
                  <div className="text-xs text-gray-500 mt-1">Sem autenticação</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#3C5BFA]">5000</div>
                  <div className="text-sm text-gray-600">Requisições/hora</div>
                  <div className="text-xs text-gray-500 mt-1">Com API Key</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#3C5BFA]">∞</div>
                  <div className="text-sm text-gray-600">Requisições/hora</div>
                  <div className="text-xs text-gray-500 mt-1">Plano Enterprise</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Autenticação via API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Para endpoints que requerem autenticação, utilize uma API Key no header Authorization.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Como obter sua API Key:</h3>
                <ol className="space-y-1 text-sm">
                  <li>1. Faça login na sua conta Evento+</li>
                  <li>2. Acesse Configurações → Integrações</li>
                  <li>3. Clique em "Gerar Nova API Key"</li>
                  <li>4. Copie e armazene a chave com segurança</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Exemplo de uso:</h3>
                <pre className="bg-black text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "https://evento-plus.replit.app/api/protected/my-events" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`curl -X GET "https://evento-plus.replit.app/api/protected/my-events" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          {API_ENDPOINTS.map((endpoint, index) => (
            <Card key={index}>
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        {getMethodBadge(endpoint.method)}
                        <code className="font-mono text-sm">{endpoint.path}</code>
                        {endpoint.auth && (
                          <Badge variant="outline" className="text-xs">
                            <Key className="h-3 w-3 mr-1" />
                            Auth
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">{endpoint.description}</p>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    {endpoint.parameters && (
                      <div>
                        <h4 className="font-semibold mb-2">Parâmetros:</h4>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {param.name}
                              </code>
                              <Badge variant={param.required ? "destructive" : "secondary"} className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">obrigatório</Badge>
                              )}
                              <span className="text-gray-600">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Resposta de Exemplo:</h4>
                      <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Exemplo cURL:</h4>
                      <pre className="bg-black text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
                        {endpoint.example}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(endpoint.example)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teste da API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Teste os endpoints diretamente aqui na documentação:</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Endpoints Disponíveis:</h3>
                  {API_ENDPOINTS.map((endpoint, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedEndpoint(endpoint);
                        testEndpoint(endpoint);
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {getMethodBadge(endpoint.method)}
                      <code className="ml-2">{endpoint.path}</code>
                    </Button>
                  ))}
                </div>

                <div className="space-y-4">
                  {testUrl && (
                    <div>
                      <h3 className="font-semibold mb-2">URL Testada:</h3>
                      <code className="block bg-gray-100 p-2 rounded text-sm">{testUrl}</code>
                    </div>
                  )}

                  {testResponse && (
                    <div>
                      <h3 className="font-semibold mb-2">Resposta:</h3>
                      <pre className="bg-gray-50 p-3 rounded text-xs max-h-60 overflow-y-auto">
                        {testResponse}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}