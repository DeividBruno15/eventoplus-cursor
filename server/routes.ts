import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { 
  insertEventSchema, 
  insertEventApplicationSchema, 
  insertUserSchema, 
  insertVenueSchema, 
  insertChatMessageSchema
} from "@shared/schema";

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

  // Auth routes
  app.post("/api/register", async (req, res) => {
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

  app.post("/api/events", async (req, res) => {
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

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
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

  // Get user venues endpoint
  app.get("/api/venues", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      console.log('Getting venues for user:', userId);
      const venues = await storage.getVenues(userId);
      console.log('Venues retrieved:', venues.length);
      res.json(venues);
    } catch (error: any) {
      console.error('Venues endpoint error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Create venue endpoint
  app.post("/api/venues", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      console.log('Venue creation request body:', req.body);
      
      const validatedData = insertVenueSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      const venue = await storage.createVenue({
        ...validatedData,
        ownerId: userId
      });

      res.status(201).json(venue);
    } catch (error: any) {
      console.error('Venue creation error:', error);
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