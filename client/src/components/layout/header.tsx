import { Button } from "@/components/ui/button";
import { Calendar, Menu, MessageCircle, BarChart3, Building, Users, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import NotificationCenter from "@/components/notifications/notification-center";
import eventoLogo from "@assets/logo evennto_1750165135991.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <img 
                src={eventoLogo} 
                alt="Evento+"
                className="h-6 object-contain"
              />
            </Link>
          </div>
          
          {user ? (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-primary transition-colors">
                {user.userType === 'contratante' ? 'Meus Eventos' : 'Oportunidades'}
              </Link>
              {user.userType === 'prestador' && (
                <>
                  <Link href="/services" className="text-gray-600 hover:text-primary transition-colors">
                    Prestadores
                  </Link>
                  <Link href="/analytics" className="text-gray-600 hover:text-primary transition-colors">
                    Analytics
                  </Link>
                </>
              )}
              {user.userType === 'anunciante' && (
                <Link href="/venues" className="text-gray-600 hover:text-primary transition-colors">
                  Meus Espaços
                </Link>
              )}
              <Link href="/chat" className="text-gray-600 hover:text-primary transition-colors">
                Chat
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">
                Funcionalidades
              </a>
              <Link href="/pricing" className="text-gray-600 hover:text-primary transition-colors">
                Preços
              </Link>
              <a href="#about" className="text-gray-600 hover:text-primary transition-colors">
                Sobre
              </a>
              <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">
                Contato
              </a>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-primary">
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/events">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {user.userType === 'contratante' ? 'Meus Eventos' : 'Oportunidades'}
                      </Link>
                    </DropdownMenuItem>
                    {user.userType === 'prestador' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/services">
                            <Users className="h-4 w-4 mr-2" />
                            Prestadores
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/analytics">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user.userType === 'anunciante' && (
                      <DropdownMenuItem asChild>
                        <Link href="/venues">
                          <Building className="h-4 w-4 mr-2" />
                          Meus Espaços
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/chat">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/pricing">Planos & Preços</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-primary font-medium">
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-primary text-white hover:bg-blue-700 font-medium">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
