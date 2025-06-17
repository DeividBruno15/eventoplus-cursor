import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-4">Bem-vindo ao Evento+</h1>
        <p className="text-gray-600 mb-8">Comece seu cadastro em 3 etapas simples</p>
        
        <Button 
          onClick={() => setLocation("/auth/register-step1")}
          className="bg-primary hover:bg-blue-700 px-8 py-3"
        >
          Começar Cadastro
        </Button>
        
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <button
              onClick={() => setLocation("/auth/login")}
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}