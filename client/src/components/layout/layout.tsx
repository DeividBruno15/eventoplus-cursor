import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
      </div>
    );
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