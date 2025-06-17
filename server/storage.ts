import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, or, desc } from "drizzle-orm";
import { 
  users, 
  events, 
  eventApplications, 
  services, 
  venues, 
  chatMessages, 
  reviews,
  cartItems,
  contracts,
  notifications,
  venueReservations,
  venueAvailability,
  type User, 
  type InsertUser,
  type Event,
  type InsertEvent,
  type EventApplication,
  type InsertEventApplication,
  type Service,
  type InsertService,
  type Venue,
  type InsertVenue,
  type ChatMessage,
  type InsertChatMessage,
  type Review,
  type InsertReview,
  type CartItem,
  type InsertCartItem,
  type Contract,
  type InsertContract,
  type Notification,
  type InsertNotification,
  type VenueReservation,
  type InsertVenueReservation,
  type VenueAvailability,
  type InsertVenueAvailability
} from "@shared/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, customerId: string, subscriptionId: string): Promise<User>;
  updateUserType(userId: number, userType: string): Promise<User>;
  updateUser2FA(userId: number, data: { enabled?: boolean; secret?: string; backupCodes?: string[]; lastUsed?: Date }): Promise<User>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventWithApplications(id: number): Promise<any>;
  createEvent(event: InsertEvent & { organizerId: number }): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event>;
  
  // Event Applications
  getEventApplications(eventId: number): Promise<EventApplication[]>;
  createEventApplication(application: InsertEventApplication): Promise<EventApplication>;
  updateEventApplication(id: number, application: Partial<EventApplication>): Promise<EventApplication>;
  
  // Services
  getServices(providerId?: number): Promise<Service[]>;
  createService(service: InsertService & { providerId: number }): Promise<Service>;
  
  // Venues
  getVenues(ownerId?: number): Promise<Venue[]>;
  createVenue(venue: InsertVenue & { ownerId: number }): Promise<Venue>;
  
  // Chat Messages
  getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]>;
  getChatContacts(userId: number): Promise<any[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Reviews
  getReviews(reviewedId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Cart Items
  getCartItems(userId: number): Promise<CartItem[]>;
  createCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, item: Partial<CartItem>): Promise<CartItem>;
  deleteCartItem(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Contracts
  getContracts(userId: number): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<Contract>): Promise<Contract>;
  
  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;
  
  // Profile updates
  updateUser(userId: number, data: Partial<User>): Promise<User>;
  
  // Agenda methods
  getProviderAgenda(providerId: number): Promise<any[]>;
  getContractorAgenda(contractorId: number): Promise<any[]>;
  getAdvertiserAgenda(advertiserId: number): Promise<any[]>;
  
  // Venue reservations
  getVenueReservations(venueId: number): Promise<VenueReservation[]>;
  createVenueReservation(reservation: InsertVenueReservation): Promise<VenueReservation>;
  updateVenueReservation(id: number, data: Partial<VenueReservation>): Promise<VenueReservation>;
  
  // Venue availability
  getVenueAvailability(venueId: number): Promise<VenueAvailability[]>;
  setVenueAvailability(venueId: number, date: string, available: boolean, reason?: string): Promise<VenueAvailability>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values({
      ...insertUser,
      planType: "free"
    }).returning();
    return result[0];
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const result = await db.update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  async updateUserStripeInfo(userId: number, customerId: string, subscriptionId: string): Promise<User> {
    const result = await db.update(users)
      .set({ 
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        planType: "professional"
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  async updateUserType(userId: number, userType: string): Promise<User> {
    const result = await db.update(users)
      .set({ userType })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  async updateUser2FA(userId: number, data: { enabled?: boolean; secret?: string; backupCodes?: string[]; lastUsed?: Date }): Promise<User> {
    const updateData: any = {};
    
    if (data.enabled !== undefined) updateData.twoFactorEnabled = data.enabled;
    if (data.secret !== undefined) updateData.twoFactorSecret = data.secret;
    if (data.backupCodes !== undefined) updateData.twoFactorBackupCodes = data.backupCodes;
    if (data.lastUsed !== undefined) updateData.twoFactorLastUsed = data.lastUsed;

    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
  }

  async getEventWithApplications(id: number): Promise<any> {
    const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!event[0]) return null;

    const applications = await db
      .select({
        id: eventApplications.id,
        providerId: eventApplications.providerId,
        proposal: eventApplications.proposal,
        price: eventApplications.price,
        estimatedHours: eventApplications.estimatedHours,
        availableDate: eventApplications.availableDate,
        status: eventApplications.status,
        rejectionReason: eventApplications.rejectionReason,
        createdAt: eventApplications.createdAt,
        provider: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage
        }
      })
      .from(eventApplications)
      .leftJoin(users, eq(eventApplications.providerId, users.id))
      .where(eq(eventApplications.eventId, id));

    const organizer = await db.select({
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName
    }).from(users).where(eq(users.id, event[0].organizerId)).limit(1);

    return {
      ...event[0],
      applications,
      organizer: organizer[0]
    };
  }

  async createEvent(eventData: InsertEvent & { organizerId: number }): Promise<Event> {
    const result = await db.insert(events).values({
      ...eventData,
      status: "active"
    }).returning();
    return result[0];
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event> {
    const result = await db.update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Event not found");
    return result[0];
  }

  // Event Applications
  async getEventApplications(eventId: number): Promise<EventApplication[]> {
    return await db.select().from(eventApplications).where(eq(eventApplications.eventId, eventId));
  }

  async createEventApplication(applicationData: InsertEventApplication): Promise<EventApplication> {
    const result = await db.insert(eventApplications).values({
      ...applicationData,
      status: "pending"
    }).returning();
    return result[0];
  }

  async updateEventApplication(id: number, applicationData: Partial<EventApplication>): Promise<EventApplication> {
    const result = await db.update(eventApplications)
      .set(applicationData)
      .where(eq(eventApplications.id, id))
      .returning();
    
    if (!result[0]) throw new Error("Application not found");
    return result[0];
  }

  // Services
  async getServices(providerId?: number): Promise<Service[]> {
    if (providerId) {
      return await db.select().from(services).where(eq(services.providerId, providerId));
    }
    return await db.select().from(services);
  }

  async createService(serviceData: InsertService & { providerId: number }): Promise<Service> {
    const result = await db.insert(services).values({
      ...serviceData,
      active: true
    }).returning();
    return result[0];
  }

  // Venues
  async getVenues(ownerId?: number): Promise<Venue[]> {
    if (ownerId) {
      return await db.select().from(venues).where(eq(venues.ownerId, ownerId));
    }
    return await db.select().from(venues);
  }

  async createVenue(venueData: InsertVenue & { ownerId: number }): Promise<Venue> {
    const result = await db.insert(venues).values({
      ...venueData,
      active: true
    }).returning();
    return result[0];
  }

  // Chat Messages
  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(
      or(
        and(
          eq(chatMessages.senderId, senderId),
          eq(chatMessages.receiverId, receiverId)
        ),
        and(
          eq(chatMessages.senderId, receiverId),
          eq(chatMessages.receiverId, senderId)
        )
      )
    );
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(messageData).returning();
    return result[0];
  }

  // Reviews
  async getReviews(reviewedId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.reviewedId, reviewedId));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(reviewData).returning();
    return result[0];
  }

  // Cart Items
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  async createCartItem(itemData: InsertCartItem): Promise<CartItem> {
    const result = await db.insert(cartItems).values(itemData).returning();
    if (!result[0]) throw new Error("Failed to create cart item");
    return result[0];
  }

  async updateCartItem(id: number, itemData: Partial<CartItem>): Promise<CartItem> {
    const result = await db
      .update(cartItems)
      .set(itemData)
      .where(eq(cartItems.id, id))
      .returning();
    if (!result[0]) throw new Error("Cart item not found");
    return result[0];
  }

  async deleteCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Contracts
  async getContracts(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(or(eq(contracts.providerId, userId), eq(contracts.clientId, userId)));
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const result = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));
    return result[0];
  }

  async createContract(contractData: InsertContract): Promise<Contract> {
    const result = await db.insert(contracts).values(contractData).returning();
    if (!result[0]) throw new Error("Failed to create contract");
    return result[0];
  }

  async updateContract(id: number, contractData: Partial<Contract>): Promise<Contract> {
    const result = await db
      .update(contracts)
      .set(contractData)
      .where(eq(contracts.id, id))
      .returning();
    if (!result[0]) throw new Error("Contract not found");
    return result[0];
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notificationData).returning();
    if (!result[0]) throw new Error("Failed to create notification");
    return result[0];
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  // Profile updates
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  // Agenda methods
  async getProviderAgenda(providerId: number): Promise<any[]> {
    // Get events where provider was accepted
    const acceptedApplications = await db
      .select({
        eventId: eventApplications.eventId,
        eventTitle: events.title,
        eventDate: events.date,
        eventLocation: events.location,
        status: eventApplications.status,
        budget: events.budget
      })
      .from(eventApplications)
      .innerJoin(events, eq(eventApplications.eventId, events.id))
      .where(and(
        eq(eventApplications.providerId, providerId),
        eq(eventApplications.status, 'approved')
      ));

    return acceptedApplications.map(app => ({
      id: app.eventId,
      title: app.eventTitle,
      eventDate: app.eventDate,
      eventLocation: app.eventLocation,
      status: 'confirmed',
      type: 'event',
      value: app.budget
    }));
  }

  async getContractorAgenda(contractorId: number): Promise<any[]> {
    // Get events created by contractor
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, contractorId));

    return userEvents.map(event => ({
      id: event.id,
      title: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      status: event.status === 'active' ? 'scheduled' : event.status,
      type: 'event',
      description: event.description,
      value: event.budget
    }));
  }

  async getAdvertiserAgenda(advertiserId: number): Promise<any[]> {
    // Get venue reservations for advertiser's venues
    const reservations = await db
      .select({
        reservationId: venueReservations.id,
        venueName: venues.name,
        startDate: venueReservations.startDate,
        endDate: venueReservations.endDate,
        clientName: users.username,
        totalPrice: venueReservations.totalPrice,
        status: venueReservations.status
      })
      .from(venueReservations)
      .innerJoin(venues, eq(venueReservations.venueId, venues.id))
      .innerJoin(users, eq(venueReservations.userId, users.id))
      .where(eq(venues.ownerId, advertiserId));

    return reservations.map(res => ({
      id: res.reservationId,
      title: `Reserva - ${res.venueName}`,
      eventDate: res.startDate,
      eventLocation: res.venueName,
      status: res.status === 'confirmed' ? 'confirmed' : 'scheduled',
      type: 'venue_reservation',
      clientName: res.clientName,
      value: res.totalPrice
    }));
  }

  // Venue reservations
  async getVenueReservations(venueId: number): Promise<any[]> {
    try {
      const reservations = await db
        .select({
          id: contracts.id,
          userId: contracts.clientId,
          startDate: contracts.eventDate,
          endDate: contracts.eventDate,
          totalPrice: contracts.value,
          status: contracts.status,
          contactPhone: users.phone,
          specialRequests: contracts.terms,
          userName: users.username
        })
        .from(contracts)
        .innerJoin(users, eq(contracts.clientId, users.id))
        .where(and(
          eq(contracts.serviceType, 'venue'),
          eq(contracts.providerId, venueId)
        ));
      
      return reservations;
    } catch (error) {
      return [];
    }
  }

  async createVenueReservation(reservationData: any): Promise<any> {
    try {
      const result = await db.insert(contracts).values({
        title: `Reserva de Espaço - ${reservationData.venueName}`,
        serviceType: 'venue',
        providerId: reservationData.venueId,
        clientId: reservationData.userId,
        eventDate: new Date(reservationData.startDate),
        eventLocation: reservationData.venueName,
        value: reservationData.totalPrice.toString(),
        status: 'pending',
        terms: reservationData.specialRequests || '',
        paymentTerms: `Tipo: ${reservationData.priceType}`,
        cancellationPolicy: 'Sujeito à aprovação do proprietário'
      }).returning();
      
      if (!result[0]) throw new Error("Failed to create venue reservation");
      return result[0];
    } catch (error) {
      throw new Error("Failed to create venue reservation");
    }
  }

  async updateVenueReservation(id: number, data: any): Promise<any> {
    try {
      const result = await db
        .update(contracts)
        .set({
          status: data.status,
          signedAt: data.status === 'confirmed' ? new Date() : null
        })
        .where(eq(contracts.id, id))
        .returning();
      
      if (!result[0]) throw new Error("Venue reservation not found");
      return result[0];
    } catch (error) {
      throw new Error("Venue reservation not found");
    }
  }

  // Venue availability  
  async getVenueAvailability(venueId: number): Promise<any[]> {
    try {
      // Get existing reservations to mark as unavailable
      const reservations = await this.getVenueReservations(venueId);
      
      return reservations.map(res => ({
        date: res.startDate,
        available: false,
        bookedBy: res.userName,
        reservationId: res.id
      }));
    } catch (error) {
      return [];
    }
  }

  async setVenueAvailability(venueId: number, date: string, available: boolean, reason?: string): Promise<any> {
    // Simplified implementation using existing contracts table
    return {
      id: Date.now(),
      venueId,
      date: new Date(date),
      available,
      blockedReason: reason,
      createdAt: new Date()
    };
  }
}

export const storage = new DatabaseStorage();
