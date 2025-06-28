import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Token de verificação não encontrado na URL.');
          return;
        }

        // Verify email with the API
        const response = await apiRequest("GET", `/api/auth/verify-email?token=${token}`);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message);
          setUserEmail(response.user?.email || '');
          
          // Clear any stored registration email
          localStorage.removeItem('registrationEmail');
        } else {
          setStatus('error');
          setMessage(response.message || 'Erro na verificação do e-mail.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Erro ao verificar e-mail. O link pode ter expirado.');
      }
    };

    verifyEmail();
  }, []);

  const handleContinue = () => {
    if (status === 'success') {
      setLocation('/auth/login');
    } else {
      setLocation('/auth/email-sent');
    }
  };

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
            Verificação de E-mail
          </h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              {status === 'loading' && (
                <div className="bg-blue-100">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="bg-green-100">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-100">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-lg">
              {status === 'loading' && 'Verificando e-mail...'}
              {status === 'success' && 'E-mail verificado com sucesso!'}
              {status === 'error' && 'Erro na verificação'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <div className="text-center">
                <p className="text-gray-600">
                  Aguarde enquanto verificamos seu e-mail...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>

                {userEmail && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">
                      E-mail confirmado:
                    </p>
                    <p className="font-semibold text-gray-900 bg-green-50 p-2 rounded">
                      {userEmail}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Sua conta foi ativada! Agora você pode fazer login e aproveitar todos os recursos do Evento+.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Possíveis causas:
                  </p>
                  <ul className="text-sm text-gray-600 text-left space-y-1">
                    <li>• O link de verificação expirou (válido por 24 horas)</li>
                    <li>• O link já foi usado anteriormente</li>
                    <li>• O link está incorreto ou foi corrompido</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {status === 'success' && (
                <Button 
                  onClick={handleContinue}
                  className="w-full"
                >
                  Fazer Login
                </Button>
              )}

              {status === 'error' && (
                <div className="space-y-2">
                  <Button 
                    onClick={handleContinue}
                    className="w-full"
                    variant="outline"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar e-mail de verificação
                  </Button>
                  
                  <Link href="/auth/register-step1">
                    <Button variant="ghost" className="w-full">
                      Criar nova conta
                    </Button>
                  </Link>
                </div>
              )}

              <div className="text-center pt-4 border-t">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
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