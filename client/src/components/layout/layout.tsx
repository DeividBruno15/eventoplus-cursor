import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./sidebar-new";
import Topbar from "./topbar";

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isMobile && showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
      
      <Sidebar 
        collapsed={isMobile ? false : sidebarCollapsed} 
        onToggle={handleSidebarToggle}
        isMobile={isMobile}
        showMobile={showMobileSidebar}
      />
      <Topbar 
        sidebarCollapsed={sidebarCollapsed} 
        onMobileMenuToggle={() => setShowMobileSidebar(!showMobileSidebar)}
        isMobile={isMobile}
      />
      <main className={`pt-16 transition-all duration-300 ${
        isMobile 
          ? 'ml-0' 
          : sidebarCollapsed 
            ? 'ml-16' 
            : 'ml-64'
      }`}>
        <div className="p-3 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}