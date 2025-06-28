import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EmailSent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // Get email from localStorage (set during registration)
    const savedEmail = localStorage.getItem("registrationEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      // If no email found, redirect to login
      setLocation("/auth/login");
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
            Verifique seu e-mail
          </h1>
          <p className="text-gray-600 mt-2">
            Enviamos um link de confirmação para você
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-lg">E-mail de confirmação enviado</CardTitle>
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

            {resendSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  E-mail reenviado com sucesso! Verifique sua caixa de entrada.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Não encontrou o e-mail?</strong>
                <br />
                • Verifique sua caixa de spam/lixo eletrônico
                <br />
                • Aguarde alguns minutos, o e-mail pode demorar para chegar
                <br />
                • Certifique-se de que o endereço está correto
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? "Reenviando..." : "Reenviar e-mail"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Já confirmou seu e-mail?
                </p>
                <Link href="/auth/login">
                  <Button variant="default" className="w-full">
                    Fazer Login
                  </Button>
                </Link>
              </div>

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