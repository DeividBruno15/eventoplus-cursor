import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowLeft } from "lucide-react";

const serviceCategories = [
  {
    id: "entretenimento",
    name: "Entretenimento e animação",
    icon: "🎭",
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
    icon: "🍽️",
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
    icon: "📋",
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
    icon: "📹",
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
    icon: "🧽",
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
                          <div className="text-5xl mb-4">{category.icon}</div>
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