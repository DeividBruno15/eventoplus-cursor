import { Link } from "wouter";
import eventoLogo from "@assets/logo evennto_1750165135991.png";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function FooterClickMax() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <img 
                src={eventoLogo} 
                alt="Evento+"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              A plataforma completa para conectar organizadores de eventos, prestadores de serviços e donos de espaços em todo o Brasil.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-[#3C5BFA] rounded-lg flex items-center justify-center hover:bg-[#2A4AE8] transition-colors">
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#3C5BFA] rounded-lg flex items-center justify-center hover:bg-[#2A4AE8] transition-colors">
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#3C5BFA] rounded-lg flex items-center justify-center hover:bg-[#2A4AE8] transition-colors">
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#3C5BFA] rounded-lg flex items-center justify-center hover:bg-[#2A4AE8] transition-colors">
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Links Rápidos</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/como-funciona" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link href="/quem-somos" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/help-center" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Serviços</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/events" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  Prestadores
                </Link>
              </li>
              <li>
                <Link href="/venues" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  Espaços
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-600 hover:text-[#3C5BFA] transition-colors">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-3 text-[#3C5BFA]" />
                contato@evento.com.br
              </li>
              <li className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-3 text-[#3C5BFA]" />
                +55 (11) 9999-9999
              </li>
              <li className="flex items-start text-gray-600">
                <MapPin className="h-4 w-4 mr-3 mt-1 text-[#3C5BFA] flex-shrink-0" />
                <span>São Paulo, SP<br />Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              © 2025 Evento+. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-600 hover:text-[#3C5BFA] text-sm transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-[#3C5BFA] text-sm transition-colors">
                Termos de Uso
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-[#3C5BFA] text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}