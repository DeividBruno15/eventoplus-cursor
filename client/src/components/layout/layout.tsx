import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./sidebar-modern";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Para usuários não autenticados, não renderiza nada (AuthGuard cuida do redirecionamento)
  if (!user) {
    return null;
  }

  const handleSidebarToggle = (collapsed: boolean) => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setSidebarCollapsed(collapsed);
    }
  };

  return (
    <div className="saas-page">
      <div className="flex h-screen">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
          showMobile={showMobileSidebar}
          onMobileToggle={() => setShowMobileSidebar(!showMobileSidebar)}
        />
        
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}