import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  companyName: text("company_name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(), // prestador, contratante, anunciante
  personType: varchar("person_type", { length: 20 }).default("fisica"), // fisica, juridica
  cpf: text("cpf"),
  cnpj: text("cnpj"),
  birthDate: text("birth_date"),
  profileImage: text("profile_image"),
  phone: text("phone"),
  address: text("address"),
  zipCode: text("zip_code"),
  street: text("street"),
  number: text("number"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  selectedServices: text("selected_services").array(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planType: varchar("plan_type", { length: 20 }).default("free"), // free, professional, premium
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: text("two_factor_backup_codes").array(),
  twoFactorLastUsed: timestamp("two_factor_last_used"),
  apiKey: text("api_key"),
  apiKeyLastUsed: timestamp("api_key_last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  guestCount: integer("guest_count").notNull(),
  organizerId: integer("organizer_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, closed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventApplications = pgTable("event_applications", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  providerId: integer("provider_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id),
  proposal: text("proposal").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedHours: integer("estimated_hours"),
  availableDate: timestamp("available_date"),
  portfolio: text("portfolio").array(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected, withdrawn
  rejectionReason: text("rejection_reason"),
  contractId: integer("contract_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  priceType: varchar("price_type", { length: 20 }).default("fixed"), // fixed, hourly, daily, negotiable
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  duration: integer("duration"), // in hours
  location: text("location"),
  serviceArea: text("service_area").array(), // cities/regions served
  portfolio: text("portfolio").array(), // image/video URLs
  requirements: text("requirements"),
  includes: text("includes").array(), // what's included in the service
  excludes: text("excludes").array(), // what's not included
  tags: text("tags").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  bookingCount: integer("booking_count").default(0),
  active: boolean("active").default(true),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  number: text("number"),
  category: text("category").notNull(),
  capacity: integer("capacity").notNull(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }),
  pricePerWeekend: decimal("price_per_weekend", { precision: 10, scale: 2 }),
  pricingModel: varchar("pricing_model", { length: 20 }).default("hourly"),
  amenities: text("amenities").array(),
  images: text("images").array(),
  addressData: text("address_data"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  eventId: integer("event_id").references(() => events.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  reviewedId: integer("reviewed_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Carrinho de compras
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  customizations: text("customizations"),
  eventDate: timestamp("event_date"),
  eventLocation: text("event_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contratos digitais
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  serviceType: text("service_type").notNull(),
  providerId: integer("provider_id").references(() => users.id).notNull(),
  clientId: integer("client_id").references(() => users.id).notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventLocation: text("event_location"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  terms: text("terms"),
  paymentTerms: text("payment_terms"),
  cancellationPolicy: text("cancellation_policy"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notificações
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reservas de venues
export const venueReservations = pgTable("venue_reservations", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").references(() => venues.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  priceType: varchar("price_type", { length: 20 }).default("day").notNull(),
  hoursPerDay: integer("hours_per_day").default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  specialRequests: text("special_requests"),
  contactPhone: text("contact_phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
});

// Disponibilidade de venues
export const venueAvailability = pgTable("venue_availability", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").references(() => venues.id).notNull(),
  date: timestamp("date").notNull(),
  available: boolean("available").default(true).notNull(),
  blockedReason: text("blocked_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  planType: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
  twoFactorBackupCodes: true,
  twoFactorLastUsed: true,
  apiKey: true,
  apiKeyLastUsed: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  organizerId: true,
  status: true,
  createdAt: true,
});

export const insertEventApplicationSchema = createInsertSchema(eventApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  providerId: true,
  active: true,
  createdAt: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  ownerId: true,
  active: true,
  createdAt: true,
}).extend({
  pricePerHour: z.union([z.string(), z.number()]).optional().nullable(),
  pricePerDay: z.union([z.string(), z.number()]).optional().nullable(),
  pricePerWeekend: z.union([z.string(), z.number()]).optional().nullable(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  signedAt: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const insertVenueReservationSchema = createInsertSchema(venueReservations).omit({
  id: true,
  status: true,
  createdAt: true,
  confirmedAt: true,
  cancelledAt: true,
});

export const insertVenueAvailabilitySchema = createInsertSchema(venueAvailability).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEventApplication = z.infer<typeof insertEventApplicationSchema>;
export type EventApplication = typeof eventApplications.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;
export type Venue = typeof venues.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertVenueReservation = z.infer<typeof insertVenueReservationSchema>;
export type VenueReservation = typeof venueReservations.$inferSelect;
export type InsertVenueAvailability = z.infer<typeof insertVenueAvailabilitySchema>;
export type VenueAvailability = typeof venueAvailability.$inferSelect;
