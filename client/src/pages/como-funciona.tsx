import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Calendar, Users, Zap, Shield, Search, MessageCircle, CheckCircle } from "lucide-react";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

export default function ComoFunciona() {
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
                <span className="text-[#3C5BFA] font-medium cursor-pointer">Como funciona</span>
              </Link>
              <Link href="/quem-somos">
                <span className="text-gray-600 hover:text-black cursor-pointer">Quem somos</span>
              </Link>
              <Link href="/contato">
                <span className="text-gray-600 hover:text-black cursor-pointer">Contato</span>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-gray-300">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
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
            Como funciona a Evento+
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Entenda como nossa plataforma conecta organizadores com prestadores de serviços e espaços para eventos únicos.
          </p>
        </div>
      </section>

      {/* Para Prestadores */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Para Prestadores de Serviços
            </h2>
            <p className="text-xl text-gray-600">
              Amplie seu negócio oferecendo serviços para eventos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-blue-50 rounded-2xl">
              <div className="w-16 h-16 bg-[#3C5BFA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">1. Cadastre seu perfil</h3>
              <p className="text-gray-600">
                Crie seu perfil completo, defina seus serviços, preços e áreas de atuação. Mostre seu portfólio e experiência.
              </p>
            </div>

            <div className="text-center p-8 bg-orange-50 rounded-2xl">
              <div className="w-16 h-16 bg-[#FFA94D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">2. Receba solicitações</h3>
              <p className="text-gray-600">
                Organizadores interessados encontrarão seu perfil e entrarão em contato diretamente através da plataforma.
              </p>
            </div>

            <div className="text-center p-8 bg-green-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">3. Feche contratos</h3>
              <p className="text-gray-600">
                Negocie valores, prazos e condições. Use nossa plataforma para gerenciar contratos e pagamentos com segurança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Para Contratantes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Para Contratantes
            </h2>
            <p className="text-xl text-gray-600">
              Encontre os melhores profissionais para seu evento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#3C5BFA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">1. Defina seu evento</h3>
              <p className="text-gray-600">
                Cadastre seu evento com todas as informações: data, local, orçamento e tipo de serviços necessários.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#FFA94D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">2. Busque prestadores</h3>
              <p className="text-gray-600">
                Use nossos filtros avançados para encontrar prestadores por categoria, localização, preço e avaliações.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">3. Contrate com segurança</h3>
              <p className="text-gray-600">
                Converse diretamente com prestadores, compare propostas e contrate com total segurança através da plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Para Anunciantes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Para Anunciantes de Espaços
            </h2>
            <p className="text-xl text-gray-600">
              Maximize a ocupação dos seus espaços para eventos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-purple-50 rounded-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">1. Cadastre seu espaço</h3>
              <p className="text-gray-600">
                Adicione fotos, descrições, capacidade, localização e todas as comodidades disponíveis no seu espaço.
              </p>
            </div>

            <div className="text-center p-8 bg-indigo-50 rounded-2xl">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">2. Gerencie disponibilidade</h3>
              <p className="text-gray-600">
                Controle sua agenda, defina preços por período e mantenha sua disponibilidade sempre atualizada.
              </p>
            </div>

            <div className="text-center p-8 bg-teal-50 rounded-2xl">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">3. Receba reservas</h3>
              <p className="text-gray-600">
                Organizadores encontrarão seu espaço e farão reservas. Gerencie tudo através do painel administrativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos da plataforma */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Recursos da Plataforma
            </h2>
            <p className="text-xl text-gray-600">
              Ferramentas completas para uma experiência perfeita
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-[#3C5BFA]" />
              </div>
              <h4 className="font-semibold text-black mb-2">Chat em tempo real</h4>
              <p className="text-gray-600 text-sm">Converse diretamente com prestadores e organizadores</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-black mb-2">Pagamentos seguros</h4>
              <p className="text-gray-600 text-sm">Sistema integrado com Stripe para transações seguras</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-black mb-2">Agenda integrada</h4>
              <p className="text-gray-600 text-sm">Gerencie todos seus eventos e compromissos</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#FFA94D]" />
              </div>
              <h4 className="font-semibold text-black mb-2">Busca avançada</h4>
              <p className="text-gray-600 text-sm">Filtros inteligentes para encontrar exatamente o que precisa</p>
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
            Cadastre-se gratuitamente e comece a transformar seus eventos hoje mesmo.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-[#3C5BFA] hover:bg-gray-100 px-8 py-4 text-lg">
              Criar conta gratuita
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