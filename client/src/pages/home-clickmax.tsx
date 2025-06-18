import HeaderClickMax from "@/components/layout/header-clickmax";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Play, Star, Users, Calendar, Building, Zap, Shield, TrendingUp, ChevronRight, Globe, Award, Target } from "lucide-react";

export default function HomeClickMax() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderClickMax />
      
      {/* Hero Section - Exactly like ClickMax */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Plataforma #1 em Eventos no Brasil
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Conectamos você ao
              <span className="block text-[#3C5BFA]">evento perfeito</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Organizadores de eventos, prestadores de serviços e donos de espaços unidos em uma única plataforma. 
              Transforme sua ideia em realidade.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Comece gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50">
                <Play className="mr-2 h-5 w-5" />
                Assistir demo
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-600">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm">+50,000 eventos realizados</span>
              </div>
              
              <div className="flex items-center">
                <div className="flex mr-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <span className="text-sm">4.9/5 (2,847 avaliações)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="hidden lg:block absolute top-32 left-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-[#3C5BFA] mr-2" />
            <span className="font-semibold text-gray-900">Evento Corporativo</span>
          </div>
          <p className="text-sm text-gray-600">São Paulo • 500 convidados</p>
          <div className="mt-2 flex items-center">
            <span className="text-green-600 text-sm font-medium">✓ Confirmado</span>
          </div>
        </div>
        
        <div className="hidden lg:block absolute top-48 right-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-[#FFA94D] mr-2" />
            <span className="font-semibold text-gray-900">Prestador Premium</span>
          </div>
          <p className="text-sm text-gray-600">DJ Profissional</p>
          <div className="mt-2 flex items-center">
            <span className="text-[#3C5BFA] text-sm font-medium">★ 4.9 (127 reviews)</span>
          </div>
        </div>
      </section>
      
      {/* Features Grid - ClickMax Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
              Recursos Poderosos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tudo que você precisa para o
              <span className="block text-[#3C5BFA]">evento perfeito</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa que conecta organizadores, prestadores e espaços com eficiência e segurança
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#3C5BFA] transition-colors">
                  <Calendar className="h-6 w-6 text-[#3C5BFA] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gestão Completa de Eventos</h3>
                <p className="text-gray-600 mb-6">
                  Organize todos os aspectos do seu evento em um só lugar. Do planejamento à execução, controle total na palma da sua mão.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Cronograma detalhado
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Controle orçamentário
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Lista de convidados
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#FFA94D] transition-colors">
                  <Users className="h-6 w-6 text-[#FFA94D] group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Rede de Prestadores Verificados</h3>
                <p className="text-gray-600 mb-6">
                  Acesso aos melhores profissionais do mercado, todos verificados e avaliados pela nossa comunidade ativa.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Perfis verificados
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Avaliações reais
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Propostas competitivas
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
                  <Building className="h-6 w-6 text-green-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Espaços Únicos e Especiais</h3>
                <p className="text-gray-600 mb-6">
                  Encontre o local perfeito entre milhares de opções, desde salões tradicionais até espaços inovadores.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Fotos em alta resolução
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Disponibilidade em tempo real
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Reserva instantânea
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 4 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                  <Zap className="h-6 w-6 text-purple-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Automação Inteligente</h3>
                <p className="text-gray-600 mb-6">
                  Nossa IA conecta você automaticamente com os melhores prestadores para o seu tipo de evento.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Matching inteligente
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Sugestões personalizadas
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 5 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500 transition-colors">
                  <Shield className="h-6 w-6 text-red-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Segurança Total</h3>
                <p className="text-gray-600 mb-6">
                  Pagamentos seguros, contratos digitais e proteção completa em todas as transações.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Pagamentos protegidos
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Contratos digitais
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Feature 6 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-500 transition-colors">
                  <TrendingUp className="h-6 w-6 text-yellow-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics Avançados</h3>
                <p className="text-gray-600 mb-6">
                  Acompanhe o desempenho dos seus eventos com relatórios detalhados e insights valiosos.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Relatórios em tempo real
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Métricas de sucesso
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works - ClickMax Style */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#3C5BFA]/10 text-[#3C5BFA] px-4 py-2">
              Como Funciona
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Seu evento perfeito em
              <span className="block text-[#3C5BFA]">3 passos simples</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma foi desenhada para simplificar cada etapa do processo de criação de eventos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-[#3C5BFA] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FFA94D] rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Descreva seu Evento</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Conte-nos sobre seu evento: tipo, data, local e orçamento. Nossa IA encontrará as melhores opções para você.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-[#3C5BFA] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FFA94D] rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Receba Propostas</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Prestadores qualificados enviarão propostas personalizadas. Compare preços, portfolios e avaliações.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-[#3C5BFA] rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FFA94D] rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Realize com Sucesso</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Contrate os melhores profissionais e acompanhe tudo pela plataforma. Seu evento será inesquecível!
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg">
                Criar Meu Primeiro Evento
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials - ClickMax Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-100 text-green-600 px-4 py-2">
              Depoimentos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              O que nossos clientes
              <span className="block text-[#3C5BFA]">estão dizendo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mais de 50.000 eventos realizados com sucesso através da nossa plataforma
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4 text-white font-bold">
                  MS
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Maria Santos</h4>
                  <p className="text-sm text-gray-600">Organizadora de Eventos • São Paulo</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "Consegui organizar o casamento dos meus sonhos em apenas 3 semanas! A plataforma conectou-me com profissionais incríveis e o resultado foi perfeito."
              </p>
            </Card>
            
            {/* Testimonial 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-4 text-white font-bold">
                  CO
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Carlos Oliveira</h4>
                  <p className="text-sm text-gray-600">DJ Profissional • Rio de Janeiro</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "Como prestador, triplicou minha clientela. A qualidade dos leads é excelente e o sistema de pagamentos é muito seguro. Recomendo!"
              </p>
            </Card>
            
            {/* Testimonial 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4 text-white font-bold">
                  AC
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Ana Costa</h4>
                  <p className="text-sm text-gray-600">Proprietária de Espaço • Belo Horizonte</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "Alugo meu espaço há 2 anos pela plataforma. Ocupação de 95% e clientes sempre satisfeitos. A melhor decisão que tomei!"
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Final CTA - ClickMax Style */}
      <section className="py-24 bg-gradient-to-r from-[#3C5BFA] to-[#5B7FFF] text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar
            <span className="block">seus eventos?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Junte-se a mais de 75.000 organizadores, prestadores e donos de espaços que já escolheram a Evento+ para realizar eventos inesquecíveis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-[#3C5BFA] hover:bg-gray-100 px-12 py-4 text-lg font-semibold rounded-xl shadow-lg">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl">
              Falar com Especialista
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Gratuito para começar</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Suporte especializado</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}