import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", {
        email: data.email
      });

      setEmailSent(true);
      setSentEmail(data.email);
      
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!sentEmail) return;
    
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", {
        email: sentEmail
      });
      
      toast({
        title: "E-mail reenviado!",
        description: "Verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar e-mail",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center">
            <Link href="/">
              <img 
                src={eventoLogo} 
                alt="Evento+" 
                className="h-12 mx-auto mb-4"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              E-mail enviado!
            </h1>
            <p className="text-gray-600 mt-2">
              Instruções para redefinir sua senha foram enviadas
            </p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-lg text-green-800">
                E-mail de redefinição enviado
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Enviamos as instruções para:
                </p>
                <p className="font-semibold text-gray-900 bg-gray-100 p-2 rounded">
                  {sentEmail}
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Siga estas etapas:</strong>
                  <br />
                  1. Verifique sua caixa de entrada (e spam)
                  <br />
                  2. Clique no link de redefinição no e-mail
                  <br />
                  3. Crie uma nova senha segura
                  <br />
                  4. Faça login com sua nova senha
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Não encontrou o e-mail?</strong>
                  <br />
                  • Verifique sua caixa de spam/lixo eletrônico
                  <br />
                  • O e-mail pode demorar alguns minutos para chegar
                  <br />
                  • Verifique se o endereço está correto
                  <br />
                  • Use o botão "Reenviar" se necessário
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? "Reenviando..." : "Reenviar e-mail"}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/">
            <img 
              src={eventoLogo} 
              alt="Evento+" 
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Esqueceu sua senha?
          </h1>
          <p className="text-gray-600 mt-2">
            Digite seu e-mail para receber instruções de redefinição
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>
              Informe o e-mail cadastrado em sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail cadastrado</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#3C5BFA] hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar instruções"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            Lembrou sua senha?{" "}
            <Link href="/auth/login" className="text-[#3C5BFA] hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}