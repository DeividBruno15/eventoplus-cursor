import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Calendar, Users, MapPin, MessageSquare, Target, CheckCircle, Star, Play } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import eventoLogo from "@assets/logo evennto_1750165135991.png";
import entertainmentIcon from "@assets/video-camera-movie-film_1750126838703.png";
import foodIcon from "@assets/Group_1750126830235.png";
import organizationIcon from "@assets/wash-bucket_1750126846234.png";

export default function HomeClean() {
  const [activeUserType, setActiveUserType] = useState<'prestadores' | 'contratantes' | 'anunciantes'>('prestadores');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <img 
                  src={eventoLogo} 
                  alt="Evento+"
                  className="h-6 object-contain"
                />
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#pricing" className="text-gray-600 hover:text-black">Preços</a>
              <Link href="/como-funciona">
                <span className="text-gray-600 hover:text-black cursor-pointer">Como funciona</span>
              </Link>
              <Link href="/quem-somos">
                <span className="text-gray-600 hover:text-black cursor-pointer">Quem somos</span>
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
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Transforme seus eventos com a <span className="text-[#3C5BFA]">Evento+</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A plataforma completa que conecta organizadores com prestadores de serviços e espaços para eventos únicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register">
              <Button size="lg" className="bg-[#3C5BFA] hover:bg-[#2C46E8] px-8 py-4 text-lg">
                Começar gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-gray-300 px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Ver demonstração
            </Button>
          </div>

          {/* Download App Image */}
          <div className="max-w-md mx-auto">
            <img 
              src="/api/placeholder/400/120" 
              alt="Download no App Store e Google Play"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Planos e benefícios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Escolha o plano ideal para seu perfil e comece a transformar seus eventos.
            </p>
            
            {/* User Type Tabs */}
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                {(['prestadores', 'contratantes', 'anunciantes'] as const).map((userType) => (
                  <button
                    key={userType}
                    onClick={() => setActiveUserType(userType)}
                    className={`px-6 py-3 rounded-md font-medium transition-all ${
                      activeUserType === userType
                        ? 'bg-[#3C5BFA] text-white'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {userType === 'prestadores' && 'Prestadores'}
                    {userType === 'contratantes' && 'Contratantes'}
                    {userType === 'anunciantes' && 'Anunciantes'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prestadores Plans */}
          {activeUserType === 'prestadores' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Essencial */}
              <div className="bg-[#3C5BFA] rounded-2xl p-8 shadow-lg text-white">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-white mb-2">Essencial</h4>
                  <div className="text-3xl font-bold text-white mb-1">R$ 0</div>
                  <div className="text-blue-200">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Até 3 serviços cadastrados</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Perfil básico na plataforma</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Métricas básicas (visitas, contatos)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Suporte via chat comercial</span>
                  </li>
                </ul>
                
                <Link href="/auth/login">
                  <Button className="w-full bg-white text-[#3C5BFA] hover:bg-gray-100">
                    Escolher plano
                  </Button>
                </Link>
              </div>

              {/* Premium */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-black mb-2">Premium</h4>
                  <div className="text-3xl font-bold text-black mb-1">R$ 29,90</div>
                  <div className="text-gray-600">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Serviços ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Destaque nas categorias</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Painel completo de performance</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Agendamento com cliente</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Suporte prioritário + grupo WhatsApp</span>
                  </li>
                </ul>
                
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full border-gray-300">
                    Escolher plano
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#3C5BFA]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Escolha seu perfil e comece a transformar seus eventos hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?userType=prestador">
              <Button size="lg" className="bg-white text-[#3C5BFA] hover:bg-gray-100 px-6 py-3 text-base">
                Cadastrar como Prestador
              </Button>
            </Link>
            <Link href="/auth/register?userType=contratante">
              <Button size="lg" className="bg-[#FFA94D] text-white hover:bg-orange-600 px-6 py-3 text-base">
                Cadastrar como Contratante
              </Button>
            </Link>
            <Link href="/auth/register?userType=anunciante">
              <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 text-base">
                Cadastrar como Anunciante
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}