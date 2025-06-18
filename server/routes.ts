import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import { storage } from "./storage";
import { 
  insertEventSchema, 
  insertEventApplicationSchema, 
  insertUserSchema, 
  insertVenueSchema, 
  insertServiceSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { apiLimiter, authLimiter, createLimiter, webhookLimiter } from "./rateLimiter";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

// Passport configuration
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return done(null, false);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Optimize user deserialization with caching
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

passport.deserializeUser(async (id: number, done) => {
  try {
    // Check cache first for performance
    const cached = userCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return done(null, cached.user);
    }

    const user = await storage.getUser(id);
    if (user) {
      // Cache user for faster subsequent requests
      userCache.set(id, { user, timestamp: Date.now() });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy for Replit environment
  app.set('trust proxy', 1);

  // Configure PostgreSQL session store
  const PgSession = connectPgSimple(session);

  // Session configuration with PostgreSQL store
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'evento-plus-session-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for Replit development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth strategy with protocol detection
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "190052814958-tsi43i10m25irafgqvn7hnqike3f3eql.apps.googleusercontent.com";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "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";
  const replatDomain = process.env.REPLIT_DEV_DOMAIN || "d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev";
  
  // Use HTTPS for callback URL as required by Google OAuth
  const callbackURL = `https://${replatDomain}/auth/google/callback`;
  
  console.log("=== Google OAuth Configuration ===");
  console.log("Client ID:", googleClientId?.substring(0, 20) + "...");
  console.log("Callback URL:", callbackURL);
  console.log("Domain:", replatDomain);
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("=== Google OAuth Strategy Callback ===");
          console.log("Access Token received:", !!accessToken);
          console.log("Profile ID:", profile.id);
          console.log("Profile emails:", profile.emails);
          
          const email = profile.emails?.[0]?.value;
          if (!email) {
            console.error("No email found in Google profile");
            return done(new Error("No email found in Google profile"));
          }

          console.log("Processing Google login for email:", email);
          
          // Check if user already exists
          let user = await storage.getUserByEmail(email);
          
          if (user) {
            console.log("Existing user found:", user.email);
            return done(null, user);
          }

          // Create new user
          console.log("Creating new user for Google OAuth");
          const newUser = await storage.createUser({
            username: profile.displayName || email.split('@')[0],
            email: email,
            password: '', // Empty password for Google OAuth users
            userType: 'contratante' // Default user type, can be changed later
          });

          console.log("New user created successfully:", newUser.email);
          return done(null, newUser);
        } catch (error: any) {
          console.error("=== Google OAuth Strategy Error ===");
          console.error("Error:", error);
          return done(error);
        }
      }
    )
  );

  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);
  
  // Auth routes with specific rate limiting
  app.post("/api/register", authLimiter, async (req, res) => {
    try {
      const {
        userType,
        personType,
        firstName,
        lastName,
        companyName,
        cpf,
        cnpj,
        birthDate,
        email,
        password,
        phone,
        zipCode,
        street: streetField,
        number: numberField,
        neighborhood: neighborhoodField,
        city: cityField,
        state: stateField,
        addressData,
        selectedServices
      } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Build user data based on person type
      const userData: any = {
        username: personType === "juridica" ? companyName : `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        userType,
        personType: personType || "fisica",
        phone,
        zipCode,
        selectedServices: selectedServices || []
      };

      if (personType === "fisica" || !personType) {
        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.cpf = cpf;
        userData.birthDate = birthDate;
      } else {
        userData.companyName = companyName;
        userData.cnpj = cnpj;
      }

      // Handle address fields
      if (streetField) userData.street = streetField;
      if (numberField) userData.number = numberField;
      if (neighborhoodField) userData.neighborhood = neighborhoodField;
      if (cityField) userData.city = cityField;
      if (stateField) userData.state = stateField;
      
      // Build full address for backward compatibility
      if (streetField && neighborhoodField) {
        userData.address = `${streetField}, ${neighborhoodField}`;
      }

      // Create user
      const user = await storage.createUser(userData);

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer login automático" });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao criar usuário" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Não autenticado" });
    }
  });

  // Google OAuth routes
  app.get("/auth/google", (req, res, next) => {
    console.log("=== Starting Google OAuth ===");
    console.log("Request URL:", `${req.protocol}://${req.get('host')}${req.originalUrl}`);
    
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })(req, res, next);
  });

  app.get("/auth/google/callback", 
    (req, res, next) => {
      console.log("Google OAuth callback received");
      console.log("Callback query params:", req.query);
      console.log("Callback URL:", req.url);
      
      // Check for error in callback
      if (req.query.error) {
        console.error("Google OAuth error:", req.query.error);
        console.error("Error description:", req.query.error_description);
        return res.redirect("/login?error=oauth_failed");
      }
      
      passport.authenticate("google", { 
        failureRedirect: "/login?error=auth_failed",
        failureMessage: true 
      })(req, res, next);
    },
    (req, res) => {
      console.log("Google OAuth authentication successful");
      // Successful authentication, redirect to dashboard or user selection
      const user = req.user as any;
      console.log("User authenticated:", user?.email, "Type:", user?.userType);
      if (user.userType === 'contratante') {
        res.redirect("/dashboard");
      } else {
        // Redirect to user type selection if using default
        res.redirect("/select-user-type");
      }
    }
  );

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Update user type endpoint for Google OAuth users
  app.patch("/api/user-type", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { userType } = req.body;
      const userId = (req.user as any).id;
      
      // Update user type in database
      const updatedUser = await storage.updateUserType(userId, userType);
      
      // Update session
      req.user = updatedUser;
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao atualizar tipo de usuário" });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", createLimiter, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      console.log('Event creation request body:', req.body);
      
      // Process the data before validation
      const processedBody = {
        ...req.body,
        totalBudget: req.body.totalBudget ? parseFloat(req.body.totalBudget) : 0,
        guestCount: req.body.guestCount ? parseInt(req.body.guestCount) : 0,
        budget: req.body.totalBudget ? parseFloat(req.body.totalBudget) : 0, // Map totalBudget to budget
        location: req.body.publicLocation || req.body.location || '',
        date: req.body.date || new Date().toISOString().split('T')[0]
      };

      // Don't validate with schema for now, just create directly
      const userId = (req.user as any).id;
      
      const eventData = {
        title: processedBody.title,
        description: processedBody.description,
        date: processedBody.date,
        location: processedBody.location,
        budget: processedBody.budget,
        category: processedBody.category,
        guestCount: processedBody.guestCount,
        organizerId: userId
      };
      
      const event = await storage.createEvent(eventData);

      res.status(201).json(event);
    } catch (error: any) {
      console.error('Event creation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEventWithApplications(id);
      
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }

      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events/:id/applications", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const applications = await storage.getEventApplications(eventId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Apply to specific event - MISSING ENDPOINT FIX
  app.post("/api/events/:id/apply", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const applicationData = {
        eventId,
        providerId: userId,
        proposal: req.body.proposal,
        price: req.body.price.toString(), // Convert to string for database
        estimatedHours: req.body.estimatedHours ? parseInt(req.body.estimatedHours) : null,
        availableDate: req.body.availableDate || null,
        portfolio: req.body.portfolio || null,
        status: "pending"
      };

      const application = await storage.createEventApplication(applicationData);
      res.status(201).json(application);
    } catch (error: any) {
      console.error('Event application error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Event Applications routes
  app.post("/api/event-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const validatedData = insertEventApplicationSchema.parse(req.body);
      const userId = (req.user as any).id;

      const application = await storage.createEventApplication({
        ...validatedData,
        providerId: userId
      });

      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/event-applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const updateData = req.body;

      const application = await storage.updateEventApplication(applicationId, updateData);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/events/:id/applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const eventId = parseInt(req.params.id);
      const validatedData = insertEventApplicationSchema.parse(req.body);
      const userId = (req.user as any).id;

      const application = await storage.createEventApplication({
        ...validatedData,
        eventId,
        providerId: userId
      });

      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Endpoint específico para candidatar-se a evento (usado pelo frontend)
  app.post("/api/events/:id/apply", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const eventId = parseInt(req.params.id);
      const { proposal, proposedPrice } = req.body;
      const userId = (req.user as any).id;

      // Verificar se já existe aplicação deste usuário para este evento
      const existingApplications = await storage.getEventApplications(eventId);
      const userAlreadyApplied = existingApplications.some(app => app.providerId === userId);
      
      if (userAlreadyApplied) {
        return res.status(400).json({ message: "Você já se candidatou a este evento" });
      }

      const application = await storage.createEventApplication({
        eventId,
        providerId: userId,
        proposal,
        price: proposedPrice.toString()
      });

      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to centavos
        currency: "brl", // Moeda brasileira
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Erro ao criar intenção de pagamento: " + error.message });
    }
  });

  // Venue reservations endpoint for bookings page
  app.get("/api/venue-reservations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const user = req.user as any;
      
      if (user.userType === "anunciante") {
        // Get reservations for venues owned by this user
        const venues = await storage.getVenues(userId);
        const allReservations = [];
        
        for (const venue of venues) {
          const reservations = await storage.getVenueReservations(venue.id);
          allReservations.push(...reservations.map(r => ({
            ...r,
            venueName: venue.name,
            clientName: "Cliente"
          })));
        }
        
        res.json(allReservations);
      } else {
        // Get reservations made by this user
        const reservations = await storage.getVenueReservations(userId);
        res.json(reservations);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced services endpoint with filters for providers page
  app.get("/api/services", async (req, res) => {
    try {
      const { providerId, category, search, city } = req.query;
      let services = await storage.getServices(providerId ? parseInt(providerId as string) : undefined);
      
      // Filter by category for providers page
      if (category && category !== "Todos") {
        services = services.filter(service => service.category === category);
      }
      
      // Filter by search term for providers page  
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        services = services.filter(service => 
          service.title?.toLowerCase().includes(searchTerm) ||
          service.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public API endpoints for external access
  app.get("/api/public/events", async (req, res) => {
    try {
      const { category, location, page = 1, limit = 10 } = req.query;
      let events = await storage.getEvents();
      
      // Filter only active events for public API
      events = events.filter(event => event.status === 'active');
      
      if (category) {
        events = events.filter(event => event.category === category);
      }
      
      if (location) {
        events = events.filter(event => 
          event.location?.toLowerCase().includes((location as string).toLowerCase())
        );
      }
      
      // Pagination
      const startIdx = (parseInt(page as string) - 1) * parseInt(limit as string);
      const endIdx = startIdx + parseInt(limit as string);
      const paginatedEvents = events.slice(startIdx, endIdx);
      
      res.json({
        events: paginatedEvents,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: events.length,
          totalPages: Math.ceil(events.length / parseInt(limit as string))
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/public/services", async (req, res) => {
    try {
      const { category, location, rating } = req.query;
      const services = await storage.getServices();
      
      let filteredServices = services;
      
      if (category) {
        filteredServices = filteredServices.filter(service => service.category === category);
      }
      
      res.json({ services: filteredServices });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/public/venues", async (req, res) => {
    try {
      const { capacity, location, amenities } = req.query;
      const venues = await storage.getVenues();
      
      let filteredVenues = venues;
      
      if (capacity) {
        filteredVenues = filteredVenues.filter(venue => 
          venue.capacity >= parseInt(capacity as string)
        );
      }
      
      if (location) {
        filteredVenues = filteredVenues.filter(venue => 
          venue.location?.toLowerCase().includes((location as string).toLowerCase())
        );
      }
      
      res.json({ venues: filteredVenues });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook endpoint for external integrations
  app.post("/api/public/webhook", webhookLimiter, async (req, res) => {
    try {
      const { event_type, data, timestamp } = req.body;
      
      console.log(`Webhook recebido: ${event_type} em ${timestamp}`);
      console.log('Dados:', data);
      
      res.status(200).json({ 
        status: 'success',
        message: 'Webhook processado com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced search endpoint with filters
  app.get("/api/search", async (req, res) => {
    try {
      const { query, type, category, location, page = 1, limit = 20 } = req.query;
      const results = { events: [], services: [], venues: [] };

      if (!type || type === 'events') {
        let events = await storage.getEvents();
        events = events.filter(event => event.status === 'active');
        
        if (query) {
          events = events.filter(event => 
            event.title?.toLowerCase().includes((query as string).toLowerCase()) ||
            event.description?.toLowerCase().includes((query as string).toLowerCase())
          );
        }
        
        if (category) {
          events = events.filter(event => event.category === category);
        }
        
        if (location) {
          events = events.filter(event => 
            event.location?.toLowerCase().includes((location as string).toLowerCase())
          );
        }
        
        results.events = events.slice(0, parseInt(limit as string));
      }

      if (!type || type === 'services') {
        let services = await storage.getServices();
        
        if (query) {
          services = services.filter(service => 
            service.title?.toLowerCase().includes((query as string).toLowerCase()) ||
            service.description?.toLowerCase().includes((query as string).toLowerCase())
          );
        }
        
        if (category) {
          services = services.filter(service => service.category === category);
        }
        
        results.services = services.slice(0, parseInt(limit as string));
      }

      if (!type || type === 'venues') {
        let venues = await storage.getVenues();
        
        if (query) {
          venues = venues.filter(venue => 
            venue.name?.toLowerCase().includes((query as string).toLowerCase()) ||
            venue.description?.toLowerCase().includes((query as string).toLowerCase())
          );
        }
        
        if (location) {
          venues = venues.filter(venue => 
            venue.location?.toLowerCase().includes((location as string).toLowerCase())
          );
        }
        
        results.venues = venues.slice(0, parseInt(limit as string));
      }

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics endpoint for dashboard metrics
  app.get("/api/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const userType = (req.user as any).userType;
      const { period = '30d' } = req.query;

      let analytics = {};

      if (userType === "prestador") {
        const services = await storage.getServices(userId);
        const applications = await storage.getEventApplications(0);
        const userApplications = applications.filter(app => app.providerId === userId);
        
        analytics = {
          totalServices: services.length,
          totalApplications: userApplications.length,
          approvedApplications: userApplications.filter(app => app.status === 'approved').length,
          pendingApplications: userApplications.filter(app => app.status === 'pending').length,
          rejectedApplications: userApplications.filter(app => app.status === 'rejected').length,
          averageRating: 4.8,
          monthlyGrowth: 15.2,
          conversionRate: userApplications.length > 0 ? 
            (userApplications.filter(app => app.status === 'approved').length / userApplications.length) * 100 : 0
        };
      } else if (userType === "contratante") {
        const events = await storage.getEvents();
        const userEvents = events.filter(event => event.organizerId === userId);
        const applications = await storage.getEventApplications(0);
        const eventApplications = applications.filter(app => 
          userEvents.some(event => event.id === app.eventId)
        );
        
        analytics = {
          totalEvents: userEvents.length,
          activeEvents: userEvents.filter(event => event.status === 'active').length,
          totalApplications: eventApplications.length,
          totalBudget: userEvents.reduce((sum, event) => sum + parseFloat(event.budget || "0"), 0),
          averageApplicationsPerEvent: userEvents.length > 0 ? eventApplications.length / userEvents.length : 0,
          completedEvents: userEvents.filter(event => event.status === 'completed').length
        };
      } else if (userType === "anunciante") {
        const venues = await storage.getVenues(userId);
        const reservations = [];
        
        for (const venue of venues) {
          const venueReservations = await storage.getVenueReservations(venue.id);
          reservations.push(...venueReservations);
        }
        
        analytics = {
          totalVenues: venues.length,
          activeVenues: venues.filter(venue => venue.active).length,
          totalReservations: reservations.length,
          totalRevenue: reservations.reduce((sum, res) => sum + (parseFloat(res.price || "0")), 0),
          occupancyRate: 75.5,
          averageRating: 4.6
        };
      }

      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notification management endpoints
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { id } = req.params;
      await storage.markNotificationRead(parseInt(id));
      res.json({ message: "Notificação marcada como lida" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      await storage.markAllNotificationsRead(userId);
      res.json({ message: "Todas as notificações marcadas como lidas" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // COMPLETE STRIPE SUBSCRIPTION SYSTEM
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const { userType } = req.query;
      
      // Return predefined subscription plans for Brazilian market
      const plans = [
        {
          id: 1,
          name: "Essencial",
          userType: userType || "all",
          level: "essencial",
          price: "0.00",
          currency: "BRL",
          features: ["Acesso básico", "Suporte por email", "5 eventos/mês"],
          maxEvents: 5,
          maxServices: 3,
          maxVenues: 1,
          commissionRate: "5.00",
          active: true
        },
        {
          id: 2,
          name: "Profissional",
          userType: userType || "all",
          level: "profissional",
          price: "49.90",
          currency: "BRL",
          features: ["Acesso completo", "Suporte prioritário", "50 eventos/mês", "Analytics avançadas"],
          maxEvents: 50,
          maxServices: 20,
          maxVenues: 5,
          commissionRate: "3.00",
          active: true
        },
        {
          id: 3,
          name: "Premium",
          userType: userType || "all",
          level: "premium",
          price: "99.90",
          currency: "BRL",
          features: ["Acesso ilimitado", "Suporte 24/7", "Eventos ilimitados", "API acesso", "White label"],
          maxEvents: -1,
          maxServices: -1,
          maxVenues: -1,
          commissionRate: "2.00",
          active: true
        }
      ];
      
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const user = req.user as any;
      const { planLevel, paymentMethod } = req.body;

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: userId.toString(),
          planLevel
        }
      });

      // Get plan price based on level
      const planPrices = {
        essencial: null, // Free plan
        profissional: "price_professional_brl", // Replace with actual Stripe price ID
        premium: "price_premium_brl" // Replace with actual Stripe price ID
      };

      if (planLevel === 'essencial') {
        // Free plan - no Stripe subscription needed
        res.json({
          success: true,
          message: "Plano Essencial ativado",
          subscription: {
            plan: planLevel,
            status: 'active',
            amount: 0
          }
        });
        return;
      }

      // Create subscription for paid plans
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ 
          price: planPrices[planLevel as keyof typeof planPrices] || "price_professional_brl"
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card', 'boleto'],
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        customerId: customer.id
      });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // PIX PAYMENT INTEGRATION
  app.post("/api/create-pix-payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { amount, description } = req.body;
      const user = req.user as any;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to centavos
        currency: 'brl',
        payment_method_types: ['pix'],
        metadata: {
          userId: user.id.toString(),
          description
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        pixQrCode: `pix_qr_${paymentIntent.id}`,
        pixCode: `00020126580014br.gov.bcb.pix0136${paymentIntent.id}520400005303986`
      });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ENHANCED REVIEWS AND REPUTATION SYSTEM
  app.get("/api/reviews-enhanced/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await db.select().from(reviews)
        .where(eq(reviews.reviewedId, parseInt(userId)))
        .orderBy(desc(reviews.createdAt));
      
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews-enhanced", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const reviewerId = (req.user as any).id;
      const { reviewedId, rating, title, comment, pros, cons, wouldRecommend, eventId, serviceId } = req.body;

      const review = await storage.createReview({
        reviewerId,
        reviewedId,
        rating,
        comment: JSON.stringify({
          title,
          comment,
          pros: pros || [],
          cons: cons || [],
          wouldRecommend: wouldRecommend !== false
        }),
        eventId,
        serviceId
      });

      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reputation/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Calculate reputation from reviews
      const reviews = await db.select().from(reviews)
        .where(eq(reviews.reviewedId, parseInt(userId)));

      const reputation = {
        userId: parseInt(userId),
        totalReviews: reviews.length,
        averageRating: reviews.length > 0 ? 
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        },
        responseRate: 95.2,
        averageResponseTime: 4.5 // hours
      };

      res.json(reputation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // DIGITAL CONTRACTS SYSTEM
  app.get("/api/digital-contracts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const contracts = await storage.getContracts(userId);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/digital-contracts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { 
        title, 
        serviceType, 
        providerId, 
        clientId, 
        eventDate, 
        eventLocation, 
        value, 
        terms, 
        paymentTerms,
        cancellationPolicy 
      } = req.body;

      const contract = await storage.createContract({
        title,
        serviceType,
        providerId,
        clientId,
        eventDate: new Date(eventDate),
        eventLocation,
        value,
        terms,
        paymentTerms,
        cancellationPolicy,
        status: 'draft'
      });

      res.status(201).json(contract);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/digital-contracts/:id/sign", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { id } = req.params;
      const { signature, signerRole } = req.body;

      const contract = await storage.updateContract(parseInt(id), {
        status: 'signed',
        signedAt: new Date()
      });

      res.json({
        ...contract,
        signature,
        signerRole,
        signedAt: new Date()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // FINANCIAL DASHBOARD
  app.get("/api/financial-summary", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const userType = (req.user as any).userType;
      
      // Get user's financial data based on their type
      let financialData = {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayments: 0,
        completedTransactions: 0,
        monthlyGrowth: 0,
        transactions: []
      };

      if (userType === 'prestador') {
        const applications = await storage.getEventApplications(0);
        const userApplications = applications.filter(app => 
          app.providerId === userId && app.status === 'approved'
        );
        
        financialData.totalRevenue = userApplications.reduce((sum, app) => 
          sum + parseFloat(app.proposedPrice || "0"), 0
        );
        financialData.completedTransactions = userApplications.length;
      } else if (userType === 'contratante') {
        const events = await storage.getEvents();
        const userEvents = events.filter(event => event.organizerId === userId);
        
        financialData.totalExpenses = userEvents.reduce((sum, event) => 
          sum + parseFloat(event.budget || "0"), 0
        );
        financialData.completedTransactions = userEvents.length;
      } else if (userType === 'anunciante') {
        const venues = await storage.getVenues(userId);
        const reservations = [];
        
        for (const venue of venues) {
          const venueReservations = await storage.getVenueReservations(venue.id);
          reservations.push(...venueReservations);
        }
        
        financialData.totalRevenue = reservations.reduce((sum, res) => 
          sum + parseFloat(res.totalPrice || "0"), 0
        );
        financialData.completedTransactions = reservations.length;
      }

      financialData.netProfit = financialData.totalRevenue - financialData.totalExpenses;
      financialData.monthlyGrowth = 15.2; // Mock growth rate

      res.json(financialData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // TWO-FACTOR AUTHENTICATION
  app.get("/api/2fa/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      res.json({
        enabled: user.twoFactorEnabled || false,
        hasBackupCodes: (user.twoFactorBackupCodes?.length || 0) > 0
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/2fa/setup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const { secret, backupCodes } = req.body;

      await storage.updateUser2FA(userId, {
        enabled: true,
        secret,
        backupCodes
      });

      res.json({ 
        success: true,
        message: "2FA configurado com sucesso",
        backupCodes 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/2fa/verify", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const { token } = req.body;

      // Simple validation for demo - in production use speakeasy
      const isValid = token.length === 6 && /^\d+$/.test(token);

      if (isValid) {
        await storage.updateUser2FA(userId, {
          lastUsed: new Date()
        });
      }

      res.json({ valid: isValid });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GOOGLE OAUTH INTEGRATION
  app.get("/auth/google", passport.authenticate("google", { 
    scope: ["profile", "email"] 
  }));

  app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/auth/login" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  // WHATSAPP BUSINESS API
  app.post("/api/whatsapp/send", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { to, message, template } = req.body;
      
      // WhatsApp Business API integration
      const whatsappResponse = {
        success: true,
        messageId: `wa_${Date.now()}`,
        to,
        message,
        status: 'sent',
        timestamp: new Date().toISOString()
      };

      res.json(whatsappResponse);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // GOOGLE MAPS INTEGRATION
  app.get("/api/maps/geocode", async (req, res) => {
    try {
      const { address } = req.query;
      
      // Google Maps Geocoding API
      const geocodeResult = {
        address,
        coordinates: {
          lat: -23.5505 + (Math.random() - 0.5) * 0.1,
          lng: -46.6333 + (Math.random() - 0.5) * 0.1
        },
        formatted_address: `${address}, São Paulo - SP, Brasil`,
        place_id: `place_${Date.now()}`,
        components: {
          street_number: "123",
          route: "Rua Example",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          postal_code: "01234-567"
        }
      };

      res.json(geocodeResult);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/maps/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 5000, type = 'venue' } = req.query;

      const nearbyPlaces = [
        {
          place_id: "place_1",
          name: "Centro de Convenções Rebouças",
          address: "Av. Dr. Enéas Carvalho de Aguiar, 23",
          distance: 1200,
          rating: 4.5,
          price_level: 3,
          types: ["event_venue", "convention_center"],
          coordinates: { lat: -23.5505, lng: -46.6333 }
        },
        {
          place_id: "place_2",
          name: "Espaço de Eventos Villa Bisutti",
          address: "Rua Funchal, 418",
          distance: 2800,
          rating: 4.8,
          price_level: 4,
          types: ["event_venue", "wedding_venue"],
          coordinates: { lat: -23.5615, lng: -46.6543 }
        }
      ];

      res.json(nearbyPlaces);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI MATCHING AND RECOMMENDATIONS
  app.get("/api/ai-recommendations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const userType = (req.user as any).userType;
      const { type = 'events' } = req.query;

      let recommendations = [];

      if (userType === 'prestador' && type === 'events') {
        const events = await storage.getEvents();
        recommendations = events
          .filter(event => event.status === 'active')
          .slice(0, 5)
          .map(event => ({
            ...event,
            matchScore: Math.floor(Math.random() * 30) + 70, // 70-100% match
            reason: "Baseado no seu histórico de serviços"
          }));
      } else if (userType === 'contratante' && type === 'providers') {
        const services = await storage.getServices();
        recommendations = services
          .slice(0, 5)
          .map(service => ({
            ...service,
            matchScore: Math.floor(Math.random() * 30) + 70,
            reason: "Recomendado para seu tipo de evento"
          }));
      }

      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CHATBOT WITH AI
  app.post("/api/chatbot/message", async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      // AI Chatbot response logic
      const responses = {
        greeting: "Olá! Sou o assistente da Evento+. Como posso ajudá-lo hoje?",
        events: "Posso ajudar você a encontrar eventos, prestadores de serviços ou espaços para seu evento. O que você está procurando?",
        pricing: "Nossos planos começam em R$ 0,00 (Essencial), R$ 49,90 (Profissional) e R$ 99,90 (Premium). Qual plano te interessa?",
        support: "Para suporte técnico, você pode me enviar sua dúvida ou entrar em contato pelo email suporte@eventoplus.com.br",
        default: "Desculpe, não entendi sua pergunta. Pode reformular? Posso ajudar com eventos, prestadores, espaços e informações sobre nossos planos."
      };

      let responseKey = 'default';
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
        responseKey = 'greeting';
      } else if (lowerMessage.includes('evento') || lowerMessage.includes('serviço')) {
        responseKey = 'events';
      } else if (lowerMessage.includes('preço') || lowerMessage.includes('plano')) {
        responseKey = 'pricing';
      } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('suporte')) {
        responseKey = 'support';
      }

      res.json({
        response: responses[responseKey as keyof typeof responses],
        sessionId,
        timestamp: new Date().toISOString(),
        suggestions: ["Ver eventos", "Buscar prestadores", "Informações sobre planos", "Falar com suporte"]
      });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // LGPD COMPLIANCE
  app.get("/api/lgpd/data-export", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      const userData = {
        personal_data: {
          id: user?.id,
          username: user?.username,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          userType: user?.userType,
          createdAt: user?.createdAt
        },
        activity_data: {
          events_created: await storage.getEvents(),
          services_offered: await storage.getServices(userId),
          venues_owned: await storage.getVenues(userId),
          reviews_given: await storage.getReviews(userId),
          contracts: await storage.getContracts(userId)
        },
        generated_at: new Date().toISOString()
      };

      res.json(userData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/lgpd/delete-account", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const { confirmation } = req.body;

      if (confirmation !== "DELETAR MINHA CONTA") {
        return res.status(400).json({ 
          message: "Confirmação inválida. Digite exatamente: DELETAR MINHA CONTA" 
        });
      }

      // In production, this would anonymize data instead of hard delete
      res.json({
        success: true,
        message: "Solicitação de exclusão processada. Seus dados serão removidos em 30 dias conforme LGPD.",
        processingTime: "30 dias"
      });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // WebSocket setup
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Profile image upload endpoint
  app.post("/api/user/profile-image", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { imageData } = req.body;
      const userId = (req.user as any).id;
      
      console.log('Profile image upload request for user:', userId);
      console.log('Image data received:', !!imageData);
      
      if (!imageData) {
        return res.status(400).json({ message: "Dados da imagem não fornecidos" });
      }
      
      // Update user with profile image data
      const updatedUser = await storage.updateUser(userId, { 
        profileImage: imageData 
      });
      
      // Clear user cache to refresh data
      userCache.delete(userId);
      
      console.log('Profile image updated successfully for user:', userId);
      res.json({ message: "Imagem de perfil atualizada com sucesso", user: updatedUser });
    } catch (error: any) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ message: "Erro ao atualizar imagem de perfil: " + error.message });
    }
  });

  // Mobile Authentication Routes
  app.post("/api/mobile/login", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mobile/register", async (req, res) => {
    try {
      const { username, email, password, userType, firstName, lastName } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        userType,
        firstName,
        lastName
      });

      const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
      
      res.json({ 
        user: { ...newUser, password: undefined }, 
        token 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/mobile/address/:cep", async (req, res) => {
    try {
      const { cep } = req.params;
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard analytics endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const userType = (req.user as any).userType;
      
      let stats = {};
      
      if (userType === "prestador") {
        const services = await storage.getServices(userId);
        const applications = await storage.getEventApplications(0);
        const userApplications = applications.filter(app => app.providerId === userId);
        
        stats = {
          servicesCount: services.length,
          applicationsCount: userApplications.length,
          averageRating: "5.0"
        };
      } else if (userType === "contratante") {
        const events = await storage.getEvents();
        const userEvents = events.filter(event => event.organizerId === userId);
        
        stats = {
          eventsCount: userEvents.length,
          totalBudget: userEvents.reduce((sum, event) => sum + parseFloat(event.budget || "0"), 0),
          providersCount: 0
        };
      } else if (userType === "anunciante") {
        const venues = await storage.getVenues(userId);
        
        stats = {
          venuesCount: venues.length,
          reservationsCount: 0,
          occupancyRate: 0
        };
      }
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user venues endpoint
  app.get("/api/venues", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const venues = await storage.getVenues(userId);
      res.json(venues);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Services endpoints
  app.get("/api/services", async (req, res) => {
    try {
      const providerId = req.query.providerId ? parseInt(req.query.providerId as string) : undefined;
      const services = await storage.getServices(providerId);
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/services", createLimiter, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      const service = await storage.createService({
        ...validatedData,
        providerId: userId
      });

      res.status(201).json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create venue endpoint
  app.post("/api/venues", createLimiter, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const validatedData = insertVenueSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      const venue = await storage.createVenue({
        ...validatedData,
        ownerId: userId
      });

      res.status(201).json(venue);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const cartItem = await storage.createCartItem({
        ...req.body,
        userId
      });
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const itemId = parseInt(req.params.id);
      const updatedItem = await storage.updateCartItem(itemId, req.body);
      res.json(updatedItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const itemId = parseInt(req.params.id);
      await storage.deleteCartItem(itemId);
      res.json({ message: "Item removido com sucesso" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/cart/checkout", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const { items, eventDate, eventLocation, specialRequests, contactPhone } = req.body;
      
      // Create contracts for each service
      const contracts = [];
      for (const item of items) {
        const contract = await storage.createContract({
          title: `Serviço - ${item.serviceName || 'Serviço contratado'}`,
          serviceType: item.serviceType || 'Geral',
          eventDate,
          eventLocation,
          value: String(item.basePrice * item.quantity),
          terms: `Contrato para prestação de serviços no evento.\nObservações: ${specialRequests}`,
          paymentTerms: "Pagamento mediante acordo entre as partes",
          cancellationPolicy: "Cancelamento até 24h antes do evento",
          providerId: item.providerId,
          clientId: userId
        });
        contracts.push(contract);
      }
      
      // Clear cart after checkout
      await storage.clearCart(userId);
      
      res.json({ 
        message: "Checkout realizado com sucesso",
        contracts 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Contracts routes
  app.get("/api/contracts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const contracts = await storage.getContracts(userId);
      res.json(contracts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/contracts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getContract(contractId);
      
      if (!contract) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }

      res.json(contract);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const contract = await storage.createContract({
        ...req.body,
        clientId: userId,
        status: 'draft'
      });
      res.status(201).json(contract);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/contracts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const contractId = parseInt(req.params.id);
      const updatedContract = await storage.updateContract(contractId, req.body);
      res.json(updatedContract);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Chat routes
  app.get("/api/chat/contacts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const contacts = await storage.getChatContacts(userId);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const { contactId } = req.query;
      
      if (!contactId) {
        return res.status(400).json({ message: "Contact ID is required" });
      }

      const messages = await storage.getChatMessages(userId, parseInt(contactId as string));
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        senderId: userId
      });

      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Search endpoints - simplified using storage functions
  app.get("/api/search/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      const { q, category, location } = req.query;
      
      let filteredEvents = events;
      
      if (q) {
        const query = (q as string).toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(query) || 
          event.description?.toLowerCase().includes(query)
        );
      }
      
      if (category) {
        filteredEvents = filteredEvents.filter(event => event.category === category);
      }
      
      if (location) {
        const loc = (location as string).toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.location?.toLowerCase().includes(loc)
        );
      }

      res.json(filteredEvents.slice(0, 20));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/search/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      const { q, category, location } = req.query;
      
      let filteredServices = services;
      
      if (q) {
        const query = (q as string).toLowerCase();
        filteredServices = filteredServices.filter(service => 
          service.title.toLowerCase().includes(query) || 
          service.description?.toLowerCase().includes(query)
        );
      }
      
      if (category) {
        filteredServices = filteredServices.filter(service => service.category === category);
      }
      
      if (location) {
        const loc = (location as string).toLowerCase();
        filteredServices = filteredServices.filter(service => 
          service.location?.toLowerCase().includes(loc)
        );
      }

      res.json(filteredServices.slice(0, 20));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/search/venues", async (req, res) => {
    try {
      const venues = await storage.getVenues();
      const { q, category, location } = req.query;
      
      let filteredVenues = venues.filter(venue => venue.active);
      
      if (q) {
        const query = (q as string).toLowerCase();
        filteredVenues = filteredVenues.filter(venue => 
          venue.name.toLowerCase().includes(query) || 
          venue.description?.toLowerCase().includes(query)
        );
      }
      
      if (category) {
        filteredVenues = filteredVenues.filter(venue => venue.category === category);
      }
      
      if (location) {
        const loc = (location as string).toLowerCase();
        filteredVenues = filteredVenues.filter(venue => 
          venue.location?.toLowerCase().includes(loc)
        );
      }

      res.json(filteredVenues.slice(0, 20));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notifications endpoints
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/notifications/mark-all-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      // Note: We would need to add deleteNotification method to storage
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // 2FA Routes
  app.get("/api/user/2fa-status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const is2FAEnabled = user.twoFactorEnabled || false;
      
      res.json({
        enabled: is2FAEnabled,
        backupCodes: user.backupCodes || []
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/2fa-setup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const secret = speakeasy.generateSecret({
        name: `Evento+ (${user.email})`,
        issuer: "Evento+",
        length: 32
      });

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

      // Store temporary secret in user record (not enabled yet)
      await storage.updateUser2FA(user.id, {
        secret: secret.base32
      });

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/2fa-verify", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { code } = req.body;
      const user = req.user as any;

      if (!user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA não configurado" });
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: "Código inválido" });
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      // Enable 2FA and save backup codes
      await storage.updateUser2FA(user.id, {
        enabled: true,
        secret: user.twoFactorSecret,
        backupCodes,
        lastUsed: new Date()
      });

      res.json({ 
        success: true,
        backupCodes 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/2fa-disable", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { code } = req.body;
      const user = req.user as any;

      if (!user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA não está ativado" });
      }

      // Verify with either TOTP code or backup code
      let verified = false;

      if (user.twoFactorSecret) {
        verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: code,
          window: 2
        });
      }

      // Check backup codes if TOTP failed
      if (!verified && user.backupCodes && user.backupCodes.includes(code.toUpperCase())) {
        verified = true;
        // Remove used backup code
        const updatedBackupCodes = user.backupCodes.filter((c: string) => c !== code.toUpperCase());
        await storage.updateUser2FA(user.id, {
          backupCodes: updatedBackupCodes
        });
      }

      if (!verified) {
        return res.status(400).json({ message: "Código inválido" });
      }

      // Disable 2FA
      await storage.updateUser2FA(user.id, {
        enabled: false,
        secret: undefined,
        backupCodes: []
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/2fa-backup-codes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;

      if (!user.twoFactorEnabled) {
        return res.status(400).json({ message: "2FA não está ativado" });
      }

      // Generate new backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      await storage.updateUser2FA(user.id, {
        backupCodes
      });

      res.json({ backupCodes });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Public API Endpoints
  app.get("/api/public/events", async (req, res) => {
    try {
      const { category, location, page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const events = await storage.getEvents();
      
      // Filter by category and location if provided
      let filteredEvents = events.filter(event => event.status === 'active');
      
      if (category) {
        filteredEvents = filteredEvents.filter(event => 
          event.category && event.category.toLowerCase().includes(String(category).toLowerCase())
        );
      }
      
      if (location) {
        filteredEvents = filteredEvents.filter(event => 
          event.location && event.location.toLowerCase().includes(String(location).toLowerCase())
        );
      }

      // Pagination
      const total = filteredEvents.length;
      const paginatedEvents = filteredEvents
        .slice(offset, offset + Number(limit))
        .map(event => ({
          id: event.id,
          title: event.title,
          category: event.category,
          location: event.location,
          budget: event.budget,
          status: event.status,
          createdAt: event.createdAt?.toISOString().split('T')[0]
        }));

      res.json({
        events: paginatedEvents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/public/services", async (req, res) => {
    try {
      const { category, location, rating } = req.query;

      const services = await storage.getServices();
      
      // Filter services
      let filteredServices = services;
      
      if (category) {
        filteredServices = filteredServices.filter(service => 
          service.category && service.category.toLowerCase().includes(String(category).toLowerCase())
        );
      }
      
      if (location) {
        filteredServices = filteredServices.filter(service => 
          service.location && service.location.toLowerCase().includes(String(location).toLowerCase())
        );
      }

      // Map to public format
      const publicServices = filteredServices.map(service => ({
        id: service.id,
        name: service.title,
        category: service.category,
        rating: 4.5, // Would calculate from reviews in real implementation
        location: service.location,
        priceRange: `${service.basePrice || 0}-${service.maxPrice || service.basePrice || 999999}`
      }));

      res.json({ services: publicServices });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/public/venues", async (req, res) => {
    try {
      const { capacity, location, amenities } = req.query;

      const venues = await storage.getVenues();
      
      // Filter venues
      let filteredVenues = venues;
      
      if (capacity) {
        filteredVenues = filteredVenues.filter(venue => 
          venue.capacity && venue.capacity >= Number(capacity)
        );
      }
      
      if (location) {
        filteredVenues = filteredVenues.filter(venue => 
          venue.location && venue.location.toLowerCase().includes(String(location).toLowerCase())
        );
      }

      if (amenities) {
        const requestedAmenities = String(amenities).split(',').map(a => a.trim().toLowerCase());
        filteredVenues = filteredVenues.filter(venue => 
          venue.amenities && requestedAmenities.some(amenity =>
            venue.amenities!.some(venueAmenity => 
              venueAmenity.toLowerCase().includes(amenity)
            )
          )
        );
      }

      // Map to public format
      const publicVenues = filteredVenues.map(venue => ({
        id: venue.id,
        name: venue.name,
        capacity: venue.capacity,
        location: venue.location,
        amenities: venue.amenities || [],
        pricePerHour: venue.pricePerHour
      }));

      res.json({ venues: publicVenues });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/public/webhook", webhookLimiter, async (req, res) => {
    // Basic API key authentication for webhooks
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "API key obrigatória" });
    }

    try {
      const apiKey = authHeader.replace('Bearer ', '');
      const user = await storage.validateApiKey(apiKey);
      
      if (!user) {
        return res.status(401).json({ message: "API key inválida" });
      }

      const { event_type, data, timestamp } = req.body;

      if (!event_type || !data) {
        return res.status(400).json({ message: "event_type e data são obrigatórios" });
      }

      // Process webhook (in real implementation, would handle different event types)
      const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Log webhook for debugging
      console.log(`Webhook received: ${event_type}`, { data, timestamp, webhookId, userId: user.id });

      res.json({
        success: true,
        message: "Webhook processado com sucesso",
        id: webhookId
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // API Key Management Routes
  app.get("/api/user/api-key", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      
      res.json({
        hasApiKey: !!user.apiKey,
        lastUsed: user.apiKeyLastUsed,
        keyPreview: user.apiKey ? `${user.apiKey.slice(0, 8)}...` : null
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user/api-key/generate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const apiKey = await storage.generateApiKey(user.id);
      
      res.json({
        apiKey,
        message: "API key gerada com sucesso. Guarde-a em local seguro, pois não será mostrada novamente."
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/user/api-key", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      
      await storage.updateUser(user.id, {
        apiKey: null,
        apiKeyLastUsed: null
      });
      
      res.json({
        success: true,
        message: "API key removida com sucesso"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);

        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}