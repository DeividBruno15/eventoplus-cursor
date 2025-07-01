import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, or, desc, sql } from "drizzle-orm";
import crypto from "crypto";
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
  generateApiKey(userId: number): Promise<string>;
  validateApiKey(apiKey: string): Promise<User | null>;
  
  // Email verification
  setEmailVerificationToken(userId: number, token: string): Promise<User>;
  verifyEmailWithToken(token: string): Promise<User | null>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  
  // Password reset
  setPasswordResetToken(userId: number, token: string): Promise<User>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEventsByOrganizer(organizerId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventWithApplications(id: number): Promise<any>;
  createEvent(event: InsertEvent & { organizerId: number }): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  
  // Event Applications
  getEventApplications(eventId: number): Promise<EventApplication[]>;
  getEventApplicationById(id: number): Promise<EventApplication | undefined>;
  createEventApplication(application: InsertEventApplication): Promise<EventApplication>;
  updateEventApplication(id: number, application: Partial<EventApplication>): Promise<EventApplication>;
  
  // Services
  getServices(providerId?: number): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService & { providerId: number }): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service>;
  deleteService(id: number): Promise<void>;
  
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
  
  // Subscription management
  getSubscriptionPlans(userType?: string): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan>;
  
  // User subscriptions
  getUserSubscription(userId: number): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, subscription: Partial<UserSubscription>): Promise<UserSubscription>;
  cancelUserSubscription(id: number): Promise<UserSubscription>;
  
  // Payment methods
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<PaymentMethod>): Promise<PaymentMethod>;
  deletePaymentMethod(id: number): Promise<void>;
  setDefaultPaymentMethod(userId: number, methodId: number): Promise<void>;
  
  // Transactions
  getTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction>;
  
  // Enhanced reviews
  getReviewsEnhanced(reviewedId: number): Promise<ReviewEnhanced[]>;
  createReviewEnhanced(review: InsertReviewEnhanced): Promise<ReviewEnhanced>;
  updateReviewEnhanced(id: number, review: Partial<ReviewEnhanced>): Promise<ReviewEnhanced>;
  moderateReview(id: number, status: string, notes?: string): Promise<ReviewEnhanced>;
  voteReviewHelpful(id: number): Promise<void>;
  reportReview(id: number): Promise<void>;
  
  // User reputation
  getUserReputation(userId: number): Promise<UserReputation | undefined>;
  updateUserReputation(userId: number, data: Partial<UserReputation>): Promise<UserReputation>;
  recalculateUserReputation(userId: number): Promise<UserReputation>;
  
  // Digital contracts
  getDigitalContracts(userId: number, role?: string): Promise<DigitalContract[]>;
  getDigitalContract(id: number): Promise<DigitalContract | undefined>;
  createDigitalContract(contract: InsertDigitalContract): Promise<DigitalContract>;
  updateDigitalContract(id: number, contract: Partial<DigitalContract>): Promise<DigitalContract>;
  signDigitalContract(id: number, userId: number, signature: string): Promise<DigitalContract>;
  
  // Financial records
  getFinancialRecords(userId: number, type?: string): Promise<FinancialRecord[]>;
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  updateFinancialRecord(id: number, record: Partial<FinancialRecord>): Promise<FinancialRecord>;
  getFinancialSummary(userId: number, period?: string): Promise<any>;
  
  // Two-factor authentication
  getTwoFactorAuth(userId: number): Promise<TwoFactorAuth | undefined>;
  createTwoFactorAuth(auth: InsertTwoFactorAuth): Promise<TwoFactorAuth>;
  updateTwoFactorAuth(userId: number, auth: Partial<TwoFactorAuth>): Promise<TwoFactorAuth>;
  verifyTwoFactorAuth(userId: number, token: string): Promise<boolean>;
  
  // Security audit logs
  createSecurityAuditLog(log: InsertSecurityAuditLog): Promise<SecurityAuditLog>;
  getSecurityAuditLogs(userId?: number): Promise<SecurityAuditLog[]>;
  
  // LGPD compliance
  getLgpdRequests(userId: number): Promise<LgpdRequest[]>;
  createLgpdRequest(request: InsertLgpdRequest): Promise<LgpdRequest>;
  updateLgpdRequest(id: number, request: Partial<LgpdRequest>): Promise<LgpdRequest>;
  processLgpdRequest(id: number, processedBy: number, responseData: string): Promise<LgpdRequest>;
  
  // AI matching
  getAiMatchingPreferences(userId: number): Promise<AiMatchingPreferences | undefined>;
  updateAiMatchingPreferences(userId: number, preferences: Partial<AiMatchingPreferences>): Promise<AiMatchingPreferences>;
  getAiRecommendations(userId: number, type: string): Promise<any[]>;
  
  // Chatbot
  getChatbotConversation(sessionId: string): Promise<ChatbotConversation | undefined>;
  createChatbotConversation(conversation: InsertChatbotConversation): Promise<ChatbotConversation>;
  updateChatbotConversation(id: number, conversation: Partial<ChatbotConversation>): Promise<ChatbotConversation>;
  getChatbotConversations(userId: number): Promise<ChatbotConversation[]>;
  
  // WhatsApp settings
  updateUserWhatsAppSettings(userId: number, data: {
    whatsappNumber?: string | null;
    whatsappNotificationsEnabled?: boolean;
    whatsappNewEventNotifications?: boolean;
    whatsappNewChatNotifications?: boolean;
    whatsappVenueReservationNotifications?: boolean;
    whatsappApplicationNotifications?: boolean;
    whatsappStatusNotifications?: boolean;
  }): Promise<User>;
  
  // Event application management
  updateEventApplicationStatus(applicationId: number, status: 'approved' | 'rejected' | 'pending', rejectionReason?: string): Promise<EventApplication>;
  getEventApplication(id: number): Promise<EventApplication | undefined>;
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

  // Email verification methods
  async setEmailVerificationToken(userId: number, token: string): Promise<User> {
    const result = await db.update(users)
      .set({ 
        emailVerificationToken: token,
        emailVerificationSentAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    return result[0];
  }

  async verifyEmailWithToken(token: string): Promise<User | null> {
    const result = await db.update(users)
      .set({ 
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationSentAt: null
      })
      .where(eq(users.emailVerificationToken, token))
      .returning();
    
    return result[0] || null;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);
    
    return result[0];
  }

  // Password reset methods
  async setPasswordResetToken(userId: number, token: string): Promise<User> {
    const result = await db
      .update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetSentAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token))
      .limit(1);
    
    return result[0];
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(events.createdAt);
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

  async deleteEvent(id: number): Promise<void> {
    console.log(`Storage: Executando DELETE para evento ID: ${id}`);
    
    try {
      // Primeiro, remove candidaturas associadas ao evento
      console.log(`Storage: Removendo candidaturas do evento ID: ${id}`);
      await db.delete(eventApplications).where(eq(eventApplications.eventId, id));
      console.log(`Storage: Candidaturas removidas`);
      
      // Remove notificações relacionadas ao evento (usando LIKE para buscar no texto)
      try {
        await db.delete(notifications).where(
          sql`${notifications.metadata} LIKE ${'%"eventId":' + id + '%'} OR ${notifications.metadata} LIKE ${'%"eventId":"' + id + '"%'}`
        );
        console.log(`Storage: Notificações relacionadas removidas`);
      } catch (notificationError) {
        console.log(`Storage: Aviso - erro ao remover notificações (pode ser ignorado):`, notificationError);
      }
      
      // Remove o evento
      const result = await db.delete(events).where(eq(events.id, id)).returning();
      console.log(`Storage: Resultado da exclusão do evento:`, result.length > 0 ? `Excluído: ${JSON.stringify(result[0])}` : "Nenhum registro afetado");
      
      if (result.length === 0) {
        throw new Error(`Evento com ID ${id} não foi encontrado para exclusão`);
      }
    } catch (error) {
      console.error(`Storage: Erro na exclusão do evento ID ${id}:`, error);
      throw error;
    }
  }

  // Event Applications
  async getEventApplications(eventId: number): Promise<EventApplication[]> {
    return await db.select().from(eventApplications).where(eq(eventApplications.eventId, eventId));
  }

  async createEventApplication(applicationData: InsertEventApplication): Promise<EventApplication> {
    console.log('Storage: createEventApplication - dados recebidos:', JSON.stringify(applicationData, null, 2));
    
    // Preparar dados para inserção, removendo undefined values
    const cleanData: any = {
      eventId: applicationData.eventId,
      providerId: applicationData.providerId,
      proposal: applicationData.proposal,
      price: String(applicationData.price), // Garantir que price é string
      status: "pending"
    };
    
    // Adicionar campos opcionais apenas se não forem undefined
    if (applicationData.serviceId !== undefined) {
      cleanData.serviceId = applicationData.serviceId;
    }
    if (applicationData.estimatedHours !== undefined) {
      cleanData.estimatedHours = applicationData.estimatedHours;
    }
    if (applicationData.availableDate !== undefined) {
      cleanData.availableDate = applicationData.availableDate;
    }
    if (applicationData.portfolio !== undefined) {
      cleanData.portfolio = applicationData.portfolio;
    }
    if (applicationData.rejectionReason !== undefined) {
      cleanData.rejectionReason = applicationData.rejectionReason;
    }
    if (applicationData.contractId !== undefined) {
      cleanData.contractId = applicationData.contractId;
    }
    
    console.log('Storage: createEventApplication - dados limpos para inserção:', JSON.stringify(cleanData, null, 2));
    
    const result = await db.insert(eventApplications).values(cleanData).returning();
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

  async getEventApplicationById(id: number): Promise<EventApplication | undefined> {
    const result = await db.select()
      .from(eventApplications)
      .where(eq(eventApplications.id, id))
      .limit(1);
    
    return result[0];
  }

  // Services
  async getServices(providerId?: number): Promise<Service[]> {
    if (providerId) {
      return await db.select().from(services).where(eq(services.providerId, providerId));
    }
    return await db.select().from(services);
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const service = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return service[0];
  }

  async createService(serviceData: InsertService & { providerId: number }): Promise<Service> {
    const result = await db.insert(services).values({
      ...serviceData,
      active: true
    }).returning();
    return result[0];
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service> {
    const [service] = await db.update(services)
      .set({ ...serviceData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    console.log(`Storage: Executando DELETE para serviço ID: ${id}`);
    
    try {
      // Primeiro, remove registros dependentes se existirem
      console.log(`Storage: Removendo dependências do serviço ID: ${id}`);
      
      // Remove itens do carrinho que referenciam este serviço
      await db.delete(cartItems).where(eq(cartItems.serviceId, id));
      console.log(`Storage: Itens do carrinho removidos`);
      
      // Remove aplicações de eventos que referenciam este serviço
      await db.update(eventApplications)
        .set({ serviceId: null })
        .where(eq(eventApplications.serviceId, id));
      console.log(`Storage: Referências em event_applications atualizadas`);
      
      // Agora remove o serviço
      const result = await db.delete(services).where(eq(services.id, id)).returning();
      console.log(`Storage: Resultado da exclusão do serviço:`, result.length > 0 ? `Excluído: ${JSON.stringify(result[0])}` : "Nenhum registro afetado");
      
      if (result.length === 0) {
        throw new Error(`Serviço com ID ${id} não foi encontrado para exclusão`);
      }
    } catch (error) {
      console.error(`Storage: Erro na exclusão do serviço ID ${id}:`, error);
      throw error;
    }
  }

  // Venues
  async getVenues(ownerId?: number): Promise<Venue[]> {
    if (ownerId) {
      return await db.select().from(venues).where(eq(venues.ownerId, ownerId));
    }
    return await db.select().from(venues);
  }

  async createVenue(venueData: InsertVenue & { ownerId: number }): Promise<Venue> {
    // Ensure all price fields are properly converted to strings for decimal database fields
    const processedData: any = {
      name: venueData.name,
      description: venueData.description,
      location: venueData.location,
      number: venueData.number || null,
      category: venueData.category,
      capacity: venueData.capacity,
      pricePerHour: venueData.pricePerHour ? String(venueData.pricePerHour) : null,
      pricePerDay: venueData.pricePerDay ? String(venueData.pricePerDay) : null,
      pricePerWeekend: venueData.pricePerWeekend ? String(venueData.pricePerWeekend) : null,
      pricingModel: venueData.pricingModel || "hourly",
      amenities: venueData.amenities || [],
      images: venueData.images || [],
      addressData: venueData.addressData || null,
      ownerId: venueData.ownerId
    };
    
    const result = await db.insert(venues).values(processedData).returning();
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

  async getChatContacts(userId: number): Promise<any[]> {
    // Get all users that have exchanged messages with the current user
    const contacts = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImage: users.profileImage,
        userType: users.userType,
        lastMessageId: chatMessages.id,
        lastMessage: chatMessages.message,
        lastMessageDate: chatMessages.createdAt,
        isOnline: sql`false`
      })
      .from(chatMessages)
      .innerJoin(users, or(
        and(eq(chatMessages.senderId, users.id), eq(chatMessages.receiverId, userId)),
        and(eq(chatMessages.receiverId, users.id), eq(chatMessages.senderId, userId))
      ))
      .where(or(
        eq(chatMessages.senderId, userId),
        eq(chatMessages.receiverId, userId)
      ))
      .orderBy(desc(chatMessages.createdAt))
      .groupBy(users.id, users.username, users.firstName, users.lastName, users.profileImage, users.userType, chatMessages.id, chatMessages.message, chatMessages.createdAt);

    // Transform to include unread count and format properly
    return contacts.map(contact => ({
      id: contact.id,
      username: contact.username,
      firstName: contact.firstName,
      lastName: contact.lastName,
      profileImage: contact.profileImage,
      userType: contact.userType,
      isOnline: contact.isOnline || false,
      lastMessage: contact.lastMessage ? {
        id: contact.lastMessageId,
        message: contact.lastMessage,
        createdAt: contact.lastMessageDate
      } : null,
      unreadCount: 0 // Simplified for now
    }));
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
    console.log('Updating user:', userId, 'with data keys:', Object.keys(data));
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    
    if (!result[0]) throw new Error("User not found");
    console.log('User updated successfully');
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

  async generateApiKey(userId: number): Promise<string> {
    const apiKey = `evt_${crypto.randomBytes(32).toString('hex')}`;
    
    await db.update(users)
      .set({ apiKey, apiKeyLastUsed: new Date() })
      .where(eq(users.id, userId));
    
    return apiKey;
  }

  async validateApiKey(apiKey: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.apiKey, apiKey))
      .limit(1);
    
    if (result.length === 0) return null;
    
    // Update last used timestamp
    await db.update(users)
      .set({ apiKeyLastUsed: new Date() })
      .where(eq(users.id, result[0].id));
    
    return result[0];
  }

  // WhatsApp settings
  async updateUserWhatsAppSettings(userId: number, data: {
    whatsappNumber?: string | null;
    whatsappNotificationsEnabled?: boolean;
    whatsappNewEventNotifications?: boolean;
    whatsappNewChatNotifications?: boolean;
    whatsappVenueReservationNotifications?: boolean;
    whatsappApplicationNotifications?: boolean;
    whatsappStatusNotifications?: boolean;
  }): Promise<User> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    return result[0];
  }

  // Event application status management
  async updateEventApplicationStatus(
    applicationId: number, 
    status: 'approved' | 'rejected' | 'pending', 
    rejectionReason?: string
  ): Promise<EventApplication> {
    const updateData: any = { status };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const result = await db.update(eventApplications)
      .set(updateData)
      .where(eq(eventApplications.id, applicationId))
      .returning();
    
    if (result.length === 0) {
      throw new Error('Candidatura não encontrada');
    }
    
    return result[0];
  }

  async getEventApplication(id: number): Promise<EventApplication | undefined> {
    const result = await db.select().from(eventApplications).where(eq(eventApplications.id, id));
    return result[0];
  }

  // ================== MÉTODOS CRÍTICOS IMPLEMENTADOS ==================

  // Transactions - Métodos críticos para sistema financeiro
  async getTransactions(userId?: number): Promise<any[]> {
    try {
      // Mock implementation - substituir por tabela transactions quando disponível
      return [];
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  }

  async createTransaction(transaction: any): Promise<any> {
    try {
      // Mock implementation - substituir por tabela transactions quando disponível
      return {
        id: Math.floor(Math.random() * 10000),
        ...transaction,
        createdAt: new Date()
      };
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction");
    }
  }

  // Financial Summary - Método crítico para dashboard
  async getFinancialSummary(userId?: number): Promise<any> {
    try {
      // Implementação básica com dados reais do sistema
      const userCondition = userId ? eq(eventApplications.providerId, userId) : undefined;
      
      const applications = await db.select({
        price: eventApplications.price,
        status: eventApplications.status
      }).from(eventApplications)
      .where(userCondition);

      const approved = applications.filter(app => app.status === 'approved');
      const pending = applications.filter(app => app.status === 'pending');
      
      const totalEarnings = approved.reduce((sum, app) => sum + parseFloat(app.price || '0'), 0);
      const pendingEarnings = pending.reduce((sum, app) => sum + parseFloat(app.price || '0'), 0);

      return {
        totalEarnings,
        pendingEarnings,
        totalApplications: applications.length,
        approvedApplications: approved.length,
        pendingApplications: pending.length
      };
    } catch (error) {
      console.error("Error getting financial summary:", error);
      return {
        totalEarnings: 0,
        pendingEarnings: 0,
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0
      };
    }
  }

  // Security Audit Logs - Método crítico para compliance
  async createSecurityAuditLog(logData: any): Promise<any> {
    try {
      // Mock implementation - substituir por tabela security_audit_logs quando disponível
      const log = {
        id: Math.floor(Math.random() * 10000),
        userId: logData.userId,
        action: logData.action,
        details: logData.details,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
        timestamp: new Date(),
        severity: logData.severity || 'info'
      };
      
      console.log("Security audit log:", log);
      return log;
    } catch (error) {
      console.error("Error creating security audit log:", error);
      throw new Error("Failed to create security audit log");
    }
  }

  async getSecurityAuditLogs(userId?: number): Promise<any[]> {
    try {
      // Mock implementation - retorna logs vazios por enquanto
      return [];
    } catch (error) {
      console.error("Error getting security audit logs:", error);
      return [];
    }
  }

  // LGPD Compliance - Métodos críticos para conformidade
  async createLgpdRequest(request: any): Promise<any> {
    try {
      // Mock implementation - substituir por tabela lgpd_requests quando disponível
      const lgpdRequest = {
        id: Math.floor(Math.random() * 10000),
        userId: request.userId,
        requestType: request.requestType,
        description: request.description,
        status: 'pending',
        createdAt: new Date(),
        processedAt: null
      };
      
      console.log("LGPD request created:", lgpdRequest);
      return lgpdRequest;
    } catch (error) {
      console.error("Error creating LGPD request:", error);
      throw new Error("Failed to create LGPD request");
    }
  }

  async getLgpdRequests(userId?: number): Promise<any[]> {
    try {
      // Mock implementation - retorna requests vazios por enquanto
      return [];
    } catch (error) {
      console.error("Error getting LGPD requests:", error);
      return [];
    }
  }

  async processLgpdRequest(id: number, status: string): Promise<any> {
    try {
      // Mock implementation
      return {
        id,
        status,
        processedAt: new Date()
      };
    } catch (error) {
      console.error("Error processing LGPD request:", error);
      throw new Error("Failed to process LGPD request");
    }
  }

  // Chatbot Conversation - Métodos para IA
  async getChatbotConversation(userId: number): Promise<any> {
    try {
      // Mock implementation - substituir por tabela chatbot_conversations quando disponível
      return null;
    } catch (error) {
      console.error("Error getting chatbot conversation:", error);
      return null;
    }
  }

  async createChatbotConversation(conversation: any): Promise<any> {
    try {
      // Mock implementation
      return {
        id: Math.floor(Math.random() * 10000),
        userId: conversation.userId,
        sessionId: conversation.sessionId,
        context: conversation.context,
        createdAt: new Date()
      };
    } catch (error) {
      console.error("Error creating chatbot conversation:", error);
      throw new Error("Failed to create chatbot conversation");
    }
  }

  async updateChatbotConversation(id: number, data: any): Promise<any> {
    try {
      // Mock implementation
      return {
        id,
        ...data,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error("Error updating chatbot conversation:", error);
      throw new Error("Failed to update chatbot conversation");
    }
  }

  // Venue Management - Métodos faltantes críticos
  async getVenueById(id: number): Promise<any> {
    try {
      const result = await db.select().from(venues).where(eq(venues.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting venue by ID:", error);
      return undefined;
    }
  }

  async updateVenue(id: number, venueData: Partial<any>): Promise<any> {
    try {
      const result = await db
        .update(venues)
        .set(venueData)
        .where(eq(venues.id, id))
        .returning();
      
      if (!result[0]) throw new Error("Venue not found");
      return result[0];
    } catch (error) {
      console.error("Error updating venue:", error);
      throw new Error("Failed to update venue");
    }
  }

  async deleteVenue(id: number): Promise<void> {
    try {
      await db.delete(venues).where(eq(venues.id, id));
    } catch (error) {
      console.error("Error deleting venue:", error);
      throw new Error("Failed to delete venue");
    }
  }

  // Notifications - Métodos críticos para sistema de notificações
  async createNotification(notificationData: any): Promise<any> {
    try {
      const result = await db.insert(notifications).values({
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        metadata: JSON.stringify(notificationData.data || {})
      }).returning();
      
      if (!result[0]) throw new Error("Failed to create notification");
      return result[0];
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  async getNotifications(userId: number): Promise<any[]> {
    try {
      const result = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  async markNotificationRead(id: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
}

export const storage = new DatabaseStorage();
