import { DatabaseStorage } from './storage';

interface VenueBookingRequest {
  venueId: number;
  eventId?: number;
  bookerId: number;
  startDatetime: Date;
  endDatetime: Date;
  totalPrice: number;
  specialRequests?: string;
}

interface VenueAvailabilityCheck {
  venueId: number;
  startDatetime: Date;
  endDatetime: Date;
}

interface VenueBookingResponse {
  id: number;
  venueId: number;
  startDatetime: Date;
  endDatetime: Date;
  status: string;
  totalPrice: number;
  paymentStatus: string;
}

export class VenueBookingService {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Verifica disponibilidade de um venue em determinado período
   */
  async checkAvailability(check: VenueAvailabilityCheck): Promise<boolean> {
    try {
      const result = await this.storage.db.execute(`
        SELECT check_venue_availability($1, $2, $3) as available
      `, [check.venueId, check.startDatetime, check.endDatetime]);

      return result.rows[0]?.available === true;
    } catch (error) {
      console.error('Error checking venue availability:', error);
      return false;
    }
  }

  /**
   * Cria uma nova reserva de venue
   */
  async createBooking(booking: VenueBookingRequest): Promise<VenueBookingResponse> {
    try {
      // Primeiro verificar disponibilidade
      const isAvailable = await this.checkAvailability({
        venueId: booking.venueId,
        startDatetime: booking.startDatetime,
        endDatetime: booking.endDatetime
      });

      if (!isAvailable) {
        throw new Error('Venue não está disponível neste período');
      }

      // Validar se venue existe
      const venue = await this.storage.db.execute(`
        SELECT id, name, price_per_hour, price_per_day 
        FROM venues 
        WHERE id = $1 AND active = true
      `, [booking.venueId]);

      if (venue.rows.length === 0) {
        throw new Error('Venue não encontrado ou inativo');
      }

      // Inserir reserva
      const result = await this.storage.db.execute(`
        INSERT INTO venue_bookings (
          venue_id, event_id, booker_id, start_datetime, end_datetime, 
          total_price, special_requests, status, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'pending')
        RETURNING *
      `, [
        booking.venueId,
        booking.eventId || null,
        booking.bookerId,
        booking.startDatetime,
        booking.endDatetime,
        booking.totalPrice,
        booking.specialRequests || null
      ]);

      const newBooking = result.rows[0];

      // Atualizar disponibilidade
      await this.updateAvailability(
        booking.venueId,
        booking.startDatetime,
        booking.endDatetime,
        'booked',
        newBooking.id
      );

      return {
        id: newBooking.id,
        venueId: newBooking.venue_id,
        startDatetime: new Date(newBooking.start_datetime),
        endDatetime: new Date(newBooking.end_datetime),
        status: newBooking.status,
        totalPrice: parseFloat(newBooking.total_price),
        paymentStatus: newBooking.payment_status
      };

    } catch (error) {
      console.error('Error creating venue booking:', error);
      throw new Error(`Erro ao criar reserva: ${error.message}`);
    }
  }

  /**
   * Confirma uma reserva (após pagamento)
   */
  async confirmBooking(bookingId: number, paymentData?: any): Promise<VenueBookingResponse> {
    try {
      const result = await this.storage.db.execute(`
        UPDATE venue_bookings 
        SET status = 'confirmed', payment_status = 'paid', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [bookingId]);

      if (result.rows.length === 0) {
        throw new Error('Reserva não encontrada');
      }

      const booking = result.rows[0];
      
      return {
        id: booking.id,
        venueId: booking.venue_id,
        startDatetime: new Date(booking.start_datetime),
        endDatetime: new Date(booking.end_datetime),
        status: booking.status,
        totalPrice: parseFloat(booking.total_price),
        paymentStatus: booking.payment_status
      };

    } catch (error) {
      console.error('Error confirming booking:', error);
      throw new Error(`Erro ao confirmar reserva: ${error.message}`);
    }
  }

  /**
   * Cancela uma reserva
   */
  async cancelBooking(bookingId: number, reason: string, userId: number): Promise<void> {
    try {
      // Buscar dados da reserva
      const bookingResult = await this.storage.db.execute(`
        SELECT * FROM venue_bookings WHERE id = $1
      `, [bookingId]);

      if (bookingResult.rows.length === 0) {
        throw new Error('Reserva não encontrada');
      }

      const booking = bookingResult.rows[0];

      // Verificar se usuário pode cancelar
      if (booking.booker_id !== userId) {
        // Verificar se é owner do venue
        const venueResult = await this.storage.db.execute(`
          SELECT owner_id FROM venues WHERE id = $1
        `, [booking.venue_id]);

        if (venueResult.rows.length === 0 || venueResult.rows[0].owner_id !== userId) {
          throw new Error('Usuário não autorizado a cancelar esta reserva');
        }
      }

      // Atualizar reserva
      await this.storage.db.execute(`
        UPDATE venue_bookings 
        SET status = 'cancelled', cancellation_reason = $2, updated_at = NOW()
        WHERE id = $1
      `, [bookingId, reason]);

      // Liberar disponibilidade
      await this.storage.db.execute(`
        UPDATE venue_availability 
        SET status = 'available', booking_id = NULL
        WHERE booking_id = $1
      `, [bookingId]);

    } catch (error) {
      console.error('Error canceling booking:', error);
      throw new Error(`Erro ao cancelar reserva: ${error.message}`);
    }
  }

  /**
   * Busca reservas de um usuário
   */
  async getUserBookings(userId: number, status?: string): Promise<VenueBookingResponse[]> {
    try {
      let query = `
        SELECT vb.*, v.name as venue_name, v.location as venue_location
        FROM venue_bookings vb
        JOIN venues v ON vb.venue_id = v.id
        WHERE vb.booker_id = $1
      `;
      const params = [userId];

      if (status) {
        query += ` AND vb.status = $2`;
        params.push(status);
      }

      query += ` ORDER BY vb.start_datetime DESC`;

      const result = await this.storage.db.execute(query, params);

      return result.rows.map(row => ({
        id: row.id,
        venueId: row.venue_id,
        startDatetime: new Date(row.start_datetime),
        endDatetime: new Date(row.end_datetime),
        status: row.status,
        totalPrice: parseFloat(row.total_price),
        paymentStatus: row.payment_status,
        venueName: row.venue_name,
        venueLocation: row.venue_location
      }));

    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw new Error('Erro ao buscar reservas do usuário');
    }
  }

  /**
   * Busca reservas de venues de um proprietário
   */
  async getVenueOwnerBookings(ownerId: number): Promise<VenueBookingResponse[]> {
    try {
      const result = await this.storage.db.execute(`
        SELECT vb.*, v.name as venue_name, u.username as booker_name
        FROM venue_bookings vb
        JOIN venues v ON vb.venue_id = v.id
        JOIN users u ON vb.booker_id = u.id
        WHERE v.owner_id = $1
        ORDER BY vb.start_datetime DESC
      `, [ownerId]);

      return result.rows.map(row => ({
        id: row.id,
        venueId: row.venue_id,
        startDatetime: new Date(row.start_datetime),
        endDatetime: new Date(row.end_datetime),
        status: row.status,
        totalPrice: parseFloat(row.total_price),
        paymentStatus: row.payment_status,
        venueName: row.venue_name,
        bookerName: row.booker_name
      }));

    } catch (error) {
      console.error('Error getting venue owner bookings:', error);
      throw new Error('Erro ao buscar reservas dos venues');
    }
  }

  /**
   * Calcula o preço de uma reserva baseado no venue e duração
   */
  async calculateBookingPrice(venueId: number, startDatetime: Date, endDatetime: Date): Promise<number> {
    try {
      const venue = await this.storage.db.execute(`
        SELECT price_per_hour, price_per_day, price_per_weekend, pricing_model
        FROM venues WHERE id = $1
      `, [venueId]);

      if (venue.rows.length === 0) {
        throw new Error('Venue não encontrado');
      }

      const venueData = venue.rows[0];
      const durationHours = (endDatetime.getTime() - startDatetime.getTime()) / (1000 * 60 * 60);
      
      // Verificar se é final de semana
      const isWeekend = startDatetime.getDay() === 0 || startDatetime.getDay() === 6;
      
      let price = 0;

      switch (venueData.pricing_model) {
        case 'hourly':
          price = parseFloat(venueData.price_per_hour) * durationHours;
          break;
        case 'daily':
          const days = Math.ceil(durationHours / 24);
          if (isWeekend && venueData.price_per_weekend) {
            price = parseFloat(venueData.price_per_weekend) * days;
          } else {
            price = parseFloat(venueData.price_per_day) * days;
          }
          break;
        default:
          price = parseFloat(venueData.price_per_hour) * durationHours;
      }

      return Math.max(price, 0);

    } catch (error) {
      console.error('Error calculating booking price:', error);
      throw new Error('Erro ao calcular preço da reserva');
    }
  }

  /**
   * Atualiza disponibilidade de um venue
   */
  private async updateAvailability(
    venueId: number, 
    startDate: Date, 
    endDate: Date, 
    status: string, 
    bookingId?: number
  ): Promise<void> {
    try {
      await this.storage.db.execute(`
        INSERT INTO venue_availability (venue_id, start_date, end_date, status, booking_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (venue_id, start_date, end_date) 
        DO UPDATE SET status = $4, booking_id = $5
      `, [venueId, startDate, endDate, status, bookingId || null]);

    } catch (error) {
      console.error('Error updating venue availability:', error);
      throw new Error('Erro ao atualizar disponibilidade');
    }
  }

  /**
   * Busca disponibilidade de um venue por período
   */
  async getVenueAvailability(venueId: number, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const result = await this.storage.db.execute(`
        SELECT * FROM venue_availability
        WHERE venue_id = $1 
        AND start_date >= $2 
        AND end_date <= $3
        ORDER BY start_date
      `, [venueId, startDate, endDate]);

      return result.rows;

    } catch (error) {
      console.error('Error getting venue availability:', error);
      throw new Error('Erro ao buscar disponibilidade');
    }
  }
}

export { VenueBookingService };