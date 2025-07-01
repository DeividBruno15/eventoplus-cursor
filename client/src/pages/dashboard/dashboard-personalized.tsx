import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  Star,
  MessageSquare,
  MapPin,
  Building,
  BarChart3,
  Grid3X3,
  Settings,
  Eye
} from "lucide-react";
import WidgetCard from "@/components/dashboard/widget-card";

// Interface para definir a estrutura de um widget
interface Widget {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    percentage?: number;
  };
  chart?: {
    type: 'line' | 'bar' | 'doughnut';
    data: any[];
  };
  color?: string;
  icon?: React.ComponentType<any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
}

export default function PersonalizedDashboard() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Buscar dados do dashboard
  const { data: dashboardData = {}, isLoading } = useQuery({
    queryKey: ["/api/dashboard/personalized", user?.id],
    enabled: !!user,
  });

  // Dados mock para demonstração - em produção viriam da API
  const mockChartData = {
    line: [
      { label: 'Jan', value: 12 },
      { label: 'Feb', value: 19 },
      { label: 'Mar', value: 15 },
      { label: 'Apr', value: 25 },
      { label: 'May', value: 22 },
      { label: 'Jun', value: 30 },
      { label: 'Jul', value: 28 }
    ],
    bar: [
      { label: 'Seg', value: 8 },
      { label: 'Ter', value: 12 },
      { label: 'Qua', value: 6 },
      { label: 'Qui', value: 15 },
      { label: 'Sex', value: 10 },
      { label: 'Sab', value: 18 },
      { label: 'Dom', value: 14 }
    ]
  };

  // Widgets predefinidos baseados no tipo de usuário
  const getDefaultWidgets = (): Widget[] => {
    const commonWidgets = [
      {
        id: 'messages',
        title: 'Mensagens Não Lidas',
        value: 3,
        subtitle: 'Novas conversas',
        trend: { value: '+2', direction: 'up' as const },
        icon: MessageSquare,
        color: 'bg-green-50',
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        visible: true
      },
      {
        id: 'calendar',
        title: 'Próximos Eventos',
        value: 7,
        subtitle: 'Esta semana',
        trend: { value: '+1', direction: 'up' as const },
        icon: Calendar,
        color: 'bg-blue-50',
        position: { x: 1, y: 0 },
        size: { width: 1, height: 1 },
        visible: true
      }
    ];

    switch (user?.userType) {
      case 'prestador':
        return [
          ...commonWidgets,
          {
            id: 'applications',
            title: 'Candidaturas Ativas',
            value: 12,
            subtitle: 'Aguardando resposta',
            trend: { value: '+3', direction: 'up' as const },
            icon: Users,
            color: 'bg-purple-50',
            chart: { type: 'line', data: mockChartData.line },
            position: { x: 2, y: 0 },
            size: { width: 1, height: 1 },
            visible: true
          },
          {
            id: 'revenue',
            title: 'Receita Mensal',
            value: 'R$ 8.500',
            subtitle: 'Este mês',
            trend: { value: '+22%', direction: 'up' as const },
            icon: DollarSign,
            color: 'bg-emerald-50',
            chart: { type: 'bar', data: mockChartData.bar },
            position: { x: 3, y: 0 },
            size: { width: 1, height: 1 },
            visible: true
          },
          {
            id: 'rating',
            title: 'Avaliação Média',
            value: '4.8',
            subtitle: 'Baseado em 47 avaliações',
            trend: { value: '4.8/5.0', direction: 'neutral' as const },
            icon: Star,
            color: 'bg-yellow-50',
            chart: { type: 'doughnut', data: [{ percentage: 96 }] },
            position: { x: 0, y: 1 },
            size: { width: 2, height: 1 },
            visible: true
          }
        ];

      case 'contratante':
        return [
          ...commonWidgets,
          {
            id: 'events',
            title: 'Eventos Ativos',
            value: 5,
            subtitle: 'Em andamento',
            trend: { value: '+1', direction: 'up' as const },
            icon: Calendar,
            color: 'bg-blue-50',
            chart: { type: 'line', data: mockChartData.line },
            position: { x: 2, y: 0 },
            size: { width: 1, height: 1 },
            visible: true
          },
          {
            id: 'budget',
            title: 'Orçamento Total',
            value: 'R$ 25.000',
            subtitle: 'Todos os eventos',
            trend: { value: '+15%', direction: 'up' as const },
            icon: DollarSign,
            color: 'bg-emerald-50',
            position: { x: 3, y: 0 },
            size: { width: 1, height: 1 },
            visible: true
          }
        ];

      case 'anunciante':
        return [
          ...commonWidgets,
          {
            id: 'venues',
            title: 'Espaços Cadastrados',
            value: 3,
            subtitle: 'Ativos',
            trend: { value: '+1', direction: 'up' as const },
            icon: Building,
            color: 'bg-orange-50',
            position: { x: 2, y: 0 },
            size: { width: 1, height: 1 },
            visible: true
          },
          {
            id: 'bookings',
            title: 'Reservas do Mês',
            value: 18,
            subtitle: 'Confirmadas',
            trend: { value: '+35%', direction: 'up' as const },
            icon: MapPin,
            color: 'bg-purple-50',
            chart: { type: 'bar', data: mockChartData.bar },
            position: { x: 3, y: 0 },
            size: { width: 1, height: 1 },
            visible: true
          }
        ];

      default:
        return commonWidgets;
    }
  };

  // Inicializar widgets na primeira vez
  useEffect(() => {
    const savedWidgets = localStorage.getItem(`dashboard-widgets-${user?.id}`);
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      const defaultWidgets = getDefaultWidgets();
      setWidgets(defaultWidgets);
      localStorage.setItem(`dashboard-widgets-${user?.id}`, JSON.stringify(defaultWidgets));
    }
  }, [user?.id]);

  // Salvar alterações dos widgets
  const saveWidgets = (updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
    localStorage.setItem(`dashboard-widgets-${user?.id}`, JSON.stringify(updatedWidgets));
  };

  const removeWidget = (widgetId: string) => {
    const updated = widgets.filter(w => w.id !== widgetId);
    saveWidgets(updated);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updated = widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    saveWidgets(updated);
  };

  const resetToDefault = () => {
    const defaultWidgets = getDefaultWidgets();
    saveWidgets(defaultWidgets);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Personalizado
              </h1>
              <p className="text-gray-600 mt-2">
                Bem-vindo de volta, {user.username}! Aqui está o resumo da sua atividade.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {user.userType === "prestador" && "Prestador"}
                {user.userType === "contratante" && "Organizador"}
                {user.userType === "anunciante" && "Anunciante"}
              </Badge>
              
              <Button
                variant={isEditMode ? "default" : "outline"}
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex items-center gap-2"
              >
                {isEditMode ? <Eye className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                {isEditMode ? "Sair da Edição" : "Personalizar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Modo de edição */}
        {isEditMode && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">
                Modo de Personalização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Você está no modo de edição. Passe o mouse sobre os widgets para ver as opções de personalização.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={resetToDefault}>
                  Restaurar Padrão
                </Button>
                <Button size="sm" variant="outline" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Widget
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`${
                widget.size.width === 2 ? 'md:col-span-2' : ''
              } ${
                widget.size.height === 2 ? 'row-span-2' : ''
              }`}
            >
              <WidgetCard
                widget={widget}
                onRemove={isEditMode ? removeWidget : undefined}
                onToggleVisibility={isEditMode ? toggleWidgetVisibility : undefined}
                dragHandleProps={isEditMode ? { style: { cursor: 'move' } } : undefined}
              />
            </div>
          ))}
        </div>

        {/* Widgets ocultos */}
        {isEditMode && widgets.filter(w => !w.visible).length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Widgets Ocultos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {widgets.filter(w => !w.visible).map((widget) => (
                  <div
                    key={widget.id}
                    className="opacity-50 hover:opacity-75 transition-opacity"
                  >
                    <WidgetCard
                      widget={widget}
                      onToggleVisibility={toggleWidgetVisibility}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {visibleWidgets.length === 0 && (
          <Card className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Dashboard Vazio
            </h3>
            <p className="text-gray-500 mb-4">
              Todos os widgets estão ocultos. Ative alguns para ver suas métricas.
            </p>
            <Button onClick={() => setIsEditMode(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Personalizar Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}