
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Home, 
  Calendar, 
  Users, 
  MapPin, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  HeadphonesIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Star,
  CreditCard,
  Plus,
  User,
  ChevronDown,
  Camera,
  RefreshCw,
  Search,
  ShoppingCart,
  FileText,
  Shield,
  Bell,
  CalendarDays,
  QrCode,
  Code,
  Percent
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const menuItems = {
    contratante: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: Search, label: "Buscar", path: "/search" },
      { icon: CalendarDays, label: "Meus Eventos", path: "/events" },
      { icon: Plus, label: "Criar Evento", path: "/events/create" },
      { icon: Users, label: "Prestadores", path: "/services" },
      { icon: MapPin, label: "Espaços", path: "/venues" },
      { icon: QrCode, label: "Pagamento PIX", path: "/pix-payment" },
      { icon: MessageSquare, label: "Chat", path: "/chat" },
      { icon: Bell, label: "Notificações", path: "/notifications" },
      { icon: ShoppingCart, label: "Carrinho", path: "/cart" },
      { icon: FileText, label: "Contratos", path: "/contracts" },
      { icon: Code, label: "API Pública", path: "/public-api" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
    ],
    prestador: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: Search, label: "Buscar", path: "/search" },
      { icon: CalendarDays, label: "Eventos", path: "/events" },
      { icon: Star, label: "Gerenciar Serviços", path: "/services/manage" },
      { icon: QrCode, label: "Pagamento PIX", path: "/pix-payment" },
      { icon: MessageSquare, label: "Chat", path: "/chat" },
      { icon: Bell, label: "Notificações", path: "/notifications" },
      { icon: FileText, label: "Contratos", path: "/contracts" },
      { icon: Code, label: "API Pública", path: "/public-api" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
    ],
    anunciante: [
      { icon: Home, label: "Dashboard", path: "/dashboard" },
      { icon: Search, label: "Buscar", path: "/search" },
      { icon: MapPin, label: "Gerenciar Espaços", path: "/venues/manage" },
      { icon: CalendarDays, label: "Eventos", path: "/events" },
      { icon: QrCode, label: "Pagamento PIX", path: "/pix-payment" },
      { icon: MessageSquare, label: "Chat", path: "/chat" },
      { icon: Bell, label: "Notificações", path: "/notifications" },
      { icon: FileText, label: "Contratos", path: "/contracts" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
    ]
  };

  const supportItems = [
    { icon: CreditCard, label: "Assinatura", path: "/subscription/manage" },
    { icon: HelpCircle, label: "Central de Ajuda", path: "/help-center" },
    { icon: HeadphonesIcon, label: "Suporte", path: "/support" },
  ];

  const currentMenuItems = menuItems[user.userType] || menuItems.contratante;

  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/") return true;
    if (path === "/events" && location.startsWith("/events")) return true;
    if (path === "/services" && location.startsWith("/services")) return true;
    if (path === "/pix-payment" && location === "/pix-payment") return true;
    if (path === "/venues" && location.startsWith("/venues")) return true;
    return location === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E+</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-black">Evento+</h2>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(!collapsed)}
              className="ml-auto"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.userType}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    collapsed ? 'px-2' : 'px-3'
                  } ${active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.label === "Chat" && (
                        <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                          3
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Support Section */}
        <div className="border-t border-gray-200">
          <div className="p-2 space-y-1">
            {!collapsed && (
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Suporte
                </p>
              </div>
            )}
            
            {supportItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      collapsed ? 'px-2' : 'px-3'
                    } ${active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Icon className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                  </Button>
                </Link>
              );
            })}

            <Separator className="my-2" />
            
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                collapsed ? 'px-2' : 'px-3'
              } text-red-600 hover:bg-red-50 hover:text-red-700`}
              onClick={handleLogout}
            >
              <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && <span className="flex-1 text-left">Sair</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}