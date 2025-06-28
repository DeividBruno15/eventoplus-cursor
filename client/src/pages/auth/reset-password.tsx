import { useState, useEffect } from "react";
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
import { ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string().min(8, "Confirmação deve ter pelo menos 8 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string>("");
  const [validToken, setValidToken] = useState<boolean | null>(null);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Get token from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    
    if (!resetToken) {
      setValidToken(false);
      return;
    }
    
    setToken(resetToken);
    
    // Validate token
    const validateToken = async () => {
      try {
        await apiRequest("GET", `/api/auth/validate-reset-token?token=${encodeURIComponent(resetToken)}`);
        setValidToken(true);
      } catch (error: any) {
        setValidToken(false);
        toast({
          title: "Link inválido ou expirado",
          description: "Este link de redefinição não é mais válido.",
          variant: "destructive",
        });
      }
    };
    
    validateToken();
  }, [toast]);

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", {
        token: token,
        password: data.password
      });

      setResetSuccess(true);
      
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength < 3) return { level: "Fraca", color: "text-red-600", bg: "bg-red-200" };
    if (strength < 4) return { level: "Média", color: "text-yellow-600", bg: "bg-yellow-200" };
    return { level: "Forte", color: "text-green-600", bg: "bg-green-200" };
  };

  const password = form.watch("password");
  const passwordStrength = password ? getPasswordStrength(password) : null;

  if (validToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/">
              <img 
                src={eventoLogo} 
                alt="Evento+" 
                className="h-12 mx-auto mb-4"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Link inválido
            </h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-lg text-red-800">
                Link de redefinição inválido ou expirado
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Este link pode ter expirado ou já foi usado. Links de redefinição são válidos por apenas 1 hora.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Link href="/auth/forgot-password">
                  <Button className="w-full bg-[#3C5BFA] hover:bg-blue-700">
                    Solicitar novo link
                  </Button>
                </Link>

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
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/">
              <img 
                src={eventoLogo} 
                alt="Evento+" 
                className="h-12 mx-auto mb-4"
              />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Senha redefinida!
            </h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-lg text-green-800">
                Sua senha foi alterada com sucesso
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Agora você pode fazer login com sua nova senha.
                </AlertDescription>
              </Alert>

              <Link href="/auth/login">
                <Button className="w-full bg-[#3C5BFA] hover:bg-blue-700">
                  Fazer login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3C5BFA] mx-auto"></div>
                <p className="mt-2 text-gray-600">Validando link...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/">
            <img 
              src={eventoLogo} 
              alt="Evento+" 
              className="h-12 mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Redefinir senha
          </h1>
          <p className="text-gray-600 mt-2">
            Digite sua nova senha
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova senha</CardTitle>
            <CardDescription>
              Escolha uma senha forte e segura
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="••••••••" 
                            type={showPassword ? "text" : "password"}
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      {passwordStrength && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`h-2 w-full rounded ${passwordStrength.bg}`}>
                            <div 
                              className={`h-full bg-current rounded transition-all ${passwordStrength.color}`}
                              style={{ width: `${(getPasswordStrength(password).level === 'Fraca' ? 33 : getPasswordStrength(password).level === 'Média' ? 66 : 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs ${passwordStrength.color}`}>
                            {passwordStrength.level}
                          </span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="••••••••" 
                            type={showConfirmPassword ? "text" : "password"}
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Dicas para uma senha forte:</strong>
                    <br />
                    • Pelo menos 8 caracteres
                    <br />
                    • Combine letras maiúsculas e minúsculas
                    <br />
                    • Inclua números e símbolos
                    <br />
                    • Evite informações pessoais
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full bg-[#3C5BFA] hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Redefinindo..." : "Redefinir senha"}
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
      </div>
    </div>
  );
}