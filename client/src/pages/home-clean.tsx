import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/logo evennto_1750165135991.png";

export default function HomeClean() {
  const [activeUserType, setActiveUserType] = useState("prestador");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const userTypes = [
    {
      id: "prestador",
      title: "Prestador de Serviços",
      subtitle: "Ofereça seus serviços para eventos",
      features: ["Criar perfil profissional", "Receber propostas", "Gerenciar agenda", "Sistema de avaliações"]
    },
    {
      id: "contratante", 
      title: "Organizador de Eventos",
      subtitle: "Encontre profissionais para seu evento",
      features: ["Publicar eventos", "Contratar serviços", "Gerenciar orçamento", "Acompanhar progresso"]
    },
    {
      id: "anunciante",
      title: "Proprietário de Espaços",
      subtitle: "Anuncie seu espaço para eventos",
      features: ["Cadastrar espaços", "Definir disponibilidade", "Gerenciar reservas", "Controlar agenda"]
    }
  ];

  const faqItems = [
    {
      question: "Como funciona a plataforma?",
      answer: "A Evento+ conecta organizadores de eventos com prestadores de serviços e proprietários de espaços. Você pode criar seu perfil, publicar seus serviços ou eventos, e gerenciar tudo em um só lugar."
    },
    {
      question: "Quais são os custos?",
      answer: "Temos planos gratuitos e pagos. O plano gratuito permite funcionalidades básicas, enquanto os planos pagos oferecem recursos avançados como prioridade nas buscas e ferramentas de gestão."
    },
    {
      question: "Como recebo pagamentos?",
      answer: "Os pagamentos são processados com segurança através da nossa plataforma. Você pode configurar sua conta bancária e receber os valores diretamente."
    },
    {
      question: "Posso cancelar minha assinatura?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento através do seu painel de controle. Não há taxas de cancelamento."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <img src={logoPath} alt="Evento+" className="h-8 w-auto" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/como-funciona" className="text-gray-600 hover:text-gray-900">Como funciona</Link>
              <Link href="/quem-somos" className="text-gray-600 hover:text-gray-900">Quem somos</Link>
              <Link href="/contato" className="text-gray-600 hover:text-gray-900">Contato</Link>
              <Link href="/auth/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#3C5BFA] hover:bg-[#3C5BFA]/90">Cadastrar</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#3C5BFA] to-[#2940D3] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Sua plataforma completa para eventos perfeitos
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Conecte-se com os melhores prestadores de serviços, encontre espaços incríveis 
            e organize eventos inesquecíveis em um só lugar.
          </p>
          <div className="flex justify-center">
            <img 
              src="/api/placeholder/400/120" 
              alt="Baixe nosso app"
              className="h-15"
            />
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo para seu evento perfeito
            </h2>
            <p className="text-lg text-gray-600">
              Encontre os melhores profissionais em cada categoria
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: "Entretenimento", icon: "🎵" },
              { name: "Alimentação", icon: "🍽️" },
              { name: "Organização", icon: "📋" },
              { name: "Produção", icon: "🎬" },
              { name: "Limpeza", icon: "🧽" }
            ].map((category, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Profiles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Encontre seu perfil na Evento+
            </h2>
            <p className="text-lg text-gray-600">
              Escolha como você quer usar nossa plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((userType) => (
              <Card key={userType.id} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold mb-2">{userType.title}</h3>
                  <p className="text-gray-600 mb-4">{userType.subtitle}</p>
                  <ul className="space-y-2 mb-6">
                    {userType.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/auth/register?type=${userType.id}`}>
                    <Button className="w-full bg-[#3C5BFA] hover:bg-[#3C5BFA]/90">
                      Cadastrar como {userType.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="planos" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planos que se adaptam ao seu negócio
            </h2>
            <p className="text-lg text-gray-600">
              Escolha o plano ideal para seu perfil
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Essencial */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Essencial</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">Gratuito</span>
                </div>
                <p className="text-gray-600 mt-2">Para começar</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Perfil básico</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>3 serviços/eventos</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Chat básico</span>
                </li>
              </ul>
              
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-gray-300">
                  Escolher plano
                </Button>
              </Link>
            </div>

            {/* Profissional */}
            <div className="bg-[#3C5BFA] text-white rounded-2xl p-8 shadow-sm relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FFA94D] text-white">
                Mais Popular
              </Badge>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Profissional</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ 49</span>
                  <span className="text-lg">/mês</span>
                </div>
                <p className="text-blue-100 mt-2">Para crescer</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  <span>Perfil destacado</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  <span>Serviços ilimitados</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  <span>Chat avançado</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-white mr-3" />
                  <span>Analytics básico</span>
                </li>
              </ul>
              
              <Link href="/auth/login">
                <Button className="w-full bg-white text-[#3C5BFA] hover:bg-gray-100">
                  Escolher plano
                </Button>
              </Link>
            </div>

            {/* Empresarial */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Empresarial</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 99</span>
                  <span className="text-lg text-gray-600">/mês</span>
                </div>
                <p className="text-gray-600 mt-2">Para empresas</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Tudo do Profissional</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Analytics avançado</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>API personalizada</span>
                </li>
              </ul>
              
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-gray-300">
                  Escolher plano
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600">
              Tire suas dúvidas sobre a plataforma
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-900">{item.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#3C5BFA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de profissionais que já usam a Evento+
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?type=prestador">
              <Button className="bg-white text-[#3C5BFA] hover:bg-gray-100 px-8 py-3">
                Cadastrar como Prestador
              </Button>
            </Link>
            <Link href="/auth/register?type=contratante">
              <Button className="bg-white text-[#3C5BFA] hover:bg-gray-100 px-8 py-3">
                Cadastrar como Contratante
              </Button>
            </Link>
            <Link href="/auth/register?type=anunciante">
              <Button className="bg-white text-[#3C5BFA] hover:bg-gray-100 px-8 py-3">
                Cadastrar como Anunciante
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={logoPath} alt="Evento+" className="h-8 w-auto mb-4" />
              <p className="text-gray-400">
                A plataforma completa para conectar organizadores de eventos 
                com os melhores prestadores de serviços.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/como-funciona" className="hover:text-white">Como funciona</Link></li>
                <li><Link href="#planos" className="hover:text-white">Planos</Link></li>
                <li><Link href="/contato" className="hover:text-white">Suporte</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/quem-somos" className="hover:text-white">Sobre nós</Link></li>
                <li><Link href="/contato" className="hover:text-white">Contato</Link></li>
                <li><Link href="#" className="hover:text-white">Carreiras</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Termos de uso</Link></li>
                <li><Link href="#" className="hover:text-white">Política de privacidade</Link></li>
                <li><Link href="#" className="hover:text-white">LGPD</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Evento+. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}