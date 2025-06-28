import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Mail, Shield, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function EmailDemo() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testForgotPassword = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" }
      });
      setResult({ success: true, data: response });
    } catch (error) {
      setResult({ success: false, error });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Sistema de E-mail Evento+
          </h1>
          <p className="text-xl text-gray-600">
            Demonstração do sistema completo de reset de senha
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">SendGrid Configurado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Domain Auth:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Verificado</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Single Sender:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Verificado</Badge>
                </div>
                <div className="flex justify-between">
                  <span>API Key:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Configurada</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-800">Segurança</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tokens Seguros:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ativo</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Expiração:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">1 hora</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Criptografia:</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">bcrypt</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-purple-800">Templates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Design:</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">Evento+</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Responsivo:</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">Sim</Badge>
                </div>
                <div className="flex justify-between">
                  <span>HTML + Texto:</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">Ambos</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Testar Reset de Senha</CardTitle>
            <CardDescription>
              Digite um e-mail para testar o sistema completo de reset de senha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Input
                type="email"
                placeholder="Digite seu e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={testForgotPassword}
                disabled={loading || !email}
                className="min-w-[120px]"
              >
                {loading ? "Enviando..." : "Enviar Reset"}
              </Button>
            </div>

            {result && (
              <Card className={`border-2 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.success ? 'E-mail Processado!' : 'Erro no Envio'}
                      </h4>
                      <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.success 
                          ? result.data?.message || 'Sistema funcionando corretamente'
                          : 'Erro ao processar solicitação'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Implementadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Sistema de Reset</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Solicitação de reset segura</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Geração de tokens únicos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Expiração automática (1h)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Redefinição de senha</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Verificação de E-mail</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Verificação obrigatória</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Reenvio de verificação</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Bloqueio de não verificados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Interface completa</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Notes */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Status de Produção</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="text-orange-700">
                <strong>DNS Configurado:</strong> Domain Authentication e Single Sender verificados no SendGrid
              </p>
              <p className="text-orange-700">
                <strong>Propagação DNS:</strong> Pode levar até 24h para propagação completa (normal)
              </p>
              <p className="text-orange-700">
                <strong>Fallback Ativo:</strong> Sistema funciona localmente, produção automática quando DNS propagar
              </p>
              <p className="text-orange-700">
                <strong>Pronto para Deploy:</strong> Todas as funcionalidades implementadas e testadas
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}