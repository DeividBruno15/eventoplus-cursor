import HeaderClickMax from "@/components/layout/header-clickmax";
import FooterClickMax from "@/components/layout/footer-clickmax";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Play, Star, Users, Calendar, Building, Zap, Shield, TrendingUp, ChevronRight, Globe, Award, Target } from "lucide-react";

export default function HomeClickMax() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderClickMax />
      
      {/* Hero Section - Enhanced with Dynamic Motion */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-[#3C5BFA]/10 to-transparent rounded-full blur-3xl animate-float-slow animate-morph"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-[#FFA94D]/10 to-transparent rounded-full blur-3xl animate-float animate-delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-2xl animate-scale-pulse animate-delay-300"></div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-32 right-1/4 w-16 h-16 bg-[#3C5BFA]/20 rounded-xl animate-float animate-rotate will-change-transform"></div>
          <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-[#FFA94D]/30 rounded-full animate-float-slow animate-delay-700"></div>
          <div className="absolute top-2/3 right-1/3 w-8 h-8 bg-purple-400/25 rotate-45 animate-float animate-delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge with Animation */}
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce-in animate-delay-200 hover-lift">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-scale-pulse"></span>
              Plataforma #1 em Eventos no Brasil
            </div>
            
            {/* Main Headline with Staggered Animation */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 animate-fade-in-up animate-delay-300">
              Conectamos você ao
              <span className="block text-[#3C5BFA] animate-gradient will-change-transform">evento perfeito</span>
            </h1>
            
            {/* Subtitle with Delayed Animation */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animate-delay-500">
              Organizadores de eventos, prestadores de serviços e donos de espaços unidos em uma única plataforma. 
              Transforme sua ideia em realidade.
            </p>
            
            {/* CTA Buttons with Enhanced Interactions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animate-delay-700">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all btn-magnetic hover-lift">
                  Comece gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 hover-lift hover-glow">
                <Play className="mr-2 h-5 w-5" />
                Assistir demo
              </Button>
            </div>
            
            {/* Social Proof with Animations */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-600 animate-fade-in-up animate-delay-1000">
              <div className="flex items-center hover-lift">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white animate-scale-pulse animate-delay-100"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white animate-scale-pulse animate-delay-200"></div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white animate-scale-pulse animate-delay-300"></div>
                  <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white animate-scale-pulse animate-delay-500"></div>
                </div>
                <span className="text-sm">+50,000 eventos realizados</span>
              </div>
              
              <div className="flex items-center hover-lift">
                <div className="flex mr-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-scale-pulse animate-delay-100" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-scale-pulse animate-delay-200" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-scale-pulse animate-delay-300" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-scale-pulse animate-delay-500" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-scale-pulse animate-delay-700" />
                </div>
                <span className="text-sm">4.9/5 (2,847 avaliações)</span>
              </div>
            </div>
          </div>
          
          {/* Dashboard Mockup with Motion */}
          <div className="max-w-4xl mx-auto mt-16 animate-slide-in-bottom animate-delay-1000">
            <div className="relative hover-lift">
              {/* Browser Frame */}
              <div className="bg-gray-200 rounded-t-2xl p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-scale-pulse animate-delay-100"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-scale-pulse animate-delay-200"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-scale-pulse animate-delay-300"></div>
                  <div className="flex-1 bg-white rounded-lg mx-4 py-1 px-3">
                    <span className="text-gray-500 text-sm">evento.com.br/dashboard</span>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Content - Enhanced Glassmorphism */}
              <div className="bg-gradient-to-br from-gray-900/80 via-blue-900/60 to-purple-900/80 backdrop-blur-xl border border-white/10 rounded-b-2xl shadow-2xl overflow-hidden animate-glow">
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-6 border-b border-white/10">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h3 className="text-xl font-bold">Dashboard Evento+</h3>
                      <p className="text-white/70">Estatísticas em tempo real</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content Area */}
                <div className="p-6">
                  {/* Stats Cards - Glassmorphism */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/15 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-sm font-medium">Eventos Ativos</p>
                          <p className="text-2xl font-bold text-white">12</p>
                          <p className="text-green-400 text-xs">+3 este mês</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/15 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-sm font-medium">Prestadores</p>
                          <p className="text-2xl font-bold text-white">847</p>
                          <p className="text-green-400 text-xs">+12% crescimento</p>
                        </div>
                        <Users className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/15 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/70 text-sm font-medium">Receita</p>
                          <p className="text-2xl font-bold text-white">R$ 23.9k</p>
                          <p className="text-green-400 text-xs">+18% vs anterior</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-400" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Events - Glassmorphism */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-3">Eventos Recentes</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium text-white">Casamento Silva</p>
                            <p className="text-sm text-white/70">15 Jan • 200 convidados</p>
                          </div>
                        </div>
                        <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-400/30">Confirmado</span>
                      </div>
                      
                      <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                          <div>
                            <p className="font-medium text-white">Evento Corporativo</p>
                            <p className="text-sm text-white/70">22 Jan • 500 convidados</p>
                          </div>
                        </div>
                        <span className="bg-blue-400/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-400/30">Em Andamento</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements with Motion */}
        <div className="hidden lg:block absolute top-32 left-10 bg-white rounded-2xl shadow-xl p-4 max-w-xs border border-gray-100 animate-float animate-glow">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="font-semibold text-gray-900">Evento Confirmado</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Casamento • São Paulo</p>
          <p className="text-xs text-gray-500">500 convidados • R$ 25.000</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-green-500 h-1 rounded-full w-4/5 animate-pulse"></div>
          </div>
        </div>
        
        <div className="hidden lg:block absolute top-48 right-10 bg-white rounded-2xl shadow-xl p-4 max-w-xs border border-gray-100 animate-float" style={{animationDelay: '1s'}}>
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 animate-pulse">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">DJ Premium</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="flex mr-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" />
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" style={{animationDelay: '0.1s'}} />
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" style={{animationDelay: '0.2s'}} />
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" style={{animationDelay: '0.3s'}} />
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 animate-pulse" style={{animationDelay: '0.4s'}} />
            </div>
            <span className="text-xs text-gray-500">4.9 (127 reviews)</span>
          </div>
          <p className="text-xs text-green-600 font-medium">✓ Verificado</p>
        </div>
        
        {/* Additional floating element */}
        <div className="hidden lg:block absolute bottom-20 left-1/4 bg-gradient-to-br from-[#3C5BFA]/10 to-[#FFA94D]/10 backdrop-blur-sm rounded-2xl p-4 max-w-xs border border-white/20 animate-float" style={{animationDelay: '2s'}}>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#3C5BFA]">R$ 23.9k</div>
              <div className="text-sm text-gray-600">Receita este mês</div>
              <div className="text-xs text-green-600">↗ +18% crescimento</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Grid - ClickMax Style */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Pattern Lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#3C5BFA" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
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
            {/* Feature 1 - Enhanced with Motion */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 group relative overflow-hidden hover-lift animate-fade-in-up animate-delay-200 will-change-transform">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#3C5BFA] transition-all duration-300 animate-scale-pulse">
                  <Calendar className="h-6 w-6 text-[#3C5BFA] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gestão Completa de Eventos</h3>
                <p className="text-gray-600 mb-6">
                  Organize todos os aspectos do seu evento em um só lugar. Do planejamento à execução, controle total na palma da sua mão.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 animate-fade-in-left animate-delay-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 animate-scale-pulse animate-delay-100" />
                    Cronograma detalhado
                  </li>
                  <li className="flex items-center text-sm text-gray-600 animate-fade-in-left animate-delay-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 animate-scale-pulse animate-delay-200" />
                    Controle orçamentário
                  </li>
                  <li className="flex items-center text-sm text-gray-600 animate-fade-in-left animate-delay-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 animate-scale-pulse animate-delay-300" />
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
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-gray-50" viewBox="0 0 1440 320" fill="currentColor">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* What We Offer - Visual Section inspired by ClickMax */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-[#3C5BFA]/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-[#FFA94D]/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#3C5BFA]/10 text-[#3C5BFA] px-4 py-2">
              Ecossistema Completo
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Evento+ oferece tudo para
              <span className="block text-[#3C5BFA]">conectar, organizar e realizar</span>
              <span className="block">seus eventos!</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo em um só lugar - da criação à execução
            </p>
          </div>
          
          {/* Visual Grid inspired by ClickMax image */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Column - Event Management */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 animate-float">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3C5BFA] transition-all duration-300">
                  <Calendar className="w-6 h-6 text-[#3C5BFA] animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Gestão de Eventos</h3>
                <p className="text-gray-600 text-sm">Planeje, organize e gerencie todos os aspectos dos seus eventos</p>
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-xs text-gray-500 mb-1">Próximo evento</div>
                  <div className="text-sm font-medium text-gray-900">Casamento Silva - 15 Jan</div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-[#3C5BFA] h-1 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Rede de Prestadores</h3>
                <p className="text-gray-600 text-sm">Acesso aos melhores profissionais verificados</p>
                <div className="flex items-center mt-4 space-x-2">
                  <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
                  <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                  <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-gray-500 ml-2">+847 prestadores</span>
                </div>
              </div>
            </div>
            
            {/* Center Column - Communication */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chat em Tempo Real</h3>
                <p className="text-gray-600 text-sm">Comunicação direta com prestadores e clientes</p>
                <div className="mt-4 space-y-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-right">
                    <div className="text-xs text-gray-600">Você</div>
                    <div className="text-sm">Qual o valor para 200 pessoas?</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600">DJ Premium</div>
                    <div className="text-sm">R$ 1.200 com equipamentos</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-[#FFA94D]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Espaços Únicos</h3>
                <p className="text-gray-600 text-sm">Encontre o local perfeito para seu evento</p>
                <div className="mt-4">
                  <div className="bg-gray-100 rounded-lg h-20 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Vista do Salão Premium</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Analytics & Management */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics Avançados</h3>
                <p className="text-gray-600 text-sm">Acompanhe performance e métricas detalhadas</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-blue-600">847</div>
                    <div className="text-xs text-gray-600">Prestadores</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-600">98%</div>
                    <div className="text-xs text-gray-600">Satisfação</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pagamentos Seguros</h3>
                <p className="text-gray-600 text-sm">Transações protegidas e contratos digitais</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-green-600 text-sm font-medium">✓ Verificado</span>
                  <span className="text-gray-500 text-xs">256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                Explorar Plataforma
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Curved Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 text-gray-50" viewBox="0 0 1440 320" fill="currentColor">
            <path d="M0,160L60,149.3C120,139,240,117,360,133.3C480,149,600,203,720,208C840,213,960,171,1080,144C1200,117,1320,107,1380,101.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Pricing Section with Tabs - Based on Document */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#3C5BFA] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFA94D] rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-[#3C5BFA]/10 text-[#3C5BFA] px-4 py-2 animate-fade-in">
              Planos e Preços
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Planos personalizados para
              <span className="block text-[#3C5BFA]">cada tipo de usuário</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
              Escolha o plano ideal baseado no seu perfil profissional
            </p>
          </div>
          
          {/* Tabs for User Types */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                <button className="px-6 py-3 rounded-lg bg-[#3C5BFA] text-white font-medium transition-all hover:bg-[#2A4AE8]">
                  Prestadores
                </button>
                <button className="px-6 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all">
                  Contratantes
                </button>
                <button className="px-6 py-3 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all">
                  Anunciantes
                </button>
              </div>
            </div>
          </div>
          
          {/* Prestadores Plans */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Essencial - Prestadores */}
            <Card className="border-2 border-gray-200 hover:border-[#3C5BFA] transition-all duration-500 relative overflow-hidden group transform hover:scale-105 hover:shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3C5BFA] transition-all duration-300">
                    <Users className="w-8 h-8 text-gray-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Essencial</h3>
                  <p className="text-gray-600 mb-6">Gratuito</p>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">R$ 0</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Perfil público básico</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">1 serviço ativo</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Suporte via FAQ</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Avaliações de clientes</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Acesso limitado às oportunidades</span>
                    </li>
                  </ul>
                  
                  <Link href="/auth/register">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Começar Grátis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Profissional - Prestadores */}
            <Card className="border-2 border-[#3C5BFA] hover:border-[#2A4AE8] transition-all duration-500 relative overflow-hidden group transform scale-105 shadow-xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#3C5BFA] text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                Recomendado
              </div>
              <CardContent className="p-8 pt-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#3C5BFA]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#3C5BFA] transition-all duration-300">
                    <Star className="w-8 h-8 text-[#3C5BFA] group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Profissional</h3>
                  <p className="text-gray-600 mb-6">Para crescer no mercado</p>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">R$ 14,90</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Até 5 serviços ativos</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Prioridade no ranking de busca</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Métricas básicas (visitas, contatos)</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Suporte via chat comercial</span>
                    </li>
                  </ul>
                  
                  <Link href="/auth/register">
                    <Button className="w-full bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Começar Teste Grátis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Premium - Prestadores */}
            <Card className="border-2 border-gray-200 hover:border-[#FFA94D] transition-all duration-500 relative overflow-hidden group transform hover:scale-105 hover:shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FFA94D] transition-all duration-300">
                    <Award className="w-8 h-8 text-[#FFA94D] group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-600 mb-6">Para profissionais consolidados</p>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">R$ 29,90</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Serviços ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Destaque nas categorias</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Painel completo de performance</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Agendamento com cliente</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">Suporte prioritário + WhatsApp exclusivo</span>
                    </li>
                  </ul>
                  
                  <Link href="/auth/register">
                    <Button className="w-full bg-[#FFA94D] hover:bg-[#E8941F] text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Assinar Premium
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Info */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Cancele a qualquer momento</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Upgrade/Downgrade imediato</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Suporte especializado</span>
              </div>
            </div>
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
        
        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-[#3C5BFA]" viewBox="0 0 1440 320" fill="currentColor">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
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

      <FooterClickMax />
    </div>
  );
}