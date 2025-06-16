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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private eventApplications: Map<number, EventApplication>;
  private services: Map<number, Service>;
  private venues: Map<number, Venue>;
  private chatMessages: Map<number, ChatMessage>;
  private reviews: Map<number, Review>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventApplications = new Map();
    this.services = new Map();
    this.venues = new Map();
    this.chatMessages = new Map();
    this.reviews = new Map();
    this.currentId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      planType: "free",
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId: customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(userId: number, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      planType: "professional"
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(eventData: InsertEvent & { organizerId: number }): Promise<Event> {
    const id = this.currentId++;
    const event: Event = {
      ...eventData,
      id,
      status: "active",
      createdAt: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event> {
    const event = this.events.get(id);
    if (!event) throw new Error("Event not found");
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  // Event Applications
  async getEventApplications(eventId: number): Promise<EventApplication[]> {
    return Array.from(this.eventApplications.values()).filter(app => app.eventId === eventId);
  }

  async createEventApplication(applicationData: InsertEventApplication): Promise<EventApplication> {
    const id = this.currentId++;
    const application: EventApplication = {
      ...applicationData,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.eventApplications.set(id, application);
    return application;
  }

  async updateEventApplication(id: number, applicationData: Partial<EventApplication>): Promise<EventApplication> {
    const application = this.eventApplications.get(id);
    if (!application) throw new Error("Application not found");
    
    const updatedApplication = { ...application, ...applicationData };
    this.eventApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Services
  async getServices(providerId?: number): Promise<Service[]> {
    const allServices = Array.from(this.services.values());
    return providerId 
      ? allServices.filter(service => service.providerId === providerId)
      : allServices;
  }

  async createService(serviceData: InsertService & { providerId: number }): Promise<Service> {
    const id = this.currentId++;
    const service: Service = {
      ...serviceData,
      id,
      active: true,
      createdAt: new Date(),
    };
    this.services.set(id, service);
    return service;
  }

  // Venues
  async getVenues(ownerId?: number): Promise<Venue[]> {
    const allVenues = Array.from(this.venues.values());
    return ownerId 
      ? allVenues.filter(venue => venue.ownerId === ownerId)
      : allVenues;
  }

  async createVenue(venueData: InsertVenue & { ownerId: number }): Promise<Venue> {
    const id = this.currentId++;
    const venue: Venue = {
      ...venueData,
      id,
      active: true,
      createdAt: new Date(),
    };
    this.venues.set(id, venue);
    return venue;
  }

  // Chat Messages
  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      msg => (msg.senderId === senderId && msg.receiverId === receiverId) ||
             (msg.senderId === receiverId && msg.receiverId === senderId)
    );
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const message: ChatMessage = {
      ...messageData,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Reviews
  async getReviews(reviewedId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.reviewedId === reviewedId);
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.currentId++;
    const review: Review = {
      ...reviewData,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
