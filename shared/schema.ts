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
  guestCount: integer("guest_count"),
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
  musicalGenre: varchar("musical_genre", { length: 100 }),
  hasEquipment: varchar("has_equipment", { length: 50 }),
  equipment: text("equipment").array(),
  mediaFiles: text("media_files").array(),
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

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userType: text("user_type").notNull(), // prestador, contratante, anunciante
  level: text("level").notNull(), // essencial, profissional, premium
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  features: text("features").array().notNull(),
  maxEvents: integer("max_events"),
  maxServices: integer("max_services"),
  maxVenues: integer("max_venues"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  status: text("status").notNull().default("active"), // active, cancelled, past_due, unpaid
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull(),
  type: text("type").notNull(), // card, pix, boleto
  brand: text("brand"), // visa, mastercard, etc
  last4: text("last4"),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  status: text("status").notNull(), // pending, succeeded, failed, refunded
  type: text("type").notNull(), // subscription, service_fee, commission
  description: text("description"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced reviews table
export const reviewsEnhanced = pgTable("reviews_enhanced", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  reviewedId: integer("reviewed_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  serviceId: integer("service_id").references(() => services.id),
  venueId: integer("venue_id").references(() => venues.id),
  contractId: integer("contract_id").references(() => contracts.id),
  rating: integer("rating").notNull(), // 1-5
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  pros: text("pros").array(),
  cons: text("cons").array(),
  wouldRecommend: boolean("would_recommend").notNull().default(true),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, flagged
  moderationNotes: text("moderation_notes"),
  helpfulVotes: integer("helpful_votes").notNull().default(0),
  reportCount: integer("report_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User reputation scores
export const userReputation = pgTable("user_reputation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }).notNull().default("0.00"),
  totalReviews: integer("total_reviews").notNull().default(0),
  fiveStarCount: integer("five_star_count").notNull().default(0),
  fourStarCount: integer("four_star_count").notNull().default(0),
  threeStarCount: integer("three_star_count").notNull().default(0),
  twoStarCount: integer("two_star_count").notNull().default(0),
  oneStarCount: integer("one_star_count").notNull().default(0),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  averageResponseTime: integer("average_response_time"), // in minutes
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Digital contracts table
export const digitalContracts = pgTable("digital_contracts", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => users.id).notNull(),
  providerId: integer("provider_id").references(() => users.id).notNull(),
  eventId: integer("event_id").references(() => events.id),
  serviceId: integer("service_id").references(() => services.id),
  venueId: integer("venue_id").references(() => venues.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  terms: text("terms").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, signed, completed, cancelled
  contractorSignature: text("contractor_signature"),
  providerSignature: text("provider_signature"),
  contractorSignedAt: timestamp("contractor_signed_at"),
  providerSignedAt: timestamp("provider_signed_at"),
  documentUrl: text("document_url"),
  templateUsed: text("template_used"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Financial dashboard data
export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // income, expense, commission, fee
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  description: text("description").notNull(),
  eventId: integer("event_id").references(() => events.id),
  contractId: integer("contract_id").references(() => digitalContracts.id),
  transactionId: integer("transaction_id").references(() => transactions.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Two-factor authentication
export const twoFactorAuth = pgTable("two_factor_auth", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").array().notNull(),
  enabled: boolean("enabled").notNull().default(false),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Security audit logs
export const securityAuditLogs = pgTable("security_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceId: integer("resource_id"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  reason: text("reason"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// LGPD compliance data
export const lgpdRequests = pgTable("lgpd_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // access, rectification, deletion, portability, objection
  status: text("status").notNull().default("pending"), // pending, processing, completed, rejected
  requestData: text("request_data"), // JSON string
  responseData: text("response_data"), // JSON string
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI matching preferences
export const aiMatchingPreferences = pgTable("ai_matching_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  preferences: text("preferences").notNull(), // JSON string
  lastTrainingDate: timestamp("last_training_date"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chatbot conversations
export const chatbotConversations = pgTable("chatbot_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  messages: text("messages").notNull(), // JSON array
  status: text("status").notNull().default("active"), // active, resolved, escalated
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  tags: text("tags").array(),
  escalatedToHuman: boolean("escalated_to_human").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
}).extend({
  // Campos obrigatórios mais flexíveis
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  location: z.string().min(1, "Localização é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  
  // Data flexível que aceita string ou Date
  date: z.union([
    z.string().transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error("Data inválida");
      }
      return date;
    }),
    z.date()
  ]),
  
  // Budget flexível 
  budget: z.union([
    z.string().transform((val) => {
      const num = parseFloat(val.replace(/[^\d,.-]/g, '').replace(',', '.'));
      if (isNaN(num) || num < 0) {
        throw new Error("Orçamento deve ser um número válido");
      }
      return num.toString();
    }),
    z.number().min(0, "Orçamento deve ser positivo").transform((val) => val.toString())
  ]).optional(),
  
  // Campos opcionais que podem vir undefined/null
  guestCount: z.union([z.string(), z.number()]).transform((val) => {
    const num = typeof val === 'string' ? parseInt(val) : val;
    return isNaN(num) ? null : num;
  }).optional().nullable(),
  
  requirements: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
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
  updatedAt: true,
  rating: true,
  reviewCount: true,
  bookingCount: true,
  featured: true,
}).extend({
  // Make optional fields actually optional
  subcategory: z.string().optional(),
  musicalGenre: z.string().optional(),
  hasEquipment: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  mediaFiles: z.array(z.string()).optional(),
  basePrice: z.union([z.string(), z.number()]).optional().nullable(),
  priceType: z.string().optional(),
  minPrice: z.union([z.string(), z.number()]).optional().nullable(),
  maxPrice: z.union([z.string(), z.number()]).optional().nullable(),
  duration: z.number().optional().nullable(),
  location: z.string().optional().nullable(),
  serviceArea: z.array(z.string()).optional().nullable(),
  portfolio: z.array(z.string()).optional().nullable(),
  requirements: z.string().optional().nullable(),
  includes: z.array(z.string()).optional().nullable(),
  excludes: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
  ownerId: true,
  active: true,
  createdAt: true,
}).extend({
  // Campos obrigatórios
  name: z.string().min(1, "Nome do espaço é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"), 
  location: z.string().min(1, "Localização é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  capacity: z.union([
    z.string().transform((val) => {
      const num = parseInt(val);
      if (isNaN(num) || num <= 0) {
        throw new Error("Capacidade deve ser um número válido maior que 0");
      }
      return num;
    }),
    z.number().min(1, "Capacidade deve ser maior que 0")
  ]),
  
  // Campos opcionais de preço com validação
  pricePerHour: z.union([
    z.string().transform((val) => {
      if (!val || val.trim() === '') return null;
      const num = parseFloat(val.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return isNaN(num) ? null : num.toString();
    }),
    z.number().transform((val) => val.toString())
  ]).optional().nullable(),
  
  pricePerDay: z.union([
    z.string().transform((val) => {
      if (!val || val.trim() === '') return null;
      const num = parseFloat(val.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return isNaN(num) ? null : num.toString();
    }),
    z.number().transform((val) => val.toString())
  ]).optional().nullable(),
  
  pricePerWeekend: z.union([
    z.string().transform((val) => {
      if (!val || val.trim() === '') return null;
      const num = parseFloat(val.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return isNaN(num) ? null : num.toString();
    }),
    z.number().transform((val) => val.toString())
  ]).optional().nullable(),
  
  // Campos opcionais que podem ser undefined/null
  number: z.string().optional().nullable(),
  pricingModel: z.string().optional().nullable(),
  amenities: z.array(z.string()).optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  addressData: z.string().optional().nullable(),
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

// New schemas for advanced features
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewEnhancedSchema = createInsertSchema(reviewsEnhanced).omit({
  id: true,
  status: true,
  helpfulVotes: true,
  reportCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserReputationSchema = createInsertSchema(userReputation).omit({
  id: true,
  lastUpdated: true,
});

export const insertDigitalContractSchema = createInsertSchema(digitalContracts).omit({
  id: true,
  status: true,
  contractorSignature: true,
  providerSignature: true,
  contractorSignedAt: true,
  providerSignedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialRecordSchema = createInsertSchema(financialRecords).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertTwoFactorAuthSchema = createInsertSchema(twoFactorAuth).omit({
  id: true,
  lastUsed: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityAuditLogSchema = createInsertSchema(securityAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertLgpdRequestSchema = createInsertSchema(lgpdRequests).omit({
  id: true,
  status: true,
  processedBy: true,
  processedAt: true,
  createdAt: true,
});

export const insertAiMatchingPreferencesSchema = createInsertSchema(aiMatchingPreferences).omit({
  id: true,
  lastTrainingDate: true,
  accuracy: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatbotConversationSchema = createInsertSchema(chatbotConversations).omit({
  id: true,
  status: true,
  satisfactionRating: true,
  escalatedToHuman: true,
  createdAt: true,
  updatedAt: true,
});

// New types for advanced features
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertReviewEnhanced = z.infer<typeof insertReviewEnhancedSchema>;
export type ReviewEnhanced = typeof reviewsEnhanced.$inferSelect;
export type InsertUserReputation = z.infer<typeof insertUserReputationSchema>;
export type UserReputation = typeof userReputation.$inferSelect;
export type InsertDigitalContract = z.infer<typeof insertDigitalContractSchema>;
export type DigitalContract = typeof digitalContracts.$inferSelect;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertTwoFactorAuth = z.infer<typeof insertTwoFactorAuthSchema>;
export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertSecurityAuditLog = z.infer<typeof insertSecurityAuditLogSchema>;
export type SecurityAuditLog = typeof securityAuditLogs.$inferSelect;
export type InsertLgpdRequest = z.infer<typeof insertLgpdRequestSchema>;
export type LgpdRequest = typeof lgpdRequests.$inferSelect;
export type InsertAiMatchingPreferences = z.infer<typeof insertAiMatchingPreferencesSchema>;
export type AiMatchingPreferences = typeof aiMatchingPreferences.$inferSelect;
export type InsertChatbotConversation = z.infer<typeof insertChatbotConversationSchema>;
export type ChatbotConversation = typeof chatbotConversations.$inferSelect;
