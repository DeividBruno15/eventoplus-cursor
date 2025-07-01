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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import eventoLogo from "@assets/logo evennto_1750165135991.png";
import { 
  Home, 
  Calendar, 
  Users, 
  MapPin, 
  MessageSquare, 
  BarChart3, 
  Settings, 
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
  HelpCircle,
  Headphones,
  Brain
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  isMobile?: boolean;
  showMobile?: boolean;
}

export default function Sidebar({ collapsed, onToggle, isMobile = false, showMobile = false }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!profileImage) return;

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const imageData = reader.result as string;
          
          await apiRequest("POST", "/api/user/profile-image", { imageData });
          
          toast({
            title: "Sucesso",
            description: "Foto de perfil atualizada com sucesso!",
          });
          
          setIsProfileDialogOpen(false);
          setProfileImage(null);
          setProfileImagePreview(null);
          window.location.reload();
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao atualizar foto de perfil",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsDataURL(profileImage);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar imagem",
        variant: "destructive",
      });
    }
  };

  const handleUserTypeChange = async (newType: string) => {
    try {
      await apiRequest("PUT", "/api/user/type", { userType: newType });
      
      toast({
        title: "Sucesso",
        description: `Perfil alterado para ${getUserTypeLabel(newType)} com sucesso!`,
      });
      
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar tipo de perfil",
        variant: "destructive",
      });
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch(type) {
      case 'prestador': return 'Prestador';
      case 'contratante': return 'Contratante';
      case 'anunciante': return 'Anunciante';
      default: return type;
    }
  };

  const getUserTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'prestador': return 'bg-blue-100 text-blue-800';
      case 'contratante': return 'bg-green-100 text-green-800';
      case 'anunciante': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Menu reorganizado em categorias lógicas
  const getMenuCategories = () => {
    const baseCategories = [
      {
        title: "Principal",
        items: [
          { href: "/dashboard", icon: Home, label: "Dashboard" },
          { href: "/ai-recommendations", icon: Brain, label: "Recomendações IA" },
        ]
      },
      {
        title: "Comunicação",
        items: [
          { href: "/chat", icon: MessageSquare, label: "Chat" },
          { href: "/agenda", icon: Calendar, label: "Agenda" },
        ]
      }
    ];

    switch (user.userType) {
      case "prestador":
        return [
          ...baseCategories,
          {
            title: "Trabalho",
            items: [
              { href: "/events", icon: Calendar, label: "Oportunidades" },
              { href: "/services", icon: CreditCard, label: "Meus Serviços" },
              { href: "/contracts", icon: FileText, label: "Contratos" },
            ]
          },
          {
            title: "Analytics",
            items: [
              { href: "/analytics", icon: BarChart3, label: "Análises" },
            ]
          }
        ];
      
      case "contratante":
        return [
          ...baseCategories,
          {
            title: "Eventos",
            items: [
              { href: "/events", icon: Calendar, label: "Meus Eventos" },
              { href: "/search", icon: Search, label: "Buscar Prestadores" },
              { href: "/contracts", icon: FileText, label: "Contratos" },
            ]
          },
          {
            title: "Locais",
            items: [
              { href: "/venues", icon: MapPin, label: "Buscar Espaços" },
            ]
          }
        ];
      
      case "anunciante":
        return [
          ...baseCategories,
          {
            title: "Espaços",
            items: [
              { href: "/venues", icon: MapPin, label: "Meus Espaços" },
            ]
          },
          {
            title: "Analytics",
            items: [
              { href: "/analytics", icon: BarChart3, label: "Análises" },
            ]
          }
        ];
      
      default:
        return baseCategories;
    }
  };

  const menuCategories = getMenuCategories();

  return (
    <div className={`${isMobile ? 'fixed' : 'fixed'} left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      isMobile 
        ? `w-64 ${showMobile ? 'translate-x-0' : '-translate-x-full'}`
        : collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <img 
                  src={eventoLogo} 
                  alt="Evento+"
                  className="h-8 object-contain"
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(!collapsed)}
              className="p-1 h-8 w-8"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={(user as any).profileImage || ""} />
                <AvatarFallback className="bg-[#3C5BFA] text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#3C5BFA] text-white hover:bg-[#3C5BFA]/90"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Foto de Perfil</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profileImage">Escolher nova foto</Label>
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="mt-1"
                      />
                    </div>
                    
                    {profileImagePreview && (
                      <div className="flex justify-center">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={profileImagePreview} />
                        </Avatar>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleProfileImageUpload} disabled={!profileImage}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.username}</div>
                <div className="mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`w-full justify-between text-xs h-7 ${getUserTypeBadgeColor(user.userType)} border-none`}
                      >
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getUserTypeLabel(user.userType)}
                        </div>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <div className="px-2 py-1 text-xs text-gray-500 font-medium">Trocar tipo de perfil</div>
                      <DropdownMenuItem 
                        onClick={() => handleUserTypeChange('prestador')}
                        className="flex items-center gap-2"
                        disabled={user.userType === 'prestador'}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-medium">Prestador</div>
                            <div className="text-xs text-gray-500">Ofereça seus serviços</div>
                          </div>
                        </div>
                        {user.userType === 'prestador' && <Star className="h-3 w-3 text-blue-500" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUserTypeChange('contratante')}
                        className="flex items-center gap-2"
                        disabled={user.userType === 'contratante'}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div>
                            <div className="font-medium">Contratante</div>
                            <div className="text-xs text-gray-500">Organize eventos</div>
                          </div>
                        </div>
                        {user.userType === 'contratante' && <Star className="h-3 w-3 text-green-500" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUserTypeChange('anunciante')}
                        className="flex items-center gap-2"
                        disabled={user.userType === 'anunciante'}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <div>
                            <div className="font-medium">Anunciante</div>
                            <div className="text-xs text-gray-500">Anuncie espaços</div>
                          </div>
                        </div>
                        {user.userType === 'anunciante' && <Star className="h-3 w-3 text-purple-500" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items por Categoria */}
        <div className="flex-1 p-2 space-y-4 overflow-y-auto">
          {menuCategories.map((category, categoryIndex) => (
            <div key={category.title}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-[#3C5BFA] text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      } ${collapsed ? 'justify-center' : ''}`}>
                        <Icon className="h-5 w-5" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Bottom Section */}
        <div className="p-2 space-y-1">
          <Link href="/help-center">
            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
              location === "/help-center" 
                ? "bg-[#3C5BFA] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            } ${collapsed ? 'justify-center' : ''}`}>
              <User className="h-5 w-5" />
              {!collapsed && <span>Central de Ajuda</span>}
            </div>
          </Link>
          
          <Link href="/support">
            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
              location === "/support" 
                ? "bg-[#3C5BFA] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            } ${collapsed ? 'justify-center' : ''}`}>
              <MessageSquare className="h-5 w-5" />
              {!collapsed && <span>Suporte</span>}
            </div>
          </Link>
          
          <Link href="/settings">
            <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
              location === "/settings" 
                ? "bg-[#3C5BFA] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            } ${collapsed ? 'justify-center' : ''}`}>
              <Settings className="h-5 w-5" />
              {!collapsed && <span>Configurações</span>}
            </div>
          </Link>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full text-gray-600 hover:bg-red-50 hover:text-red-600 ${
              collapsed ? 'p-3' : 'justify-start p-3'
            }`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}