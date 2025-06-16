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

            {/* Hero Image/Cards */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-[#3C5BFA] rounded-xl flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-black mb-2">Organize</h3>
                      <p className="text-gray-600 text-sm">Crie e gerencie eventos com facilidade</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-[#FFA94D] rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-black mb-2">Conecte</h3>
                      <p className="text-gray-600 text-sm">Encontre prestadores qualificados</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-black mb-2">Execute</h3>
                      <p className="text-gray-600 text-sm">Realize eventos incríveis</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
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

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa para simplificar todo o processo de planejamento e execução de eventos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#3C5BFA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Gestão Completa</h3>
              <p className="text-gray-600">
                Organize todos os aspectos do seu evento em uma única plataforma intuitiva.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFA94D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Rede Qualificada</h3>
              <p className="text-gray-600">
                Acesse uma rede de prestadores verificados e espaços de qualidade.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Pagamentos Seguros</h3>
              <p className="text-gray-600">
                Transações protegidas com tecnologia de ponta e total transparência.
              </p>
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