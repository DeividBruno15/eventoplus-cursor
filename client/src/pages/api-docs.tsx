import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Play, Key, Globe, Code, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  auth: 'required' | 'optional' | 'none';
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
  example?: string;
}

const apiEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    endpoint: '/api/public/events',
    description: 'Lista eventos públicos com filtros opcionais',
    auth: 'none',
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'Categoria do evento' },
      { name: 'location', type: 'string', required: false, description: 'Localização' },
      { name: 'page', type: 'number', required: false, description: 'Página (padrão: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Itens por página (padrão: 10)' }
    ],
    response: `{
  "events": [
    {
      "id": 1,
      "title": "Festival de Música",
      "category": "Entretenimento",
      "location": "São Paulo, SP",
      "budget": "15000.00",
      "status": "active",
      "createdAt": "2024-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}`,
    example: 'curl -X GET "https://evento-plus.app/api/public/events?category=Entretenimento&limit=5"'
  },
  {
    method: 'GET',
    endpoint: '/api/public/services',
    description: 'Lista prestadores de serviços públicos',
    auth: 'none',
    parameters: [
      { name: 'category', type: 'string', required: false, description: 'Categoria do serviço' },
      { name: 'location', type: 'string', required: false, description: 'Localização' },
      { name: 'rating', type: 'number', required: false, description: 'Avaliação mínima' }
    ],
    response: `{
  "services": [
    {
      "id": 1,
      "name": "DJ Paulo Silva",
      "category": "Entretenimento",
      "rating": 4.8,
      "location": "Rio de Janeiro, RJ",
      "priceRange": "500-2000"
    }
  ]
}`,
    example: 'curl -X GET "https://evento-plus.app/api/public/services?category=Alimentação"'
  },
  {
    method: 'GET',
    endpoint: '/api/public/venues',
    description: 'Lista espaços para eventos públicos',
    auth: 'none',
    parameters: [
      { name: 'capacity', type: 'number', required: false, description: 'Capacidade mínima' },
      { name: 'location', type: 'string', required: false, description: 'Localização' },
      { name: 'amenities', type: 'string', required: false, description: 'Comodidades (separadas por vírgula)' }
    ],
    response: `{
  "venues": [
    {
      "id": 1,
      "name": "Salão Premium",
      "capacity": 200,
      "location": "Belo Horizonte, MG",
      "amenities": ["ar-condicionado", "som", "estacionamento"],
      "pricePerHour": "350.00"
    }
  ]
}`,
    example: 'curl -X GET "https://evento-plus.app/api/public/venues?capacity=100"'
  },
  {
    method: 'POST',
    endpoint: '/api/public/webhook',
    description: 'Endpoint para receber webhooks de terceiros',
    auth: 'required',
    parameters: [
      { name: 'event_type', type: 'string', required: true, description: 'Tipo do evento' },
      { name: 'data', type: 'object', required: true, description: 'Dados do evento' },
      { name: 'timestamp', type: 'string', required: true, description: 'Timestamp do evento' }
    ],
    response: `{
  "success": true,
  "message": "Webhook processado com sucesso",
  "id": "webhook_12345"
}`,
    example: `curl -X POST "https://evento-plus.app/api/public/webhook" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"event_type": "booking_created", "data": {...}}'`
  }
];

export default function APIDocumentation() {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);
  const [testUrl, setTestUrl] = useState('');
  const [testBody, setTestBody] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Código copiado para a área de transferência",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código",
        variant: "destructive",
      });
    }
  };

  const testEndpoint = async () => {
    setIsLoading(true);
    try {
      const url = testUrl || `https://evento-plus.app${selectedEndpoint.endpoint}`;
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (selectedEndpoint.method !== 'GET' && testBody) {
        options.body = testBody;
      }

      const response = await fetch(url, options);
      const data = await response.json();
      
      setTestResponse(JSON.stringify(data, null, 2));
      
      toast({
        title: "Teste Executado",
        description: `Status: ${response.status}`,
      });
    } catch (error) {
      setTestResponse(JSON.stringify({ error: 'Erro na requisição' }, null, 2));
      toast({
        title: "Erro no Teste",
        description: "Não foi possível executar a requisição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthBadge = (auth: string) => {
    switch (auth) {
      case 'required': return <Badge variant="destructive">API Key Obrigatória</Badge>;
      case 'optional': return <Badge variant="secondary">API Key Opcional</Badge>;
      case 'none': return <Badge variant="outline">Público</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-8 h-8 text-[#3C5BFA]" />
            <h1 className="text-3xl font-bold text-gray-900">API Pública Evento+</h1>
          </div>
          <p className="text-lg text-gray-600">
            Documentação completa da API pública para integração com sistemas externos
          </p>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Autenticação</TabsTrigger>
            <TabsTrigger value="testing">Teste da API</TabsTrigger>
            <TabsTrigger value="examples">Exemplos</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Lista de endpoints */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Code className="w-5 h-5" />
                      <span>Endpoints Disponíveis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedEndpoint === endpoint 
                            ? 'bg-[#3C5BFA] text-white' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedEndpoint(endpoint)}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedEndpoint === endpoint 
                              ? 'bg-white text-[#3C5BFA]' 
                              : getMethodColor(endpoint.method)
                          }`}>
                            {endpoint.method}
                          </span>
                          {getAuthBadge(endpoint.auth)}
                        </div>
                        <p className="text-sm mt-1 font-mono">
                          {endpoint.endpoint}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes do endpoint selecionado */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getMethodColor(selectedEndpoint.method)}>
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-lg font-mono">{selectedEndpoint.endpoint}</code>
                      </div>
                      {getAuthBadge(selectedEndpoint.auth)}
                    </div>
                    <p className="text-gray-600">{selectedEndpoint.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Parâmetros */}
                    {selectedEndpoint.parameters && (
                      <div>
                        <h3 className="font-semibold mb-3">Parâmetros</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Nome</th>
                                <th className="text-left p-2">Tipo</th>
                                <th className="text-left p-2">Obrigatório</th>
                                <th className="text-left p-2">Descrição</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedEndpoint.parameters.map((param, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2 font-mono">{param.name}</td>
                                  <td className="p-2">
                                    <Badge variant="outline">{param.type}</Badge>
                                  </td>
                                  <td className="p-2">
                                    {param.required ? (
                                      <Badge variant="destructive">Sim</Badge>
                                    ) : (
                                      <Badge variant="secondary">Não</Badge>
                                    )}
                                  </td>
                                  <td className="p-2">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Resposta */}
                    {selectedEndpoint.response && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Resposta de Exemplo</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(selectedEndpoint.response!)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          {selectedEndpoint.response}
                        </pre>
                      </div>
                    )}

                    {/* Exemplo de uso */}
                    {selectedEndpoint.example && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Exemplo de Uso (cURL)</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(selectedEndpoint.example!)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          {selectedEndpoint.example}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authentication">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Autenticação da API</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">API Key</h3>
                  <p className="text-gray-600 mb-4">
                    Para endpoints que requerem autenticação, use sua API key no header Authorization:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Como Obter sua API Key</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Faça login na sua conta Evento+</li>
                    <li>Acesse as configurações do perfil</li>
                    <li>Navegue até a seção "API"</li>
                    <li>Gere uma nova API key</li>
                    <li>Copie e guarde a chave em local seguro</li>
                  </ol>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Limites de Taxa</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Endpoints Públicos</h4>
                      <p className="text-blue-700">1000 requisições por hora</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Endpoints Autenticados</h4>
                      <p className="text-green-700">5000 requisições por hora</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Teste da API</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Endpoint Selecionado
                      </label>
                      <div className="flex items-center space-x-2">
                        <Badge className={getMethodColor(selectedEndpoint.method)}>
                          {selectedEndpoint.method}
                        </Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {selectedEndpoint.endpoint}
                        </code>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        URL Completa
                      </label>
                      <Input
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        placeholder={`https://evento-plus.app${selectedEndpoint.endpoint}`}
                      />
                    </div>

                    {selectedEndpoint.method !== 'GET' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Body (JSON)
                        </label>
                        <Textarea
                          value={testBody}
                          onChange={(e) => setTestBody(e.target.value)}
                          placeholder='{"key": "value"}'
                          rows={6}
                        />
                      </div>
                    )}

                    <Button 
                      onClick={testEndpoint}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Executando..." : "Testar Endpoint"}
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Resposta
                    </label>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm h-80">
                      {testResponse || 'Execute um teste para ver a resposta...'}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript/Node.js</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Listar eventos públicos
const response = await fetch('/api/public/events');
const data = await response.json();

// Com autenticação
const response = await fetch('/api/public/webhook', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event_type: 'booking_created',
    data: { eventId: 123 }
  })
});`}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Python</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import requests

# Listar eventos públicos
response = requests.get('https://evento-plus.app/api/public/events')
events = response.json()

# Com autenticação
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
data = {
    'event_type': 'booking_created',
    'data': {'eventId': 123}
}
response = requests.post(
    'https://evento-plus.app/api/public/webhook',
    headers=headers,
    json=data
)`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}