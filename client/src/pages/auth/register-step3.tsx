import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft } from "lucide-react";

// Service Category Icons
const EntertainmentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L13.09 5.26L16 4L14.74 7.09L18 8L14.74 8.91L16 12L13.09 10.74L12 14L10.91 10.74L8 12L9.26 8.91L6 8L9.26 7.09L8 4L10.91 5.26L12 2Z" fill="#3C5BFA"/>
    <path d="M5 16L6.5 19.5L10 18L8.5 21.5L12 22L8.5 22.5L10 26L6.5 24.5L5 28L3.5 24.5L0 26L1.5 22.5L-2 22L1.5 21.5L0 18L3.5 19.5L5 16Z" fill="#3C5BFA"/>
  </svg>
);

const FoodIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 9H9V2H7V9H5V2H3V9C3 10.66 4.34 12 6 12H9V22H11V12H12C13.66 12 15 10.66 15 9V2H13V9H11Z" fill="#3C5BFA"/>
    <path d="M16 6V14H18V22H20V2C18.9 2 17.99 2.9 17.99 4L18 6H16Z" fill="#3C5BFA"/>
  </svg>
);

const OrganizationIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="#3C5BFA"/>
    <path d="M8 12H16V14H8V12Z" fill="#3C5BFA"/>
    <path d="M8 16H13V18H8V16Z" fill="#3C5BFA"/>
  </svg>
);

const ProductionIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 10.5V7C17 6.45 16.55 6 16 6H4C3.45 6 3 6.45 3 7V10.5C3 10.78 3.22 11 3.5 11H4.75L5.72 15.5C5.86 16.29 6.54 16.9 7.34 16.9H12.66C13.46 16.9 14.14 16.29 14.28 15.5L15.25 11H16.5C16.78 11 17 10.78 17 10.5Z" fill="#3C5BFA"/>
    <path d="M18 9V7C18 5.9 17.1 5 16 5H14V3C14 2.45 13.55 2 13 2H7C6.45 2 6 2.45 6 3V5H4C2.9 5 2 5.9 2 7V9C0.9 9 0 9.9 0 11V18C0 19.1 0.9 20 2 20H18C19.1 20 20 19.1 20 18V11C20 9.9 19.1 9 18 9Z" fill="#3C5BFA"/>
  </svg>
);

const CleaningIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L16.5 4.5L15 6V10.5C15 11.33 14.33 12 13.5 12S12 11.33 12 10.5V6L10.5 4.5L9 6V10.5C9 12.43 10.57 14 12.5 14S16 12.43 16 10.5V6H18Z" fill="#3C5BFA"/>
    <path d="M8 20V12H6V20C6 21.1 6.9 22 8 22S10 21.1 10 20V12H8V20Z" fill="#3C5BFA"/>
    <path d="M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6S10 5.1 10 4S10.9 2 12 2Z" fill="#3C5BFA"/>
  </svg>
);

const serviceCategories = [
  {
    id: "entretenimento",
    name: "Entretenimento e animação",
    icon: <EntertainmentIcon />,
    services: [
      "DJ",
      "Cantores",
      "Banda",
      "Apresentador / Mestre de cerimônias",
      "Performers (malabaristas, mágicos, dançarinos, etc.)",
      "Animador infantil / Palhaço / Recreador",
      "Personagens vivos (cosplay, mascotes, etc.)",
      "Show pirotécnico (fogos de artifício, efeitos especiais)"
    ]
  },
  {
    id: "alimentacao",
    name: "Alimentação e bebidas",
    icon: <FoodIcon />,
    services: [
      "Cozinheiro / Chef de cozinha",
      "Churrasqueiro",
      "Garçom / Barman / Barista",
      "Buffet e Catering",
      "Bartender",
      "Sommelier (vinhos e bebidas especiais)",
      "Food Trucks / Carrinhos Gourmet (churros, pipoca, hambúrguer, etc.)"
    ]
  },
  {
    id: "organizacao",
    name: "Organização e suporte",
    icon: <OrganizationIcon />,
    services: [
      "Cerimonialista / Assessoria de eventos",
      "Hostess / Recepcionista",
      "Promotor de eventos",
      "Segurança / Brigadista / Bombeiro civil",
      "Valet / Manobrista"
    ]
  },
  {
    id: "producao",
    name: "Produção e visual",
    icon: <ProductionIcon />,
    services: [
      "Fotógrafo / Videomaker",
      "Decorador / Designer de eventos",
      "Iluminação e Som (técnico de som, operador de luz)",
      "Montagem de Palco e Estruturas",
      "Locação de móveis e utensílios (mesas, cadeiras, talheres)",
      "Locação de equipamentos (telões, projetores, geradores, climatização)"
    ]
  },
  {
    id: "limpeza",
    name: "Limpeza e manutenção",
    icon: <CleaningIcon />,
    services: [
      "Limpeza pré-evento (antes da montagem)",
      "Limpeza durante o evento (equipe de suporte para manter o ambiente organizado)",
      "Limpeza pós-evento (remoção de lixo, higienização do espaço)",
      "Sanitização de banheiros",
      "Equipe de manutenção geral (reparos emergenciais, eletricista, encanador)",
      "Serviço de descarte e reciclagem (coleta seletiva, gestão sustentável de resíduos)",
      "Repositor de materiais (sabão, papel higiênico, copos, etc.)"
    ]
  }
];

export default function RegisterStep3() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/register", userData);
      return response.json();
    },
    onSuccess: () => {
      localStorage.removeItem("registrationData");
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Evento+",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleServiceToggle = (serviceId: string) => {
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
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
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

  const canSelectMore = selectedServices.length < 3;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
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
            <div className="w-16 h-0.5 bg-blue-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Serviços</span>
            </div>
          </div>
        </div>

        {userType === "prestador" ? (
          <>
            {!selectedCategory ? (
              <Card>
                <CardHeader>
                  <CardTitle>Escolha sua área de atuação</CardTitle>
                  <div className="text-sm text-gray-600">
                    Selecione o nicho de serviços que você oferece
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceCategories.map((category) => (
                      <div
                        key={category.id}
                        className="p-8 border-2 rounded-2xl cursor-pointer transition-all hover:border-blue-300 hover:shadow-lg bg-white hover:bg-blue-50"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <div className="text-center">
                          <div className="mb-4 flex justify-center">{category.icon}</div>
                          <h3 className="font-semibold text-blue-600 text-lg leading-tight">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-8">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Selecione seus serviços</CardTitle>
                  <div className="text-sm text-gray-600">
                    Selecione até 3 serviços específicos que você oferece em{" "}
                    <span className="font-medium text-blue-600">
                      {serviceCategories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    {selectedServices.length} de 3 selecionados
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {serviceCategories
                      .find(cat => cat.id === selectedCategory)
                      ?.services.map((service: string, index: number) => {
                        const serviceId = `${selectedCategory}-${index}`;
                        const isSelected = selectedServices.includes(serviceId);
                        const isDisabled = !canSelectMore && !isSelected;
                        
                        return (
                          <div
                            key={serviceId}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => !isDisabled && handleServiceToggle(serviceId)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 text-sm">{service}</span>
                              {isSelected && (
                                <Check className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para categorias
                    </Button>
                    <Button 
                      onClick={handleFinish}
                      disabled={registerMutation.isPending || selectedServices.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {registerMutation.isPending ? "Criando conta..." : "Finalizar cadastro"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Confirmação</CardTitle>
              <div className="text-sm text-gray-600">
                {userType === "contratante" 
                  ? "Você poderá contratar serviços de prestadores para seus eventos"
                  : "Você poderá anunciar seus espaços para eventos"
                }
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button 
                  onClick={() => {
                    const finalData = {
                      ...registrationData,
                      selectedServices: userType === "contratante" ? ["contratar-servicos"] : ["anunciar-espacos"]
                    };
                    registerMutation.mutate(finalData);
                  }}
                  disabled={registerMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {registerMutation.isPending ? "Criando conta..." : "Finalizar cadastro"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}