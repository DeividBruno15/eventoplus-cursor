import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

const prestadorServices = [
  { id: "fotografo", label: "Fotógrafo", description: "Fotografia profissional para eventos" },
  { id: "videomaker", label: "Videomaker", description: "Filmagem e edição de vídeos" },
  { id: "dj", label: "DJ", description: "Música e animação para festas" },
  { id: "banda", label: "Banda", description: "Música ao vivo" },
  { id: "decoracao", label: "Decoração", description: "Decoração e ambientação" },
  { id: "buffet", label: "Buffet", description: "Serviços de alimentação" },
  { id: "cerimonialista", label: "Cerimonialista", description: "Organização de cerimônias" },
  { id: "seguranca", label: "Segurança", description: "Serviços de segurança" },
  { id: "limpeza", label: "Limpeza", description: "Serviços de limpeza" },
  { id: "transporte", label: "Transporte", description: "Transporte de convidados" },
  { id: "floricultura", label: "Floricultura", description: "Arranjos florais" },
  { id: "maquiagem", label: "Maquiagem", description: "Serviços de beleza" }
];

const contratanteServices = [
  { id: "contratar-servicos", label: "Contratar Serviços", description: "Contratar prestadores para eventos" }
];

const anuncianteServices = [
  { id: "anunciar-espacos", label: "Anunciar Espaços", description: "Divulgar espaços para eventos" }
];

export default function RegisterStep3() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [registrationData, setRegistrationData] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("userType");
    if (type) {
      setUserType(type);
    }

    const data = localStorage.getItem("registrationData");
    if (data) {
      setRegistrationData(JSON.parse(data));
    }
  }, []);

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/register", data);
    },
    onSuccess: () => {
      localStorage.removeItem("registrationData");
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você pode fazer login agora.",
      });
      setLocation("/auth/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const getServicesForUserType = () => {
    switch (userType) {
      case "prestador":
        return prestadorServices;
      case "contratante":
        return contratanteServices;
      case "anunciante":
        return anuncianteServices;
      default:
        return [];
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    if (userType === "prestador") {
      if (selectedServices.includes(serviceId)) {
        setSelectedServices(selectedServices.filter(id => id !== serviceId));
      } else if (selectedServices.length < 3) {
        setSelectedServices([...selectedServices, serviceId]);
      } else {
        toast({
          title: "Limite atingido",
          description: "Você pode selecionar no máximo 3 serviços",
          variant: "destructive",
        });
      }
    } else {
      setSelectedServices([serviceId]);
    }
  };

  const handleFinish = () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Selecione ao menos um serviço",
        description: "É necessário selecionar pelo menos um serviço",
        variant: "destructive",
      });
      return;
    }

    const finalData = {
      ...registrationData,
      selectedServices
    };

    registerMutation.mutate(finalData);
  };

  const handleBack = () => {
    setLocation(`/auth/register-step2?userType=${userType}`);
  };

  const services = getServicesForUserType();
  const maxServices = userType === "prestador" ? 3 : 1;
  const canSelectMore = selectedServices.length < maxServices;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Cadastrar conta</h1>
          <p className="text-gray-600">
            Selecione os tipos de serviços
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Tipo de usuário</span>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Dados de cadastro</span>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Serviços</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {userType === "prestador" && "Selecione até 3 tipos de serviços que você oferece"}
              {userType === "contratante" && "Confirme o serviço que você deseja utilizar"}
              {userType === "anunciante" && "Confirme o serviço que você deseja utilizar"}
            </CardTitle>
            {userType === "prestador" && (
              <p className="text-sm text-gray-600">
                Selecionados: {selectedServices.length}/3
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                const isDisabled = !canSelectMore && !isSelected;
                
                return (
                  <div
                    key={service.id}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? "border-blue-500 bg-blue-50" 
                        : isDisabled
                        ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                    onClick={() => !isDisabled && handleServiceToggle(service.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${
                          isSelected ? "text-blue-700" : "text-gray-900"
                        }`}>
                          {service.label}
                        </h3>
                        <p className={`text-sm ${
                          isSelected ? "text-blue-600" : "text-gray-600"
                        }`}>
                          {service.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-8">
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
              <Button 
                onClick={handleFinish}
                disabled={selectedServices.length === 0 || registerMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {registerMutation.isPending ? "Finalizando..." : "Finalizar Cadastro"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}