import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationCenter from "@/components/notifications/notification-center";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { Link } from "wouter";

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export default function Topbar({ sidebarCollapsed }: TopbarProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-20 flex items-center justify-end px-6 transition-all duration-300 ${
      sidebarCollapsed ? 'left-16' : 'left-64'
    }`}>
      <div className="flex items-center space-x-4">
        {/* Notificações */}
        <NotificationCenter />

        {/* Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 px-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-white text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.userType}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900">
                {user.username}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <DropdownMenuSeparator />
            
            <Link href="/profile">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
            </Link>
            
            <Link href="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator />
            
            <Link href="/help">
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                Central de Ajuda
              </DropdownMenuItem>
            </Link>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}