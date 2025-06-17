import { Wifi, RefreshCw, Home, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function OfflinePage() {
  const [, setLocation] = useLocation();

  const handleRetry = () => {
    window.location.reload();
  };

  const goToPage = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
            <Wifi className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Você está offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            Parece que você não tem conexão com a internet. Algumas funcionalidades podem estar limitadas.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Offline Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              Funcionalidades disponíveis offline:
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage('/dashboard')}
                className="justify-start"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard (dados em cache)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage('/chat')}
                className="justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Mensagens (últimas conversas)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage('/events')}
                className="justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Eventos (dados salvos)
              </Button>
            </div>
          </div>

          {/* Retry Connection */}
          <div className="pt-4 border-t">
            <Button 
              onClick={handleRetry}
              className="w-full"
              style={{ backgroundColor: '#3C5BFA' }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar reconectar
            </Button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-3 rounded-lg text-left">
            <h4 className="font-medium text-blue-900 text-sm mb-1">
              Dicas para melhorar sua conexão:
            </h4>
            <ul className="text-blue-800 text-xs space-y-1">
              <li>• Verifique sua conexão Wi-Fi ou dados móveis</li>
              <li>• Tente se aproximar do roteador Wi-Fi</li>
              <li>• Reinicie seu roteador se necessário</li>
              <li>• Verifique se não há problemas com seu provedor</li>
            </ul>
          </div>

          {/* Sync Status */}
          <div className="bg-orange-50 p-3 rounded-lg text-left">
            <h4 className="font-medium text-orange-900 text-sm mb-1">
              Sincronização automática
            </h4>
            <p className="text-orange-800 text-xs">
              Suas ações serão sincronizadas automaticamente quando a conexão for restaurada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}