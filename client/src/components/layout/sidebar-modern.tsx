import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Home,
  Calendar,
  Users,
  Building,
  Settings,
  MessageSquare,
  Search,
  PlusCircle,
  BarChart3,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  CreditCard,
  Shield,
  Briefcase,
  Star,
  ShoppingCart,
  FileText,
  Activity,
  Zap,
  Brain,
  Percent,
  Split,
  Key
} from "lucide-react";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  isMobile?: boolean;
  showMobile?: boolean;
  onMobileToggle?: () => void;
}

export default function SidebarModern({ 
  collapsed, 
  onToggle, 
  isMobile = false, 
  showMobile = false,
  onMobileToggle 
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "prestador": return "Prestador";
      case "contratante": return "Organizador";
      case "anunciante": return "Anunciante";
      default: return "Usuário";
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      { 
        section: "Principal",
        items: [
          { label: "Dashboard", href: "/dashboard", icon: Home },
          { label: "Mensagens", href: "/chat", icon: MessageSquare },
          { label: "Buscar", href: "/search", icon: Search },
          { label: "Agenda", href: "/agenda", icon: Calendar },
        ]
      }
    ];

    const userSpecificItems = {
      prestador: [
        {
          section: "Serviços",
          items: [
            { label: "Meus Serviços", href: "/services/manage", icon: Briefcase },
            { label: "Novo Serviço", href: "/services/create", icon: PlusCircle },
            { label: "Eventos", href: "/events", icon: Calendar },
          ]
        }
      ],
      contratante: [
        {
          section: "Eventos",
          items: [
            { label: "Meus Eventos", href: "/events", icon: Calendar },
            { label: "Criar Evento", href: "/events/create", icon: PlusCircle },
            { label: "Prestadores", href: "/services", icon: Users },
          ]
        }
      ],
      anunciante: [
        {
          section: "Espaços",
          items: [
            { label: "Meus Espaços", href: "/venues/manage", icon: Building },
            { label: "Novo Espaço", href: "/venues/create", icon: PlusCircle },
            { label: "Locais", href: "/venues", icon: Building },
          ]
        }
      ]
    };

    const analyticsSection = [
      {
        section: "Analytics",
        items: [
          { label: "Analytics", href: "/analytics", icon: BarChart3 },
          { label: "Recomendações IA", href: "/ai-recommendations", icon: Brain },
        ]
      }
    ];

    const businessSection = [
      {
        section: "Negócios",
        items: [
          { label: "Split Payments", href: "/split-payments", icon: Split },
          { label: "Comissões Variáveis", href: "/variable-commissions", icon: Percent },
          { label: "API Pública", href: "/api-management", icon: Key },
        ]
      }
    ];

    const otherSections = [
      {
        section: "Outros",
        items: [
          { label: "Avaliações", href: "/reviews", icon: Star },
          { label: "Carrinho", href: "/cart", icon: ShoppingCart },
          { label: "Contratos", href: "/contracts", icon: FileText },
          { label: "Assinatura", href: "/subscription", icon: CreditCard },
          { label: "Autenticação 2FA", href: "/two-factor", icon: Shield },
          { label: "PIX Payment", href: "/pix-payment", icon: Zap },
          { label: "Notificações", href: "/notifications", icon: Bell },
          { label: "API Docs", href: "/api-docs", icon: Activity },
        ]
      },
      {
        section: "Suporte",
        items: [
          { label: "Central de Ajuda", href: "/help-center", icon: HelpCircle },
          { label: "Suporte", href: "/support", icon: MessageSquare },
          { label: "Configurações", href: "/settings", icon: Settings },
        ]
      }
    ];

    return [
      ...commonItems,
      ...(userSpecificItems[user.userType as keyof typeof userSpecificItems] || []),
      ...analyticsSection,
      ...businessSection,
      ...otherSections
    ];
  };

  const menuSections = getMenuItems();

  return (
    <div 
      className={cn(
        "saas-sidebar h-full flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        isMobile && "fixed inset-y-0 left-0 z-50",
        isMobile && !showMobile && "-translate-x-full"
      )}
    >
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img 
                src={eventoLogo} 
                alt="Evento+"
                className="h-7 object-contain"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(!collapsed)}
            className="h-7 w-7 p-0 hover:bg-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 p-1 hover:bg-accent rounded-lg transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as any).profileImage || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="saas-body font-medium truncate">{user.username}</div>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="saas-badge-neutral h-4 text-xs">
                      {getUserTypeLabel(user.userType)}
                    </Badge>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 space-y-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!collapsed && (
                <div className="saas-sidebar-section mb-2">
                  {section.section}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  const isActive = location === item.href || 
                    (item.href !== "/dashboard" && location.startsWith(item.href));
                  
                  return (
                    <Link key={itemIndex} href={item.href}>
                      <div className={cn(
                        "saas-sidebar-item",
                        isActive && "active bg-accent text-foreground"
                      )}>
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          {!collapsed && (
            <div className="flex-1">
              <p className="saas-caption">Evento+ v2.0</p>
              <p className="saas-caption text-emerald-600">● Online</p>
            </div>
          )}
          <div className="saas-status-dot saas-status-success"></div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && showMobile && (
        <div 
          className="fixed inset-0 bg-black/20 z-40" 
          onClick={onMobileToggle}
        />
      )}
    </div>
  );
}