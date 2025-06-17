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
  Headphones
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
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
      const formData = new FormData();
      formData.append('profileImage', profileImage);

      await apiRequest("POST", "/api/user/profile-image", formData);
      
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

  // Diferentes menus baseados no tipo de usuário
  const getMenuItems = () => {
    const commonItems = [
      { href: "/dashboard", icon: Home, label: "Dashboard" },
      { href: "/agenda", icon: Calendar, label: "Agenda" },
      { href: "/chat", icon: MessageSquare, label: "Chat" },
    ];

    switch (user.userType) {
      case "prestador":
        return [
          ...commonItems,
          { href: "/events", icon: Calendar, label: "Oportunidades" },
          { href: "/services", icon: CreditCard, label: "Meus Serviços" },
          { href: "/analytics", icon: BarChart3, label: "Análises" },
          { href: "/contracts", icon: FileText, label: "Contratos" },
        ];
      
      case "contratante":
        return [
          ...commonItems,
          { href: "/events", icon: Calendar, label: "Meus Eventos" },
          { href: "/search", icon: Search, label: "Buscar Prestadores" },
          { href: "/venues", icon: MapPin, label: "Buscar Espaços" },
          { href: "/contracts", icon: FileText, label: "Contratos" },
        ];
      
      case "anunciante":
        return [
          ...commonItems,
          { href: "/venues", icon: MapPin, label: "Meus Espaços" },
          { href: "/analytics", icon: BarChart3, label: "Análises" },
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-[#3C5BFA]">Evento+</div>
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
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getUserTypeBadgeColor(user.userType)}`}>
                    {getUserTypeLabel(user.userType)}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleUserTypeChange('prestador')}>
                        <User className="h-4 w-4 mr-2" />
                        Prestador
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserTypeChange('contratante')}>
                        <Users className="h-4 w-4 mr-2" />
                        Contratante
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserTypeChange('anunciante')}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Anunciante
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-[#3C5BFA] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                } ${collapsed ? 'justify-center' : ''}`}>
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </a>
              </Link>
            );
          })}
        </div>

        <Separator />

        {/* Bottom Section */}
        <div className="p-2 space-y-1">
          <Link href="/help-center">
            <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location === "/help-center" 
                ? "bg-[#3C5BFA] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            } ${collapsed ? 'justify-center' : ''}`}>
              <User className="h-5 w-5" />
              {!collapsed && <span>Central de Ajuda</span>}
            </a>
          </Link>
          
          <Link href="/support">
            <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location === "/support" 
                ? "bg-[#3C5BFA] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            } ${collapsed ? 'justify-center' : ''}`}>
              <Headphones className="h-5 w-5" />
              {!collapsed && <span>Suporte</span>}
            </a>
          </Link>
          
          <Link href="/settings">
            <a className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              location === "/settings" 
                ? "bg-[#3C5BFA] text-white" 
                : "text-gray-600 hover:bg-gray-100"
            } ${collapsed ? 'justify-center' : ''}`}>
              <Settings className="h-5 w-5" />
              {!collapsed && <span>Configurações</span>}
            </a>
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