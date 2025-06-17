import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function OfflinePage() {
  const [, setLocation] = useLocation();

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  const goHome = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Você está offline
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              style={{ backgroundColor: '#3C5BFA' }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={goHome} 
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 pt-4">
            <p>Algumas funcionalidades podem estar limitadas enquanto offline.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}