import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building, Megaphone } from "lucide-react";
import { useLocation } from "wouter";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

export default function RegisterStep1() {
  const [, setLocation] = useLocation();
  const [selectedUserType, setSelectedUserType] = useState<string>("");

  const userTypes = [
    {
      id: "prestador",
      title: "Prestador",
      description: "Seja encontrado por pessoas que buscam seus serviços para eventos",
      icon: User,
      color: "border-blue-200 hover:border-blue-400"
    },
    {
      id: "contratante", 
      title: "Contratante",
      description: "Crie eventos e encontre profissionais qualificados para seus eventos",
      icon: Building,
      color: "border-green-200 hover:border-green-400"
    },
    {
      id: "anunciante",
      title: "Anunciante", 
      description: "Divulgue seus espaços para pessoas que procuram onde realizar eventos",
      icon: Megaphone,
      color: "border-orange-200 hover:border-orange-400"
    }
  ];

  const handleContinue = () => {
    if (selectedUserType) {
      setLocation(`/auth/register-step2?userType=${selectedUserType}`);
    }
  };

  const handleBack = () => {
    setLocation("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={eventoLogo} 
              alt="Evento+"
              className="h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Cadastrar conta</h1>
          <p className="text-gray-600">
            Conte-nos como você deseja utilizar nossa plataforma
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Tipo de usuário</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-gray-500">Dados de cadastro</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">Serviços</span>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Selecione o tipo de usuário que você é</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedUserType === type.id;
                
                return (
                  <div
                    key={type.id}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? "border-2 border-blue-500 bg-blue-50" 
                        : `border-2 ${type.color} bg-white`
                    }`}
                    onClick={() => setSelectedUserType(type.id)}
                  >
                    <div className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-blue-500" : "bg-gray-100"
                      }`}>
                        <IconComponent className={`w-8 h-8 ${
                          isSelected ? "text-white" : "text-gray-600"
                        }`} />
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isSelected ? "text-blue-700" : "text-gray-900"
                      }`}>
                        {type.title}
                      </h3>
                      <p className={`text-sm ${
                        isSelected ? "text-blue-600" : "text-gray-600"
                      }`}>
                        {type.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedUserType}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}