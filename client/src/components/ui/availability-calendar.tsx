import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, MapPin, DollarSign } from "lucide-react";
import { format, addDays, isSameDay, startOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AvailabilitySlot {
  date: string;
  available: boolean;
  priceType: 'hour' | 'day' | 'weekend';
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerWeekend?: number;
  bookedBy?: string;
  reservationId?: number;
}

interface VenueReservation {
  venueId: number;
  venueName: string;
  startDate: string;
  endDate: string;
  priceType: 'hour' | 'day' | 'weekend';
  totalPrice: number;
  specialRequests?: string;
  contactPhone: string;
}

interface AvailabilityCalendarProps {
  venueId: number;
  venueName: string;
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeekend: number;
  isOwner?: boolean;
  onReservationCreate?: (reservation: VenueReservation) => void;
}

export default function AvailabilityCalendar({
  venueId,
  venueName,
  pricePerHour,
  pricePerDay,
  pricePerWeekend,
  isOwner = false,
  onReservationCreate
}: AvailabilityCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [priceType, setPriceType] = useState<'hour' | 'day' | 'weekend'>('day');
  const [hours, setHours] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const { toast } = useToast();

  const calculatePrice = () => {
    const days = selectedDates.length;
    
    switch (priceType) {
      case 'hour':
        return pricePerHour * hours * days;
      case 'day':
        return pricePerDay * days;
      case 'weekend':
        return pricePerWeekend * Math.ceil(days / 3); // Sexta a domingo = 3 dias
      default:
        return 0;
    }
  };

  const isDateAvailable = (date: Date) => {
    const slot = availability.find(slot => 
      isSameDay(parseISO(slot.date), date)
    );
    return slot ? slot.available : true; // Assume disponível se não tiver dados
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => 
      isSameDay(selectedDate, date)
    );
  };

  const isDateBooked = (date: Date): boolean => {
    const slot = availability.find(slot => 
      isSameDay(parseISO(slot.date), date)
    );
    return slot ? !slot.available && !!slot.bookedBy : false;
  };

  const handleDateSelect = (date: Date) => {
    if (isOwner) return; // Proprietários não podem fazer reservas
    
    if (!isDateAvailable(date)) {
      toast({
        title: "Data indisponível",
        description: "Esta data já está reservada",
        variant: "destructive",
      });
      return;
    }

    const isAlreadySelected = isDateSelected(date);
    
    if (isAlreadySelected) {
      setSelectedDates(prev => prev.filter(d => !isSameDay(d, date)));
    } else {
      setSelectedDates(prev => [...prev, date]);
    }
  };

  const handleReservationSubmit = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: "Selecione as datas",
        description: "Escolha pelo menos uma data para reservar",
        variant: "destructive",
      });
      return;
    }

    if (!contactPhone) {
      toast({
        title: "Telefone obrigatório",
        description: "Informe seu telefone para contato",
        variant: "destructive",
      });
      return;
    }

    try {
      const reservation: VenueReservation = {
        venueId,
        venueName,
        startDate: format(selectedDates[0], 'yyyy-MM-dd'),
        endDate: format(selectedDates[selectedDates.length - 1], 'yyyy-MM-dd'),
        priceType,
        totalPrice: calculatePrice(),
        specialRequests,
        contactPhone,
      };

      await apiRequest("POST", "/api/venue-reservations", reservation);

      toast({
        title: "Pré-reserva enviada!",
        description: "O proprietário foi notificado e entrará em contato",
      });

      onReservationCreate?.(reservation);
      setIsReservationDialogOpen(false);
      setSelectedDates([]);
      setSpecialRequests('');
      setContactPhone('');
    } catch (error) {
      toast({
        title: "Erro ao enviar reserva",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  const getDayClassName = (date: Date) => {
    let className = "relative ";
    
    if (isDateBooked(date)) {
      className += "bg-red-100 text-red-800 line-through cursor-not-allowed ";
    } else if (isDateSelected(date)) {
      className += "bg-[#3C5BFA] text-white ";
    } else if (isDateAvailable(date)) {
      className += "hover:bg-[#3C5BFA]/10 cursor-pointer ";
    }
    
    return className;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {isOwner ? "Gerenciar Disponibilidade" : "Verificar Disponibilidade"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendário */}
            <div>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => !isOwner && setSelectedDates(dates || [])}
                disabled={(date) => isOwner ? false : !!isDateBooked(date)}
                className="rounded-md border"
                locale={ptBR}
                modifiers={{
                  booked: (date) => !!isDateBooked(date),
                  available: (date) => isDateAvailable(date),
                  selected: (date) => isDateSelected(date)
                }}
                modifiersClassNames={{
                  booked: "bg-red-100 text-red-800 line-through",
                  available: "hover:bg-[#3C5BFA]/10",
                  selected: "bg-[#3C5BFA] text-white"
                }}
              />
              
              {/* Legenda */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span>Reservado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#3C5BFA] border border-[#3C5BFA] rounded"></div>
                  <span>Selecionado</span>
                </div>
              </div>
            </div>

            {/* Preços e Informações */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Preços</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Por hora</span>
                    </div>
                    <span className="font-medium">
                      R$ {pricePerHour.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>Por dia</span>
                    </div>
                    <span className="font-medium">
                      R$ {pricePerDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>Fim de semana</span>
                    </div>
                    <span className="font-medium">
                      R$ {pricePerWeekend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {!isOwner && selectedDates.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Resumo da Reserva</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Datas selecionadas:</span>
                      <span>{selectedDates.length} dia(s)</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Período:</span>
                      <span className="text-sm">
                        {format(selectedDates[0], "dd/MM", { locale: ptBR })} - {format(selectedDates[selectedDates.length - 1], "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-[#3C5BFA] hover:bg-[#3C5BFA]/90">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Fazer Pré-Reserva
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Finalizar Pré-Reserva</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label>Tipo de Cobrança</Label>
                          <Select value={priceType} onValueChange={(value: 'hour' | 'day' | 'weekend') => setPriceType(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hour">Por Hora</SelectItem>
                              <SelectItem value="day">Por Dia</SelectItem>
                              <SelectItem value="weekend">Fim de Semana</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {priceType === 'hour' && (
                          <div>
                            <Label>Quantidade de Horas por Dia</Label>
                            <Input
                              type="number"
                              min="1"
                              max="24"
                              value={hours}
                              onChange={(e) => setHours(parseInt(e.target.value) || 1)}
                            />
                          </div>
                        )}

                        <div>
                          <Label>Telefone para Contato *</Label>
                          <Input
                            placeholder="(11) 99999-9999"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Solicitações Especiais</Label>
                          <Textarea
                            placeholder="Descreva suas necessidades específicas..."
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total Estimado:</span>
                            <span className="text-[#3C5BFA]">
                              R$ {calculatePrice().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            *Valor sujeito à confirmação do proprietário
                          </p>
                        </div>

                        <Button 
                          onClick={handleReservationSubmit}
                          className="w-full"
                          disabled={!contactPhone}
                        >
                          Enviar Pré-Reserva
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}