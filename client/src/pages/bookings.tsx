import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, DollarSign, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const statusLabels = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Concluída",
};

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/venue-reservations"],
  });

  const filteredBookings = bookings.filter((booking: any) => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minhas Reservas</h1>
        <p className="text-muted-foreground">
          Gerencie todas as reservas dos seus espaços
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmadas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "all" 
                  ? "Você ainda não possui reservas em seus espaços."
                  : `Você não possui reservas ${statusLabels[activeTab as keyof typeof statusLabels]?.toLowerCase()}.`
                }
              </p>
              <Button asChild>
                <Link href="/venues/manage">Ver Meus Espaços</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBookings.map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          {booking.venueName || "Espaço"}
                        </CardTitle>
                        <CardDescription>
                          Reserva #{booking.id} - {booking.clientName || "Cliente"}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[booking.status as keyof typeof statusColors] || statusColors.pending}>
                        {statusLabels[booking.status as keyof typeof statusLabels] || "Pendente"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {booking.eventDate 
                            ? format(new Date(booking.eventDate), "dd 'de' MMMM, yyyy", { locale: ptBR })
                            : "Data não informada"
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.startTime || "08:00"} - {booking.endTime || "18:00"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.guestCount || 50} convidados</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">
                        {booking.totalPrice 
                          ? `R$ ${booking.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : "R$ 1.500,00"
                        }
                      </span>
                    </div>

                    {booking.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      {booking.status === "pending" && (
                        <>
                          <Button size="sm" className="flex-1">
                            Confirmar Reserva
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Recusar
                          </Button>
                        </>
                      )}
                      
                      {booking.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="flex-1">
                          Cancelar Reserva
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/chat?contact=${booking.clientId}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Conversar
                        </Link>
                      </Button>
                      
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/bookings/${booking.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}