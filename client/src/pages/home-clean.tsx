import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Calendar, Users, Zap, Shield, Star, Play } from "lucide-react";

export default function HomeClean() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#3C5BFA] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-black">Evento+</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-black font-medium">
                Recursos
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-black font-medium">
                Preços
              </a>
              <a href="#about" className="text-gray-600 hover:text-black font-medium">
                Sobre
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-black">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#3C5BFA] hover:bg-blue-700 text-white">
                  Começar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
              Conecte seu evento
              <br />
              <span className="text-[#3C5BFA]">ao sucesso</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A plataforma completa que conecta organizadores com prestadores de serviços 
              e espaços para eventos únicos e memoráveis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/register">
                <Button size="lg" className="bg-[#3C5BFA] hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Começar gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Ver demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#3C5BFA] mb-2">10K+</div>
              <div className="text-gray-600 font-medium">Eventos realizados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3C5BFA] mb-2">5K+</div>
              <div className="text-gray-600 font-medium">Prestadores ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3C5BFA] mb-2">500+</div>
              <div className="text-gray-600 font-medium">Espaços cadastrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#3C5BFA] mb-2">98%</div>
              <div className="text-gray-600 font-medium">Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Como funciona a Evento+
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-[#3C5BFA]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Cadastre sua empresa</h3>
              <p className="text-gray-600">
                Crie seu perfil completo e mostre seus serviços para milhares de organizadores.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#FFA94D]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Receba solicitações</h3>
              <p className="text-gray-600">
                Organizadores interessados entrarão em contato diretamente com você.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Feche contratos</h3>
              <p className="text-gray-600">
                Negocie valores, prazos e condições de forma segura pela plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Todo para seu evento perfeito */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Tudo para seu evento perfeito
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Row 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Arquitetura e decoração</h4>
              <p className="text-gray-600 text-sm">Design e ambientação</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Fotografia e filmagem</h4>
              <p className="text-gray-600 text-sm">Registro profissional</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Alimentação e bebidas</h4>
              <p className="text-gray-600 text-sm">Buffets e catering</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Animação e música</h4>
              <p className="text-gray-600 text-sm">DJs e entretenimento</p>
            </div>

            {/* Row 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Cerimonial e protocolo</h4>
              <p className="text-gray-600 text-sm">Coordenação profissional</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Flores e paisagismo</h4>
              <p className="text-gray-600 text-sm">Decoração floral</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Segurança e limpeza</h4>
              <p className="text-gray-600 text-sm">Serviços de apoio</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Transporte e logística</h4>
              <p className="text-gray-600 text-sm">Mobilidade e organização</p>
            </div>

            {/* Row 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Espaços para eventos</h4>
              <p className="text-gray-600 text-sm">Locais especiais</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Tecnologia e som</h4>
              <p className="text-gray-600 text-sm">Equipamentos técnicos</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Marketing e design</h4>
              <p className="text-gray-600 text-sm">Comunicação visual</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-black mb-2">Vestuário e beleza</h4>
              <p className="text-gray-600 text-sm">Estilo e cuidados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Encontre seu perfil */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Encontre seu perfil na Evento+
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#3C5BFA]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Contratantes</h3>
              <p className="text-gray-600">
                Organize eventos incríveis encontrando os melhores prestadores e espaços.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-[#FFA94D]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Prestadores de Serviços</h3>
              <p className="text-gray-600">
                Conecte-se com organizadores e faça seu negócio crescer na área de eventos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Anunciantes de Espaços</h3>
              <p className="text-gray-600">
                Divulgue seu espaço e receba solicitações de aluguel para eventos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos e benefícios */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Planos e benefícios
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Gratuito */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-black mb-2">Gratuito</h3>
                <div className="text-4xl font-bold text-black mb-1">R$ 0</div>
                <div className="text-gray-600">por mês</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Até 3 eventos por mês</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Suporte básico</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Funcionalidades básicas</span>
                </li>
              </ul>
              
              <Button variant="outline" className="w-full border-gray-300">
                Começar grátis
              </Button>
            </div>

            {/* Plano Profissional - Destacado */}
            <div className="bg-[#3C5BFA] rounded-2xl p-8 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#FFA94D] text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Mais popular
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Profissional</h3>
                <div className="text-4xl font-bold text-white mb-1">R$ 29,90</div>
                <div className="text-blue-200">por mês</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#3C5BFA] text-xs">✓</span>
                  </div>
                  <span className="text-white">Eventos ilimitados</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#3C5BFA] text-xs">✓</span>
                  </div>
                  <span className="text-white">Suporte prioritário</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#3C5BFA] text-xs">✓</span>
                  </div>
                  <span className="text-white">Analytics avançados</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#3C5BFA] text-xs">✓</span>
                  </div>
                  <span className="text-white">Chat ilimitado</span>
                </li>
              </ul>
              
              <Button className="w-full bg-white text-[#3C5BFA] hover:bg-gray-100">
                Escolher plano
              </Button>
            </div>

            {/* Plano Premium */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-black mb-2">Premium</h3>
                <div className="text-4xl font-bold text-black mb-1">R$ 59,90</div>
                <div className="text-gray-600">por mês</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Tudo do Profissional</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Destaque nos resultados</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">API personalizada</span>
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">Gerente dedicado</span>
                </li>
              </ul>
              
              <Button variant="outline" className="w-full border-gray-300">
                Escolher plano
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-2">Como funciona a cobrança?</h3>
              <p className="text-gray-600">A cobrança é mensal e você pode cancelar a qualquer momento. Não há taxas de cancelamento.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-2">Posso mudar de plano?</h3>
              <p className="text-gray-600">Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento através das configurações.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-2">Existe período de teste?</h3>
              <p className="text-gray-600">Sim, todos os planos pagos têm 7 dias de teste gratuito. Você pode cancelar sem custos.</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-2">Como funciona o suporte?</h3>
              <p className="text-gray-600">Oferecemos suporte via chat e email. Planos pagos têm prioridade no atendimento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#3C5BFA]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de organizadores que já transformaram seus eventos.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-[#3C5BFA] hover:bg-gray-100 px-8 py-4 text-lg">
              Começar gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[#3C5BFA] rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-black">Evento+</span>
              </div>
              <p className="text-gray-600">
                A plataforma completa para eventos únicos e memoráveis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black">Recursos</a></li>
                <li><a href="#" className="hover:text-black">Preços</a></li>
                <li><a href="#" className="hover:text-black">Segurança</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black">Sobre</a></li>
                <li><a href="#" className="hover:text-black">Blog</a></li>
                <li><a href="#" className="hover:text-black">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black">Ajuda</a></li>
                <li><a href="#" className="hover:text-black">Contato</a></li>
                <li><a href="#" className="hover:text-black">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 Evento+. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}