import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Users, Calendar, Building, Star, Zap, Shield, TrendingUp, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="font-sans bg-white">
      <Header />
      
      {/* Hero Section - Inspired by ClickMax */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3C5BFA] via-[#4C6EFF] to-[#5B7FFF]">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              ✨ A plataforma #1 para eventos no Brasil
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
              Transforme Seus Eventos em
              <span className="block text-[#FFA94D]">Experiências Inesquecíveis</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              A única plataforma que você precisa para conectar organizadores, prestadores de serviços e espaços. 
              Simplifique cada etapa do seu evento.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-[#3C5BFA] hover:bg-gray-100 text-lg px-12 py-6 rounded-full font-semibold shadow-xl">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full">
                <Play className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-white/80">Eventos Realizados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">25K+</div>
                <div className="text-white/80">Prestadores Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-white/80">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">5M+</div>
                <div className="text-white/80">Conexões Feitas</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-white" viewBox="0 0 1440 320" fill="currentColor">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#3C5BFA]/10 text-[#3C5BFA] border-[#3C5BFA]/20">
              Recursos Poderosos
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simplifique cada aspecto do seu evento com ferramentas profissionais e uma interface intuitiva
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#3C5BFA]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#3C5BFA] transition-colors">
                  <Calendar className="h-8 w-8 text-[#3C5BFA] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão Completa</h3>
                <p className="text-gray-600 mb-6">
                  Organize todos os aspectos do seu evento em um só lugar. Do planejamento à execução.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Cronograma detalhado
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Controle orçamentário
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Lista de convidados
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#FFA94D]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#FFA94D] transition-colors">
                  <Users className="h-8 w-8 text-[#FFA94D] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Rede de Prestadores</h3>
                <p className="text-gray-600 mb-6">
                  Acesso aos melhores profissionais do mercado, verificados e avaliados pela comunidade.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Perfis verificados
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Avaliações reais
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Propostas competitivas
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 transition-colors">
                  <Building className="h-8 w-8 text-green-500 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Espaços Únicos</h3>
                <p className="text-gray-600 mb-6">
                  Encontre o local perfeito entre milhares de opções, desde salões tradicionais até espaços inovadores.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Fotos em alta resolução
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Disponibilidade em tempo real
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Reserva instantânea
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - ClickMax Style */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#3C5BFA]/10 text-[#3C5BFA] border-[#3C5BFA]/20">
              Como Funciona
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Seu evento perfeito em 3 passos simples
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-[#3C5BFA] rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFA94D] rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Descreva seu Evento</h3>
              <p className="text-gray-600 text-lg">
                Conte-nos sobre seu evento: tipo, data, local e orçamento. Nossa IA encontrará as melhores opções para você.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-[#3C5BFA] rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFA94D] rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Receba Propostas</h3>
              <p className="text-gray-600 text-lg">
                Prestadores qualificados enviarão propostas personalizadas. Compare preços, portfolios e avaliações.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-[#3C5BFA] rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FFA94D] rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Realize com Sucesso</h3>
              <p className="text-gray-600 text-lg">
                Contrate os melhores profissionais e acompanhe tudo pela plataforma. Seu evento será inesquecível!
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white px-12 py-6 rounded-full text-lg font-semibold shadow-xl">
                Criar Meu Primeiro Evento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-100 text-green-600 border-green-200">
              Confiança e Qualidade
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Mais de 50.000 eventos realizados com sucesso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Junte-se aos milhares de organizadores que já transformaram seus eventos em experiências inesquecíveis
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Maria Santos - São Paulo</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "Consegui organizar o casamento dos meus sonhos em 3 semanas! A plataforma conectou-me com profissionais incríveis e o resultado foi perfeito."
              </p>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Carlos Oliveira - Rio de Janeiro</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "Como prestador, triplicou minha clientela. A qualidade dos leads é excelente e o sistema de pagamentos é muito seguro."
              </p>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Ana Costa - Belo Horizonte</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "Alugo meu espaço há 2 anos pela plataforma. Ocupação de 95% e clientes sempre satisfeitos. Recomendo!"
              </p>
            </Card>
          </div>
          
          {/* Company Logos */}
          <div className="text-center">
            <p className="text-gray-500 mb-8 text-lg">Empresas que confiam na Evento+</p>
            <div className="flex justify-center items-center space-x-12 opacity-60">
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
                <span className="text-gray-600 font-semibold">EMPRESA 1</span>
              </div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
                <span className="text-gray-600 font-semibold">EMPRESA 2</span>
              </div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
                <span className="text-gray-600 font-semibold">EMPRESA 3</span>
              </div>
              <div className="bg-gray-200 h-12 w-32 rounded flex items-center justify-center">
                <span className="text-gray-600 font-semibold">EMPRESA 4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-r from-[#3C5BFA] to-[#5B7FFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                Por que Evento+?
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">
                A diferença que você pode <span className="text-[#FFA94D]">sentir</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Velocidade Incomparável</h3>
                    <p className="text-white/80 text-lg">Encontre e contrate profissionais em minutos, não semanas.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Segurança Total</h3>
                    <p className="text-white/80 text-lg">Pagamentos seguros e profissionais verificados em cada transação.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Resultados Garantidos</h3>
                    <p className="text-white/80 text-lg">98% de satisfação dos clientes comprovam nossa eficácia.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Comece Agora Gratuitamente</h3>
                  <p className="text-gray-600">Sem compromisso, sem cartão de crédito</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Acesso a todos os prestadores</span>
                  </div>
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Chat direto com profissionais</span>
                  </div>
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Suporte especializado</span>
                  </div>
                </div>
                
                <Link href="/auth/register">
                  <Button size="lg" className="w-full bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white mt-6 py-4 text-lg font-semibold">
                    Criar Conta Gratuita
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <p className="text-center text-gray-500 text-sm mt-4">
                  Junte-se a mais de 75.000 usuários satisfeitos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Pronto para transformar seus eventos?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Milhares de organizadores já escolheram a Evento+. Seja o próximo!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white px-12 py-6 rounded-full text-lg font-semibold">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="border-2 border-gray-400 text-gray-300 hover:bg-gray-800 px-8 py-6 rounded-full text-lg">
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