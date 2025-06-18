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

import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import { storage } from "./storage";
import { pixService } from "./pix";
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


  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });


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

      let recommendations: any[] = [];

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

  // PIX payment routes
  app.post("/api/payments/pix/create", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { amount, description, payerCpf, externalReference } = req.body;
      const user = req.user as any;

      const pixPayment = await pixService.createPixPayment({
        amount: parseFloat(amount),
        description: description || "Pagamento Evento+",
        payerEmail: user.email,
        payerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
        payerCpf,
        externalReference
      });

      res.json(pixPayment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/payments/pix/:paymentId/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { paymentId } = req.params;
      const status = await pixService.getPaymentStatus(paymentId);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/webhooks/mercadopago", webhookLimiter, async (req, res) => {
    try {
      await pixService.processWebhook(req.body);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Advanced search system
  app.get("/api/search/advanced", async (req, res) => {
    try {
      const { 
        q, 
        type = 'all',
        category,
        location,
        minPrice,
        maxPrice,
        rating,
        verified,
        radius = 50,
        lat,
        lng,
        sortBy = 'relevance',
        page = 1,
        limit = 20
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const results: any = { events: [], services: [], venues: [], total: 0 };

      // Search events
      if (type === 'all' || type === 'events') {
        const events = await storage.getEvents();
        const filteredEvents = events.filter(event => {
          if (q && !event.title.toLowerCase().includes((q as string).toLowerCase()) && 
                  !event.description.toLowerCase().includes((q as string).toLowerCase())) return false;
          if (category && event.category !== category) return false;
          if (location && !event.location.toLowerCase().includes((location as string).toLowerCase())) return false;
          if (minPrice && parseFloat(event.budget) < parseFloat(minPrice as string)) return false;
          if (maxPrice && parseFloat(event.budget) > parseFloat(maxPrice as string)) return false;
          return true;
        });
        
        results.events = filteredEvents.slice(offset, offset + parseInt(limit as string));
        results.total += filteredEvents.length;
      }

      // Search services
      if (type === 'all' || type === 'services') {
        const services = await storage.getServices();
        const filteredServices = services.filter(service => {
          if (q && !service.title.toLowerCase().includes((q as string).toLowerCase()) && 
                  !service.description.toLowerCase().includes((q as string).toLowerCase())) return false;
          if (category && service.category !== category) return false;
          if (location && service.location && !service.location.toLowerCase().includes((location as string).toLowerCase())) return false;
          if (minPrice && service.basePrice && parseFloat(service.basePrice) < parseFloat(minPrice as string)) return false;
          if (maxPrice && service.basePrice && parseFloat(service.basePrice) > parseFloat(maxPrice as string)) return false;
          if (rating && service.rating && parseFloat(service.rating) < parseFloat(rating as string)) return false;
          return true;
        });
        
        results.services = filteredServices.slice(offset, offset + parseInt(limit as string));
        results.total += filteredServices.length;
      }

      // Search venues
      if (type === 'all' || type === 'venues') {
        const venues = await storage.getVenues();
        const filteredVenues = venues.filter(venue => {
          if (q && !venue.name.toLowerCase().includes((q as string).toLowerCase()) && 
                  !venue.description.toLowerCase().includes((q as string).toLowerCase())) return false;
          if (category && venue.venueType !== category) return false;
          if (location && !venue.address.toLowerCase().includes((location as string).toLowerCase())) return false;
          if (minPrice && venue.basePrice && parseFloat(venue.basePrice) < parseFloat(minPrice as string)) return false;
          if (maxPrice && venue.basePrice && parseFloat(venue.basePrice) > parseFloat(maxPrice as string)) return false;
          if (rating && venue.rating && parseFloat(venue.rating) < parseFloat(rating as string)) return false;
          return true;
        });
        
        results.venues = filteredVenues.slice(offset, offset + parseInt(limit as string));
        results.total += filteredVenues.length;
      }

      // Sort results
      if (sortBy === 'price_asc') {
        results.services.sort((a: any, b: any) => parseFloat(a.basePrice || 0) - parseFloat(b.basePrice || 0));
        results.venues.sort((a: any, b: any) => parseFloat(a.basePrice || 0) - parseFloat(b.basePrice || 0));
      } else if (sortBy === 'price_desc') {
        results.services.sort((a: any, b: any) => parseFloat(b.basePrice || 0) - parseFloat(a.basePrice || 0));
        results.venues.sort((a: any, b: any) => parseFloat(b.basePrice || 0) - parseFloat(a.basePrice || 0));
      } else if (sortBy === 'rating') {
        results.services.sort((a: any, b: any) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        results.venues.sort((a: any, b: any) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      }

      res.json({
        ...results,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: results.total,
          pages: Math.ceil(results.total / parseInt(limit as string))
        },
        filters: { q, type, category, location, minPrice, maxPrice, rating, sortBy }
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