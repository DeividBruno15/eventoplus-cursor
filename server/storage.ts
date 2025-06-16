import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, or } from "drizzle-orm";
import { 
  users, 
  events, 
  eventApplications, 
  services, 
  venues, 
  chatMessages, 
  reviews,
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
  type InsertReview
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
  
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
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
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Reviews
  getReviews(reviewedId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
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

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0];
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
}

export const storage = new DatabaseStorage();
