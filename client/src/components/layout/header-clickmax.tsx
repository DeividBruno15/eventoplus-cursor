import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import eventoLogo from "@assets/logo evennto_1750165135991.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function HeaderClickMax() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src={eventoLogo} 
                alt="Evento+"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/como-funciona" className="text-gray-700 hover:text-[#3C5BFA] font-medium transition-colors">
              Como Funciona
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-[#3C5BFA] font-medium transition-colors">
              Planos
            </Link>
            <Link href="/quem-somos" className="text-gray-700 hover:text-[#3C5BFA] font-medium transition-colors">
              Sobre Nós
            </Link>
            <Link href="/contato" className="text-gray-700 hover:text-[#3C5BFA] font-medium transition-colors">
              Contato
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-700 hover:text-[#3C5BFA]">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-[#3C5BFA] font-medium">
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white px-6 py-2 rounded-lg font-medium shadow-sm">
                    Cadastrar Grátis
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/como-funciona" className="text-gray-700 hover:text-[#3C5BFA] font-medium">
                Como Funciona
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-[#3C5BFA] font-medium">
                Planos
              </Link>
              <Link href="/quem-somos" className="text-gray-700 hover:text-[#3C5BFA] font-medium">
                Sobre Nós
              </Link>
              <Link href="/contato" className="text-gray-700 hover:text-[#3C5BFA] font-medium">
                Contato
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start text-gray-700">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={logout}
                      className="w-full justify-start text-red-600"
                    >
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" className="w-full justify-start text-gray-700">
                        Entrar
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button className="w-full bg-[#3C5BFA] hover:bg-[#2A4AE8] text-white">
                        Cadastrar Grátis
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}