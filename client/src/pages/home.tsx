import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PricingTabs from "@/components/pricing/pricing-tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Calendar, Search, MessageCircle, CreditCard, BarChart, Star, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="font-sans bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="bg-hero-brand">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                  Conecte, Organize e Realize Eventos <span className="text-secondary">Incríveis</span>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                  A plataforma completa que conecta organizadores com prestadores de serviços e espaços para eventos únicos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-[#3C5BFA] hover:bg-gray-100 text-lg px-8 py-4">
                      Começar Gratuitamente
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-[#3C5BFA] text-lg px-8 py-4">
                      Ver Planos
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">Fotógrafo Profissional</p>
                        <p className="text-gray-600 text-sm">R$ 1.200 - 8h de cobertura</p>
                      </div>
                      <Button size="sm" className="ml-auto bg-secondary text-white hover:bg-orange-600">
                        Contratar
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">DJ & Som</p>
                        <p className="text-gray-600 text-sm">R$ 800 - Festa completa</p>
                      </div>
                      <Button size="sm" className="ml-auto bg-primary text-white">
                        Contratar
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">Buffet Premium</p>
                        <p className="text-gray-600 text-sm">R$ 45/pessoa - Menu completo</p>
                      </div>
                      <Button size="sm" className="ml-auto bg-primary text-white">
                        Contratar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-secondary rounded-full opacity-20"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white rounded-full opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-gray-600">Eventos Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">5K+</div>
              <div className="text-gray-600">Prestadores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Espaços Cadastrados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-gray-600">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-black mb-6">
              Tudo que você precisa para seu evento
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa que simplifica todo o processo de planejamento e execução de eventos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Descoberta Inteligente</h3>
              <p className="text-gray-600">
                Encontre prestadores e espaços qualificados com filtros avançados e recomendações personalizadas.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-6">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Chat em Tempo Real</h3>
              <p className="text-gray-600">
                Comunique-se diretamente com prestadores e organize todos os detalhes do seu evento.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Pagamentos Seguros</h3>
              <p className="text-gray-600">
                Sistema de pagamentos integrado com Stripe para transações seguras e transparentes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Analytics Avançados</h3>
              <p className="text-gray-600">
                Acompanhe métricas detalhadas e insights para otimizar seus eventos e negócios.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Sistema de Avaliações</h3>
              <p className="text-gray-600">
                Avalie e seja avaliado para construir uma comunidade de confiança e qualidade.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">App Mobile</h3>
              <p className="text-gray-600">
                Acesse todos os recursos através do nosso app mobile para iOS e Android.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-black mb-6">
              Planos para cada necessidade
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para seu perfil e comece a transformar seus eventos hoje mesmo.
            </p>
          </div>

          <PricingTabs />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-brand">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Pronto para revolucionar seus eventos?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de organizadores e prestadores que já transformaram seus negócios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#3C5BFA] hover:bg-gray-100 text-lg px-8 py-4">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-[#3C5BFA] text-lg px-8 py-4">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
