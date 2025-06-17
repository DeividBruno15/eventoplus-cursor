import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { ArrowRight, Calendar, Users, Zap, Shield, Star, Play } from "lucide-react";
import { useState } from "react";
import eventoLogo from "@assets/logo evennto_1750165135991.png";
import microphoneIcon from "@assets/Microphone, Mic, Rec_1750126816998.png";
import foodIcon from "@assets/Group-1_1750126826239.png";
import organizationIcon from "@assets/Group_1750126830235.png";
import productionIcon from "@assets/video-camera-movie-film_1750126838703.png";
import cleaningIcon from "@assets/wash-bucket_1750126846234.png";
import appStoreImage from "@assets/image_1750168721135.png";

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
                  className="h-8 object-contain"
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
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6">
            Conecte. Organize.
            <br />
            <span className="text-[#3C5BFA]">Celebre.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            A plataforma completa que conecta organizadores de eventos com os melhores prestadores de serviços e espaços únicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <img 
              src={appStoreImage} 
              alt="Baixe na App Store e Google Play"
              className="h-16 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
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

      {/* Encontre seu perfil */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Encontre seu perfil na Evento+
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="w-16 h-16 bg-[#3C5BFA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Prestadores de Serviços</h3>
              <p className="text-gray-600 mb-6">
                Ofereça seus serviços para eventos e amplie seu negócio com nossa plataforma.
              </p>
              <Link href="/register?userType=prestador">
                <Button className="bg-[#3C5BFA] hover:bg-[#2C46E8] text-white">
                  Cadastrar como Prestador
                </Button>
              </Link>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <div className="w-16 h-16 bg-[#FFA94D] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Contratantes</h3>
              <p className="text-gray-600 mb-6">
                Encontre os melhores prestadores e espaços para realizar seu evento dos sonhos.
              </p>
              <Link href="/register?userType=contratante">
                <Button className="bg-[#FFA94D] hover:bg-orange-600 text-white">
                  Cadastrar como Contratante
                </Button>
              </Link>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">Anunciantes</h3>
              <p className="text-gray-600 mb-6">
                Anuncie seus espaços e aumente a visibilidade dos seus locais para eventos.
              </p>
              <Link href="/register?userType=anunciante">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Cadastrar como Anunciante
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tudo para seu evento perfeito */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              Tudo para seu evento perfeito
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Row 1 */}
            {/* Entretenimento */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <img src={microphoneIcon} alt="Entretenimento" className="w-12 h-12 object-contain" />
              </div>
              <h4 className="font-semibold text-black mb-2 text-center">Entretenimento</h4>
              <p className="text-gray-600 text-sm text-center">DJ, Banda, MC, Animação, Karaokê</p>
            </div>

            {/* Alimentação */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <img src={foodIcon} alt="Alimentação" className="w-12 h-12 object-contain" />
              </div>
              <h4 className="font-semibold text-black mb-2 text-center">Alimentação</h4>
              <p className="text-gray-600 text-sm text-center">Buffet, Chef, Bartender, Confeitaria</p>
            </div>

            {/* Organização */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <img src={organizationIcon} alt="Organização" className="w-12 h-12 object-contain" />
              </div>
              <h4 className="font-semibold text-black mb-2 text-center">Organização</h4>
              <p className="text-gray-600 text-sm text-center">Cerimonial, Wedding Planner, Decoração</p>
            </div>

            {/* Produção */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <img src={productionIcon} alt="Produção" className="w-12 h-12 object-contain" />
              </div>
              <h4 className="font-semibold text-black mb-2 text-center">Produção</h4>
              <p className="text-gray-600 text-sm text-center">Foto/Vídeo, Som/Luz, Cerimônia</p>
            </div>

            {/* Limpeza */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <img src={cleaningIcon} alt="Limpeza" className="w-12 h-12 object-contain" />
              </div>
              <h4 className="font-semibold text-black mb-2 text-center">Limpeza</h4>
              <p className="text-gray-600 text-sm text-center">Limpeza pré e pós evento, Organização</p>
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

          {/* User Type Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveUserType('prestadores')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeUserType === 'prestadores'
                      ? 'bg-[#3C5BFA] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Prestadores
                </button>
                <button
                  onClick={() => setActiveUserType('contratantes')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeUserType === 'contratantes'
                      ? 'bg-[#3C5BFA] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Contratantes
                </button>
                <button
                  onClick={() => setActiveUserType('anunciantes')}
                  className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeUserType === 'anunciantes'
                      ? 'bg-[#3C5BFA] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Anunciantes
                </button>
              </div>
            </div>
          </div>

          {/* Prestadores Plans */}
          {activeUserType === 'prestadores' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Essencial */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-black mb-2">Essencial</h4>
                  <div className="text-3xl font-bold text-black mb-1">R$ 0</div>
                  <div className="text-gray-600">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Perfil público básico</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">1 serviço ativo</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Suporte via FAQ</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Avaliações de clientes</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Acesso limitado às oportunidades</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-gray-300">
                  Começar grátis
                </Button>
              </div>

              {/* Profissional */}
              <div className="bg-[#3C5BFA] rounded-2xl p-8 shadow-lg relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#FFA94D] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Recomendado
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-white mb-2">Profissional</h4>
                  <div className="text-3xl font-bold text-white mb-1">R$ 14,90</div>
                  <div className="text-blue-200">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Até 5 serviços ativos</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Prioridade no ranking de busca</span>
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
                
                <Button className="w-full bg-white text-[#3C5BFA] hover:bg-gray-100">
                  Escolher plano
                </Button>
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
                
                <Button variant="outline" className="w-full border-gray-300">
                  Escolher plano
                </Button>
              </div>
            </div>
          )}

          {/* Contratantes Plans */}
          {activeUserType === 'contratantes' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Descubra */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-black mb-2">Descubra</h4>
                  <div className="text-3xl font-bold text-black mb-1">R$ 0</div>
                  <div className="text-gray-600">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Busca ilimitada</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Favoritar perfis</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Avaliar prestadores</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Histórico básico</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-gray-300">
                  Começar grátis
                </Button>
              </div>

              {/* Conecta */}
              <div className="bg-[#3C5BFA] rounded-2xl p-8 shadow-lg relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#FFA94D] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Recomendado
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-white mb-2">Conecta</h4>
                  <div className="text-3xl font-bold text-white mb-1">R$ 14,90</div>
                  <div className="text-blue-200">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Contato direto sem limite</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Briefings personalizados</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Agendamento e lembretes</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Suporte via chat</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-white text-[#3C5BFA] hover:bg-gray-100">
                  Escolher plano
                </Button>
              </div>

              {/* Gestão */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-black mb-2">Gestão</h4>
                  <div className="text-3xl font-bold text-black mb-1">R$ 29,90</div>
                  <div className="text-gray-600">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Histórico completo com exportação</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Requisições múltiplas</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Dashboard de controle</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Suporte premium + atendimento exclusivo</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-gray-300">
                  Escolher plano
                </Button>
              </div>
            </div>
          )}

          {/* Anunciantes Plans */}
          {activeUserType === 'anunciantes' && (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Divulgue */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-black mb-2">Divulgue</h4>
                  <div className="text-3xl font-bold text-black mb-1">R$ 0</div>
                  <div className="text-gray-600">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Cadastro de 1 local com fotos</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Aparecimento no diretório básico</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Até 3 leads por mês</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Estatísticas simples</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Visibilidade geográfica limitada</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-gray-300">
                  Começar grátis
                </Button>
              </div>

              {/* Alcance */}
              <div className="bg-[#3C5BFA] rounded-2xl p-8 shadow-lg relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#FFA94D] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Recomendado
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-white mb-2">Alcance</h4>
                  <div className="text-3xl font-bold text-white mb-1">R$ 14,90</div>
                  <div className="text-blue-200">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Cadastro de até 5 locais</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Destaque intermediário nas buscas</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Leads ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-[#3C5BFA] text-xs">✓</span>
                    </div>
                    <span className="text-white">Visibilidade segmentada por categoria</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white">Estatísticas completas</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-white text-[#3C5BFA] hover:bg-gray-100">
                  Escolher plano
                </Button>
              </div>

              {/* Vitrine */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-bold text-black mb-2">Vitrine</h4>
                  <div className="text-3xl font-bold text-black mb-1">R$ 29,90</div>
                  <div className="text-gray-600">por mês</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Locais ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Posição de destaque + selo</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Exibição em páginas de eventos</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Vídeos e tours virtuais</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700">Suporte prioritário + consultoria</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-gray-300">
                  Escolher plano
                </Button>
              </div>
            </div>
          )}
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold text-black">
                Como funciona a cobrança?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                A cobrança é mensal e você pode cancelar a qualquer momento. Não há taxas de cancelamento.
                O pagamento é processado via Stripe com cartão de crédito.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold text-black">
                Posso mudar de plano?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento através das configurações.
                A mudança é aplicada imediatamente.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold text-black">
                Existe período de teste?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Sim, todos os planos pagos têm 7 dias de teste gratuito. Você pode cancelar sem custos durante este período.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-semibold text-black">
                Como funciona o suporte?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Oferecemos suporte via chat e email. Planos pagos têm prioridade no atendimento e acesso a suporte especializado.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-semibold text-black">
                Os planos são específicos para cada tipo de usuário?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Sim, cada tipo de usuário (Prestadores, Contratantes e Anunciantes) possui planos específicos com funcionalidades adequadas ao seu perfil.
                Não há planos híbridos.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-semibold text-black">
                Qual plano é mais recomendado?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Para cada categoria de usuário, o plano intermediário é sempre o mais recomendado: Profissional para Prestadores,
                Conecta para Contratantes e Alcance para Anunciantes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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