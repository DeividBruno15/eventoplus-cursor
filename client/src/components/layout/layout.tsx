import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./sidebar-new";
import Topbar from "./topbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Para usuários não autenticados, não renderiza nada (AuthGuard cuida do redirecionamento)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <Topbar sidebarCollapsed={sidebarCollapsed} />
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}