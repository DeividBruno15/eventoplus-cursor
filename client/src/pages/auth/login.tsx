import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Calendar, Users, MapPin, Star, PartyPopper, Heart, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type LoginForm = z.infer<typeof loginSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoadingForgot, setIsLoadingForgot] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Evento+",
        });
        
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1000);
      } else {
        // Check if should redirect for email verification
        if ((result as any).redirectTo) {
          setLocation((result as any).redirectTo + `?email=${encodeURIComponent(data.email)}`);
          return;
        }
        
        // Tratamento específico de erros
        let errorMessage = "Erro ao fazer login. Tente novamente.";
        
        if (result.error?.includes("não encontrado") || result.error?.includes("not found")) {
          errorMessage = "Email não cadastrado. Verifique o email ou registre-se.";
        } else if (result.error?.includes("senha") || result.error?.includes("password") || result.error?.includes("Credenciais")) {
          errorMessage = "Senha incorreta. Tente novamente.";
        } else if (result.error?.includes("muitas tentativas") || result.error?.includes("many attempts")) {
          errorMessage = "Muitas tentativas de login. Tente novamente em alguns minutos.";
        } else if (result.error?.includes("E-mail não verificado")) {
          // Don't show toast for email verification error since we're redirecting
          return;
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro de conexão",
        description: "Verifique sua internet e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoadingForgot(true);
    try {
      const response = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response) {
        toast({
          title: "Email enviado!",
          description: "Verifique seu email para redefinir sua senha.",
        });
        setLocation(`/auth/email-sent?email=${encodeURIComponent(data.email)}&type=reset`);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingForgot(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animated Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3C5BFA] to-[#5B7CFF] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-float"></div>
          <div className="absolute top-40 right-32 w-20 h-20 bg-white rounded-full animate-float-slow"></div>
          <div className="absolute bottom-32 left-40 w-24 h-24 bg-white rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-white rounded-full animate-float-slow"></div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col justify-center items-start px-16 relative z-10">
          <div className="text-white mb-8 animate-fade-in-up">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              O evento perfeito
              <br />
              começa aqui.
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Conectamos quem organiza, quem realiza e onde
              <br />
              acontece.
            </p>
          </div>

          {/* Animated Feature Icons */}
          <div className="grid grid-cols-2 gap-6 mb-8 animate-fade-in-up animate-delay-300">
            <div className="flex items-center space-x-3 text-white animate-fade-in-left animate-delay-500">
              <div className="p-3 bg-white bg-opacity-20 rounded-full animate-glow">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Eventos Únicos</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white animate-fade-in-right animate-delay-700">
              <div className="p-3 bg-white bg-opacity-20 rounded-full animate-glow">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Prestadores Qualificados</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white animate-fade-in-left animate-delay-900">
              <div className="p-3 bg-white bg-opacity-20 rounded-full animate-glow">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Espaços Incríveis</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white animate-fade-in-right animate-delay-1000">
              <div className="p-3 bg-white bg-opacity-20 rounded-full animate-glow">
                <Star className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Experiências Memoráveis</span>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-32 right-16 animate-float-slow">
            <PartyPopper className="w-8 h-8 text-white opacity-70" />
          </div>
          <div className="absolute bottom-40 right-24 animate-float">
            <Heart className="w-6 h-6 text-white opacity-60" />
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <img 
              src={eventoLogo} 
              alt="Evento+"
              className="h-8 object-contain mx-auto mb-8"
            />
            
            {!showForgotPassword ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Entrar na sua conta
                </h2>
                <p className="text-gray-600 text-sm">
                  Digite suas credenciais para acessar o Evento+
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Esqueceu sua senha?
                </h2>
                <p className="text-gray-600 text-sm">
                  Digite seu email para receber as instruções de redefinição
                </p>
              </>
            )}
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up animate-delay-200">
            {!showForgotPassword ? (
              // Login Form
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="seu@email.com" 
                              type="email" 
                              className="h-12 border-gray-200 focus:border-[#3C5BFA] focus:ring-[#3C5BFA] rounded-lg"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Senha</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              className="h-12 border-gray-200 focus:border-[#3C5BFA] focus:ring-[#3C5BFA] rounded-lg"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-[#3C5BFA] hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>

                {/* Login Links */}
                <div className="mt-6 text-center space-y-4">
                  <button 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#3C5BFA] hover:text-blue-700 hover:underline block transition-colors w-full"
                  >
                    Esqueceu sua senha?
                  </button>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Não tem uma conta?{" "}
                      <Link 
                        href="/auth/register-step1" 
                        className="text-[#3C5BFA] hover:text-blue-700 font-medium hover:underline transition-colors"
                      >
                        Cadastre-se
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Forgot Password Form
              <>
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(onSubmitForgotPassword)} className="space-y-6">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="seu@email.com" 
                                type="email" 
                                className="h-12 pl-10 border-gray-200 focus:border-[#3C5BFA] focus:ring-[#3C5BFA] rounded-lg"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-[#3C5BFA] hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg" 
                      disabled={isLoadingForgot}
                    >
                      {isLoadingForgot ? "Enviando..." : "Enviar instrução"}
                    </Button>
                  </form>
                </Form>

                {/* Forgot Password Links */}
                <div className="mt-6 text-center space-y-4">
                  <button 
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center justify-center text-sm text-gray-600 hover:text-[#3C5BFA] transition-colors w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o login
                  </button>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Não tem uma conta?{" "}
                      <Link 
                        href="/auth/register-step1" 
                        className="text-[#3C5BFA] hover:text-blue-700 font-medium hover:underline transition-colors"
                      >
                        Cadastre-se
                      </Link>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
