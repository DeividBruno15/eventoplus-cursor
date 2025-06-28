import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EmailNotVerified() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('email');
    
    if (urlEmail) {
      setEmail(urlEmail);
    } else {
      // Try to get from localStorage as fallback
      const savedEmail = localStorage.getItem("unverifiedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        // If no email found, redirect to login
        setLocation("/auth/login");
      }
    }
  }, [setLocation]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      await apiRequest("POST", "/api/auth/resend-verification", {
        email: email
      });

      setResendSuccess(true);
      toast({
        title: "E-mail reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar e-mail",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!email) return;

    try {
      const response = await apiRequest("GET", `/api/auth/check-verification?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.emailVerified) {
        toast({
          title: "E-mail verificado!",
          description: "Você já pode fazer login.",
        });
        setLocation("/auth/login");
      } else {
        toast({
          title: "E-mail ainda não verificado",
          description: "Verifique sua caixa de entrada e clique no link de confirmação.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao verificar status",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!email) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/">
            <img 
              src="/logo-evento-plus.png" 
              alt="Evento+" 
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            E-mail não verificado
          </h1>
          <p className="text-gray-600 mt-2">
            Você precisa confirmar seu e-mail para continuar
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-lg text-orange-800">
              Confirmação de e-mail pendente
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Enviamos um link de verificação para:
              </p>
              <p className="font-semibold text-gray-900 bg-gray-100 p-2 rounded">
                {email}
              </p>
            </div>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Para fazer login, você precisa confirmar seu e-mail primeiro.</strong>
                <br />
                Verifique sua caixa de entrada e clique no link de confirmação.
              </AlertDescription>
            </Alert>

            {resendSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  E-mail reenviado com sucesso! Verifique sua caixa de entrada.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Não encontrou o e-mail?</strong>
                <br />
                • Verifique sua caixa de spam/lixo eletrônico
                <br />
                • Aguarde alguns minutos, o e-mail pode demorar para chegar
                <br />
                • Certifique-se de que o endereço está correto
                <br />
                • Use o botão "Reenviar" se necessário
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar e-mail de confirmação
                  </>
                )}
              </Button>

              <Button 
                onClick={handleCheckVerification}
                className="w-full"
                variant="default"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Já confirmei, verificar status
              </Button>

              <div className="text-center pt-4 border-t">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            Precisa de ajuda? Entre em contato conosco em{" "}
            <a href="mailto:suporte@eventoplus.com.br" className="text-blue-600 hover:underline">
              suporte@eventoplus.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}