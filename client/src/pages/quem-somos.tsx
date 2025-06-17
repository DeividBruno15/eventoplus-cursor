import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Heart, Target, Users, Zap, Shield, Globe } from "lucide-react";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

export default function QuemSomos() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <img 
                    src={eventoLogo} 
                    alt="Evento+"
                    className="h-8 object-contain"
                  />
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/#pricing">
                <span className="text-gray-600 hover:text-black cursor-pointer">Preços</span>
              </Link>
              <Link href="/como-funciona">
                <span className="text-gray-600 hover:text-black cursor-pointer">Como funciona</span>
              </Link>
              <Link href="/quem-somos">
                <span className="text-[#3C5BFA] font-medium cursor-pointer">Quem somos</span>
              </Link>
              <Link href="/contato">
                <span className="text-gray-600 hover:text-black cursor-pointer">Contato</span>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="border-gray-300">
                  Entrar
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[#3C5BFA] hover:bg-[#2C46E8]">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3C5BFA] to-[#2C46E8]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Quem somos
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Somos uma plataforma dedicada a conectar pessoas e transformar eventos em experiências inesquecíveis.
          </p>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Nossa Missão
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Democratizar o acesso a eventos de qualidade, conectando organizadores com os melhores prestadores de serviços e espaços únicos.
              </p>
              <p className="text-gray-600 mb-8">
                Acreditamos que todo evento, independente do tamanho ou orçamento, merece ser especial. Nossa plataforma elimina as barreiras entre quem organiza e quem oferece serviços, criando um ecossistema colaborativo onde todos saem ganhando.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#3C5BFA] rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-black">Paixão por eventos</h4>
                  <p className="text-gray-600 text-sm">Cada evento é único e especial</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#3C5BFA] mb-2">10K+</div>
                    <div className="text-gray-600 text-sm">Eventos realizados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#FFA94D] mb-2">5K+</div>
                    <div className="text-gray-600 text-sm">Prestadores ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                    <div className="text-gray-600 text-sm">Espaços cadastrados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                    <div className="text-gray-600 text-sm">Satisfação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Nossos Valores
            </h2>
            <p className="text-xl text-gray-600">
              Os princípios que guiam nossa jornada
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-[#3C5BFA]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Excelência</h3>
              <p className="text-gray-600">
                Buscamos sempre a melhor experiência para nossos usuários, priorizando qualidade em cada detalhe.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#FFA94D]" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Colaboração</h3>
              <p className="text-gray-600">
                Acreditamos no poder da colaboração para criar eventos extraordinários e relacionamentos duradouros.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Confiança</h3>
              <p className="text-gray-600">
                Priorizamos transparência e segurança em todas as interações da nossa plataforma.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Inovação</h3>
              <p className="text-gray-600">
                Estamos sempre evoluindo e incorporando novas tecnologias para melhorar nossa plataforma.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Acessibilidade</h3>
              <p className="text-gray-600">
                Tornamos eventos de qualidade acessíveis para todos, independente do orçamento ou localização.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Paixão</h3>
              <p className="text-gray-600">
                Fazemos o que fazemos com amor e dedicação, porque acreditamos no poder transformador dos eventos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Nossa História
            </h2>
            <p className="text-xl text-gray-600">
              Como nasceu a Evento+
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-[#3C5BFA] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-3">O Problema</h3>
                <p className="text-gray-600">
                  Identificamos que organizar eventos era complexo e demorado. Encontrar prestadores de qualidade, 
                  comparar preços e gerenciar contratos consumia muito tempo e energia dos organizadores.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-[#FFA94D] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-3">A Solução</h3>
                <p className="text-gray-600">
                  Criamos uma plataforma que conecta diretamente organizadores com prestadores de serviços e espaços, 
                  simplificando todo o processo de planejamento e execução de eventos.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black mb-3">O Futuro</h3>
                <p className="text-gray-600">
                  Continuamos evoluindo para ser a principal plataforma de eventos do Brasil, sempre focados em 
                  inovação, qualidade e satisfação dos nossos usuários.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compromisso */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3C5BFA] to-[#2C46E8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Nosso Compromisso
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Estamos comprometidos em tornar cada evento uma experiência única e memorável, 
            fornecendo as melhores ferramentas e conectando as pessoas certas.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Suporte disponível</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-100">Segurança garantida</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">∞</div>
              <div className="text-blue-100">Possibilidades criativas</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Faça parte da nossa história
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a milhares de pessoas que já transformaram seus eventos com a Evento+.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2C46E8] px-8 py-4 text-lg">
              Começar agora
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
                <img 
                  src={eventoLogo} 
                  alt="Evento+"
                  className="h-8 object-contain"
                />
              </div>
              <p className="text-gray-600">
                A plataforma completa para eventos únicos e memoráveis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/#pricing"><span className="hover:text-black cursor-pointer">Preços</span></Link></li>
                <li><Link href="/como-funciona"><span className="hover:text-black cursor-pointer">Como funciona</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/quem-somos"><span className="hover:text-black cursor-pointer">Quem somos</span></Link></li>
                <li><Link href="/contato"><span className="hover:text-black cursor-pointer">Contato</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/contato"><span className="hover:text-black cursor-pointer">Ajuda</span></Link></li>
                <li><Link href="/contato"><span className="hover:text-black cursor-pointer">Contato</span></Link></li>
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