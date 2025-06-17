import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginFormEnhanced() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1000);
      } else {
        // Tratamento específico de erros
        if (result.error?.includes("não encontrado") || result.error?.includes("not found")) {
          setError("Email não cadastrado. Verifique o email ou registre-se.");
        } else if (result.error?.includes("senha") || result.error?.includes("password")) {
          setError("Senha incorreta. Tente novamente.");
        } else if (result.error?.includes("muitas tentativas") || result.error?.includes("many attempts")) {
          setError("Muitas tentativas de login. Tente novamente em alguns minutos.");
        } else {
          setError(result.error || "Erro ao fazer login. Tente novamente.");
        }
      }
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-black">Login realizado com sucesso!</h3>
        <p className="text-gray-600">Redirecionando para o dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
          placeholder="seu@email.com"
          className={form.formState.errors.email ? "border-red-500" : ""}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
          placeholder="Sua senha"
          className={form.formState.errors.password ? "border-red-500" : ""}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-blue-700" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Não tem uma conta?{" "}
        <button
          type="button"
          onClick={() => setLocation("/auth/register")}
          className="text-primary hover:underline font-medium"
        >
          Cadastre-se aqui
        </button>
      </div>
    </form>
  );
}