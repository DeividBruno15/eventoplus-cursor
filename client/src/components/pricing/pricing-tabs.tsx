import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "wouter";

type UserType = "prestadores" | "contratantes" | "espacos";

export default function PricingTabs() {
  const [activeTab, setActiveTab] = useState<UserType>("prestadores");

  const prestadoresPlans = [
    {
      name: "Essencial",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar",
      features: [
        "Perfil público básico",
        "1 serviço ativo",
        "Suporte via FAQ",
        "Avaliações de clientes",
        "Acesso limitado às oportunidades"
      ],
      cta: "Começar Gratuitamente",
      variant: "secondary" as const,
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 14,90",
      period: "/mês",
      description: "Para prestadores ativos",
      features: [
        "Até 5 serviços ativos",
        "Prioridade no ranking de busca",
        "Métricas básicas",
        "Suporte via chat comercial"
      ],
      cta: "Assinar Agora",
      variant: "default" as const,
      popular: true
    },
    {
      name: "Premium",
      price: "R$ 29,90",
      period: "/mês",
      description: "Para profissionais avançados",
      features: [
        "Serviços ilimitados",
        "Destaque nas categorias",
        "Painel completo de performance",
        "Agendamento com cliente",
        "Suporte prioritário + WhatsApp"
      ],
      cta: "Assinar Premium",
      variant: "secondary" as const,
      popular: false
    }
  ];

  const contratantesPlans = [
    {
      name: "Descubra",
      price: "R$ 0",
      period: "/mês",
      description: "Para explorar",
      features: [
        "Busca ilimitada",
        "Favoritar perfis",
        "Avaliar prestadores",
        "Histórico básico"
      ],
      cta: "Começar Gratuitamente",
      variant: "secondary" as const,
      popular: false
    },
    {
      name: "Conecta",
      price: "R$ 14,90",
      period: "/mês",
      description: "Para organizar",
      features: [
        "Contato direto sem limite",
        "Briefings personalizados",
        "Agendamento e lembretes",
        "Suporte via chat"
      ],
      cta: "Assinar Agora",
      variant: "default" as const,
      popular: true
    },
    {
      name: "Gestão",
      price: "R$ 29,90",
      period: "/mês",
      description: "Para profissionais",
      features: [
        "Histórico completo com exportação",
        "Requisições múltiplas",
        "Dashboard de controle",
        "Suporte premium"
      ],
      cta: "Assinar Premium",
      variant: "secondary" as const,
      popular: false
    }
  ];

  const espacosPlans = [
    {
      name: "Divulgue",
      price: "R$ 0",
      period: "/mês",
      description: "Para começar",
      features: [
        "Cadastro de 1 local",
        "Diretório básico",
        "Até 3 leads/mês",
        "Estatísticas simples"
      ],
      cta: "Começar Gratuitamente",
      variant: "secondary" as const,
      popular: false
    },
    {
      name: "Alcance",
      price: "R$ 14,90",
      period: "/mês",
      description: "Para crescer",
      features: [
        "Até 5 locais",
        "Destaque intermediário",
        "Leads ilimitados",
        "Estatísticas completas"
      ],
      cta: "Assinar Agora",
      variant: "default" as const,
      popular: true
    },
    {
      name: "Vitrine",
      price: "R$ 29,90",
      period: "/mês",
      description: "Para escalar",
      features: [
        "Locais ilimitados",
        "Posição de destaque",
        "Vídeos e tours virtuais",
        "Insights de comportamento"
      ],
      cta: "Assinar Premium",
      variant: "secondary" as const,
      popular: false
    }
  ];

  const getPlans = () => {
    switch (activeTab) {
      case "prestadores":
        return prestadoresPlans;
      case "contratantes":
        return contratantesPlans;
      case "espacos":
        return espacosPlans;
      default:
        return prestadoresPlans;
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-12">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab("prestadores")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "prestadores"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Prestadores
            </button>
            <button
              onClick={() => setActiveTab("contratantes")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "contratantes"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Contratantes
            </button>
            <button
              onClick={() => setActiveTab("espacos")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "espacos"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Espaços
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {getPlans().map((plan, index) => (
          <div
            key={plan.name}
            className={`p-8 rounded-2xl relative ${
              plan.popular
                ? "bg-white border-2 border-primary shadow-lg"
                : "bg-gray-50 border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-secondary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recomendado
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div className={`text-4xl font-bold mb-4 ${plan.popular ? "text-primary" : "text-black"}`}>
                {plan.price}
                <span className="text-lg font-normal text-gray-600">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={plan.price === "R$ 0" ? "/register" : "/subscribe"}>
              <Button
                className={`w-full py-3 font-medium transition-colors ${
                  plan.variant === "default"
                    ? "bg-primary text-white hover:bg-blue-700"
                    : plan.price === "R$ 29,90"
                    ? "bg-secondary text-white hover:bg-orange-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
