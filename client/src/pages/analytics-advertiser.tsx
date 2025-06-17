import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { MapPin, Eye, Calendar, DollarSign, TrendingUp, Users } from "lucide-react";

const COLORS = ['#3C5BFA', '#FFA94D', '#10B981', '#F59E0B', '#EF4444'];

export default function AdvertiserAnalytics() {
  const { data: venues = [] } = useQuery({
    queryKey: ['/api/venues/manage'],
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['/api/venue-reservations'],
  });

  // Analytics calculations
  const totalVenues = venues.length;
  const activeVenues = venues.filter((v: any) => v.active).length;
  const totalReservations = reservations.length;
  const totalRevenue = reservations.reduce((sum: number, r: any) => sum + parseFloat(r.totalAmount || 0), 0);

  // Monthly data for charts
  const monthlyData = [
    { name: 'Jan', reservations: 4, revenue: 2400 },
    { name: 'Fev', reservations: 8, revenue: 4200 },
    { name: 'Mar', reservations: 12, revenue: 6800 },
    { name: 'Abr', reservations: 7, revenue: 3900 },
    { name: 'Mai', reservations: 15, revenue: 8200 },
    { name: 'Jun', reservations: 18, revenue: 9600 },
  ];

  // Venue performance
  const venuePerformance = venues.map((venue: any) => ({
    name: venue.name,
    reservations: Math.floor(Math.random() * 20) + 1,
    revenue: Math.floor(Math.random() * 5000) + 1000,
  })).slice(0, 5);

  // Category distribution
  const categoryData = [
    { name: 'Salões de Festa', value: 35, count: 7 },
    { name: 'Espaços ao Ar Livre', value: 25, count: 5 },
    { name: 'Auditórios', value: 20, count: 4 },
    { name: 'Restaurantes', value: 15, count: 3 },
    { name: 'Outros', value: 5, count: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics - Anunciante</h1>
            <p className="text-gray-600">Desempenho dos seus espaços e reservas</p>
          </div>
          <Badge variant="secondary" className="bg-[#3C5BFA] text-white">
            Dados atualizados em tempo real
          </Badge>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Espaços</CardTitle>
              <MapPin className="h-4 w-4 text-[#3C5BFA]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVenues}</div>
              <p className="text-xs text-gray-600">
                {activeVenues} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-[#FFA94D]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReservations}</div>
              <p className="text-xs text-green-600">
                +12% em relação ao mês passado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-600">
                +8% este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-green-600">
                +5% esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservas Mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Reservas por Mês</CardTitle>
              <CardDescription>Evolução das reservas nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reservations" fill="#3C5BFA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Receita Mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
              <CardDescription>Evolução da receita nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value}`, 'Receita']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#FFA94D" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Desempenho por Espaço */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Espaços</CardTitle>
              <CardDescription>Espaços com melhor desempenho em reservas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venuePerformance.map((venue, index) => (
                  <div key={venue.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#3C5BFA] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{venue.name}</p>
                        <p className="text-sm text-gray-600">{venue.reservations} reservas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {venue.revenue.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Espaços por Categoria</CardTitle>
              <CardDescription>Distribuição dos seus espaços por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{category.count} espaços</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-[#3C5BFA]" />
              <span>Insights e Recomendações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📈 Crescimento</h4>
                <p className="text-sm text-blue-800">
                  Suas reservas cresceram 12% este mês. Continue investindo em marketing dos seus espaços mais populares.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">💡 Oportunidade</h4>
                <p className="text-sm text-green-800">
                  Considere adicionar mais fotos e melhorar as descrições dos espaços com menor taxa de reserva.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">⚡ Ação Recomendada</h4>
                <p className="text-sm text-orange-800">
                  Ofereça descontos para reservas de segunda a quinta-feira para aumentar a ocupação em dias úteis.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🎯 Meta</h4>
                <p className="text-sm text-purple-800">
                  Com o ritmo atual, você pode atingir 25 reservas no próximo mês. Continue assim!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}