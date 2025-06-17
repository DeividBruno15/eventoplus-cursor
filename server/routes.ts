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
  app.post("/api/mobile/login", async (req, res) => {
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

  app.post("/api/services", async (req, res) => {
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
  app.post("/api/venues", async (req, res) => {
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

  app.post("/api/public/webhook", async (req, res) => {
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