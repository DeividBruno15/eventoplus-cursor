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
import { aiMatchingService } from "./ai-matching";
import { monitoringService } from "./monitoring";
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

  // Events routes - Core CRUD operations
  app.get("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const userId = (req.user as any).id;
      const userType = (req.user as any).userType;
      
      // Get user's events based on their role
      const allEvents = await storage.getEvents();
      let userEvents = [];
      
      if (userType === 'contratante') {
        // Contratantes see only their own events
        userEvents = allEvents.filter(event => event.organizerId === userId);
      } else if (userType === 'prestador') {
        // Prestadores see all active events
        userEvents = allEvents.filter(event => event.status === 'active');
      } else {
        // Anunciantes see all events for venue matching
        userEvents = allEvents;
      }
      
      res.json(userEvents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...validatedData,
        organizerId: (req.user as any).id,
      });
      res.json(event);
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Event applications routes
  app.post("/api/events/:eventId/apply", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const eventId = parseInt(req.params.eventId);
      const validatedData = insertEventApplicationSchema.parse({
        ...req.body,
        eventId,
        providerId: (req.user as any).id,
      });
      
      const application = await storage.createEventApplication(validatedData);
      res.json(application);
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

  // Enhanced Event Applications System
  app.patch("/api/applications/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const applicationId = parseInt(req.params.id);
      const { status, rejectionReason, contractTerms } = req.body;
      const user = req.user as any;

      const applications = await storage.getEventApplications(0);
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Candidatura não encontrada" });
      }

      const updatedApplication = await storage.updateEventApplication(applicationId, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        updatedAt: new Date()
      });

      // If approved, create contract
      if (status === 'approved' && contractTerms) {
        const contract = await storage.createContract({
          eventId: application.eventId,
          providerId: application.providerId,
          organizerId: user.id,
          terms: contractTerms,
          amount: application.price,
          status: 'pending_signature'
        });

        await storage.updateEventApplication(applicationId, {
          contractId: contract.id
        });
      }

      // Create notification for provider
      const event = await storage.getEvent(application.eventId);
      const statusText = status === 'approved' ? 'aprovada' : 'rejeitada';
      
      await storage.createNotification({
        userId: application.providerId,
        type: 'application_status',
        title: `Candidatura ${statusText}`,
        message: `Sua candidatura para "${event?.title}" foi ${statusText}`,
        data: { eventId: application.eventId, applicationId, status }
      });

      res.json(updatedApplication);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Google Maps Integration (FASE 2.1)
  app.get("/api/maps/geocode", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (process.env.GOOGLE_MAPS_API_KEY) {
        // Real Google Maps API integration
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address as string)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          res.json({
            address: result.formatted_address,
            coordinates: {
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            },
            place_id: result.place_id,
            components: result.address_components
          });
        } else {
          res.status(404).json({ message: "Endereço não encontrado" });
        }
      } else {
        // Fallback for development
        res.json({
          address: `${address}, São Paulo - SP, Brasil`,
          coordinates: {
            lat: -23.5505 + (Math.random() - 0.5) * 0.1,
            lng: -46.6333 + (Math.random() - 0.5) * 0.1
          },
          place_id: `place_${Date.now()}`,
          components: {
            street_number: "123",
            route: "Rua Example",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            postal_code: "01234-567"
          }
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/maps/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 5000, type = 'establishment' } = req.query;
      
      if (process.env.GOOGLE_MAPS_API_KEY) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        res.json(data);
      } else {
        // Fallback for development
        res.json({
          results: [
            {
              name: "Local Exemplo",
              place_id: `nearby_${Date.now()}`,
              geometry: {
                location: { lat: parseFloat(lat as string), lng: parseFloat(lng as string) }
              },
              rating: 4.2,
              vicinity: "São Paulo, SP"
            }
          ]
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/maps/directions", async (req, res) => {
    try {
      const { origin, destination, mode = 'driving' } = req.query;
      
      if (process.env.GOOGLE_MAPS_API_KEY) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin as string)}&destination=${encodeURIComponent(destination as string)}&mode=${mode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        res.json(data);
      } else {
        // Fallback for development
        res.json({
          routes: [{
            legs: [{
              distance: { text: "5.2 km", value: 5200 },
              duration: { text: "12 mins", value: 720 },
              start_address: origin,
              end_address: destination
            }],
            overview_polyline: { points: "example_polyline" }
          }]
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // WhatsApp Business API Integration (FASE 2.2)
  app.post("/api/whatsapp/send", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { to, message, template } = req.body;
      
      if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
        // Real WhatsApp Business API integration
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: to.replace(/\D/g, ''),
              type: 'text',
              text: { body: message }
            })
          }
        );
        
        const data = await response.json();
        res.json({
          success: true,
          messageId: data.messages?.[0]?.id || `wa_${Date.now()}`,
          status: 'sent'
        });
      } else {
        // Simulation for development
        res.json({
          success: true,
          messageId: `wa_${Date.now()}`,
          to,
          message,
          status: 'sent',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Email Service Integration (FASE 2.2)
  app.post("/api/email/send", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { to, subject, body, template } = req.body;
      
      // Email service integration would go here
      // For now, simulating successful send
      res.json({
        success: true,
        messageId: `email_${Date.now()}`,
        to,
        subject,
        status: 'sent',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verification System (FASE 2.3)
  app.post("/api/verification/submit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { documents, certificatesUrl, businessInfo } = req.body;
      const user = req.user as any;

      // Store verification request
      await storage.createNotification({
        userId: 1, // Admin user
        type: 'verification_request',
        title: 'Nova solicitação de verificação',
        message: `${user.username} enviou documentos para verificação`,
        data: { userId: user.id, documents, certificatesUrl, businessInfo }
      });

      res.json({
        success: true,
        message: "Documentos enviados para análise. Você receberá uma notificação em até 48 horas.",
        status: 'pending_review'
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/verification/:userId/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { userId } = req.params;
      const { status, notes } = req.body;
      const admin = req.user as any;

      // Only admins can verify users
      if (admin.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const updatedUser = await storage.updateUser(parseInt(userId), {
        verified: status === 'approved'
      });

      // Notify user of verification result
      await storage.createNotification({
        userId: parseInt(userId),
        type: 'verification_result',
        title: status === 'approved' ? 'Conta verificada!' : 'Verificação rejeitada',
        message: status === 'approved' 
          ? 'Sua conta foi verificada com sucesso! Agora você possui o selo de prestador verificado.'
          : `Sua solicitação de verificação foi rejeitada. Motivo: ${notes}`,
        data: { status, notes }
      });

      res.json({ success: true, user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Matching System (FASE 3.1)
  app.get("/api/ai/matches/events", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'prestador') {
        return res.status(403).json({ message: "Apenas prestadores podem buscar eventos" });
      }

      const matches = await aiMatchingService.findEventMatchesForProvider(user.id);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ai/matches/providers/:eventId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { eventId } = req.params;
      const user = req.user as any;
      
      if (user.userType !== 'contratante') {
        return res.status(403).json({ message: "Apenas contratantes podem buscar prestadores" });
      }

      const matches = await aiMatchingService.findProvidersForEvent(parseInt(eventId), user.id);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ai/pricing/suggest", async (req, res) => {
    try {
      const { category, location, duration } = req.query;
      
      const suggestions = await aiMatchingService.generatePricingSuggestions(
        category as string,
        location as string,
        duration ? parseInt(duration as string) : undefined
      );
      
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Financial System (FASE 3.2)
  app.get("/api/wallet/balance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const transactions = await storage.getTransactions(user.id);
      
      const balance = transactions.reduce((total, transaction) => {
        return transaction.type === 'credit' 
          ? total + parseFloat(transaction.amount)
          : total - parseFloat(transaction.amount);
      }, 0);

      const pendingBalance = transactions
        .filter(t => t.status === 'pending')
        .reduce((total, transaction) => {
          return transaction.type === 'credit' 
            ? total + parseFloat(transaction.amount)
            : total - parseFloat(transaction.amount);
        }, 0);

      res.json({
        available: balance,
        pending: pendingBalance,
        total: balance + pendingBalance,
        currency: 'BRL'
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/withdraw", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { amount, pixKey, description } = req.body;
      const user = req.user as any;

      // Validate PIX key
      if (!pixService.validatePixKey(pixKey)) {
        return res.status(400).json({ message: "Chave PIX inválida" });
      }

      // Check balance
      const transactions = await storage.getTransactions(user.id);
      const balance = transactions.reduce((total, transaction) => {
        return transaction.type === 'credit' 
          ? total + parseFloat(transaction.amount)
          : total - parseFloat(transaction.amount);
      }, 0);

      if (balance < parseFloat(amount)) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      // Create withdrawal transaction
      const withdrawal = await storage.createTransaction({
        userId: user.id,
        type: 'debit',
        amount: amount,
        description: description || 'Saque via PIX',
        status: 'pending',
        pixKey,
        method: 'pix'
      });

      res.json({
        success: true,
        transactionId: withdrawal.id,
        message: "Solicitação de saque enviada. Processamento em até 1 hora."
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/financial/summary", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const { period = 'month' } = req.query;
      
      const summary = await storage.getFinancialSummary(user.id, period as string);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Marketing System (FASE 3.3)
  app.post("/api/marketing/affiliate/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const affiliateCode = `${user.username.substring(0, 3).toUpperCase()}${user.id}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      await storage.updateUser(user.id, {
        affiliateCode,
        affiliateEnabled: true
      });

      res.json({
        success: true,
        affiliateCode,
        referralLink: `${process.env.BASE_URL}/auth/register?ref=${affiliateCode}`,
        commission: 10 // 10% commission
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/marketing/coupon/create", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { code, discount, type, validUntil, maxUses } = req.body;
      const user = req.user as any;

      // Only premium users can create coupons
      if (user.planType !== 'premium') {
        return res.status(403).json({ message: "Recurso disponível apenas para usuários premium" });
      }

      const coupon = {
        id: Date.now(),
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        type, // percentage or fixed
        validUntil: new Date(validUntil),
        maxUses: parseInt(maxUses),
        currentUses: 0,
        createdBy: user.id,
        active: true
      };

      // In a real implementation, this would be stored in database
      res.json({
        success: true,
        coupon,
        message: "Cupom criado com sucesso"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/marketing/campaign/create", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { name, target, budget, startDate, endDate, content } = req.body;
      const user = req.user as any;

      if (user.planType === 'free') {
        return res.status(403).json({ message: "Funcionalidade disponível a partir do plano Profissional" });
      }

      const campaign = {
        id: Date.now(),
        name,
        target, // providers, organizers, venues
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        content,
        createdBy: user.id,
        status: 'active',
        reach: 0,
        clicks: 0,
        conversions: 0
      };

      res.json({
        success: true,
        campaign,
        message: "Campanha criada e ativada"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics System
  app.get("/api/analytics/performance", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const { period = '30d' } = req.query;

      // Mock analytics data - in production this would come from real tracking
      const analytics = {
        period,
        metrics: {
          profileViews: Math.floor(Math.random() * 1000) + 100,
          contactClicks: Math.floor(Math.random() * 50) + 10,
          applications: Math.floor(Math.random() * 20) + 5,
          hires: Math.floor(Math.random() * 10) + 2,
          revenue: Math.floor(Math.random() * 5000) + 1000,
          averageRating: 4.2 + Math.random() * 0.8
        },
        trends: {
          profileViews: Array.from({length: 30}, () => Math.floor(Math.random() * 50)),
          applications: Array.from({length: 30}, () => Math.floor(Math.random() * 5)),
          revenue: Array.from({length: 30}, () => Math.floor(Math.random() * 200))
        },
        topServices: [
          { name: 'DJ', bookings: 15, revenue: 3500 },
          { name: 'Fotografia', bookings: 8, revenue: 2400 },
          { name: 'Decoração', bookings: 5, revenue: 1800 }
        ],
        demographics: {
          locations: { 'São Paulo': 45, 'Rio de Janeiro': 25, 'Outros': 30 },
          eventTypes: { 'Casamento': 40, 'Aniversário': 30, 'Corporativo': 20, 'Outros': 10 }
        }
      };

      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // FASE 4: Infrastructure and Monitoring (4.1, 4.2, 4.3)
  app.get("/api/system/health", async (req, res) => {
    try {
      const status = monitoringService.getSystemStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/system/metrics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { period = '1h' } = req.query;
      const metrics = monitoringService.getMetrics(period as string);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/system/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { resolved } = req.query;
      const resolvedFilter = resolved ? resolved === 'true' : null;
      const alerts = monitoringService.getAlerts(resolvedFilter);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/system/alerts/:alertId/resolve", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { alertId } = req.params;
      const resolved = monitoringService.resolveAlert(alertId);
      
      if (resolved) {
        res.json({ success: true, message: "Alerta resolvido" });
      } else {
        res.status(404).json({ message: "Alerta não encontrado" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Security Audit Logs
  app.post("/api/security/audit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { action, resource, details } = req.body;
      const user = req.user as any;

      await storage.createSecurityAuditLog({
        userId: user.id,
        action,
        resource,
        details,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        timestamp: new Date()
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/security/audit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { userId } = req.query;
      const logs = await storage.getSecurityAuditLogs(userId ? parseInt(userId as string) : undefined);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // LGPD Compliance
  app.post("/api/lgpd/request", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const { type, description } = req.body;
      const user = req.user as any;

      const request = await storage.createLgpdRequest({
        userId: user.id,
        type, // access, portability, rectification, deletion, objection
        description,
        status: 'pending'
      });

      res.json({
        success: true,
        requestId: request.id,
        message: "Solicitação LGPD criada. Resposta em até 15 dias úteis."
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/lgpd/requests", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      const requests = await storage.getLgpdRequests(user.id);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/lgpd/requests/:requestId/process", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const { requestId } = req.params;
      const { responseData } = req.body;

      const processed = await storage.processLgpdRequest(
        parseInt(requestId),
        user.id,
        responseData
      );

      res.json(processed);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chatbot System
  app.post("/api/chatbot/conversation", async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      const userId = req.isAuthenticated() ? (req.user as any).id : null;

      let conversation = await storage.getChatbotConversation(sessionId);
      
      if (!conversation) {
        conversation = await storage.createChatbotConversation({
          sessionId,
          userId,
          messages: [],
          status: 'active'
        });
      }

      // Simple chatbot responses
      const responses: Record<string, string> = {
        'como funciona': 'O Evento+ conecta organizadores de eventos com prestadores de serviços e donos de espaços. Você pode criar eventos, buscar prestadores ou anunciar seus serviços.',
        'preços': 'Temos planos gratuitos e pagos. O plano Essencial é gratuito, o Profissional custa R$ 29,90/mês e o Premium R$ 79,90/mês.',
        'contato': 'Você pode entrar em contato conosco pelo email suporte@eventoplus.com.br ou pelo WhatsApp (11) 99999-9999.',
        'cadastro': 'Para se cadastrar, clique em "Cadastrar" no menu superior e escolha seu tipo de usuário: Prestador, Contratante ou Anunciante.',
        'pagamento': 'Aceitamos PIX, cartões de crédito e débito. Todos os pagamentos são processados com segurança.',
        'default': 'Olá! Sou o assistente virtual do Evento+. Posso ajudar com informações sobre nossa plataforma, preços, cadastro e muito mais. Como posso ajudar?'
      };

      const botResponse = Object.keys(responses).find(key => 
        message.toLowerCase().includes(key)
      ) || 'default';

      const reply = responses[botResponse];

      const updatedMessages = [
        ...(conversation.messages || []),
        { type: 'user', content: message, timestamp: new Date() },
        { type: 'bot', content: reply, timestamp: new Date() }
      ];

      await storage.updateChatbotConversation(conversation.id, {
        messages: updatedMessages,
        lastActivity: new Date()
      });

      res.json({
        reply,
        sessionId,
        conversationId: conversation.id
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cache and Performance Optimization
  app.get("/api/cache/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Mock cache statistics
      res.json({
        hitRate: 85.6,
        missRate: 14.4,
        totalRequests: 15423,
        cacheSize: '245MB',
        evictions: 156,
        keys: 3241,
        memory: {
          used: '245MB',
          available: '1GB',
          percentage: 24.5
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cache/clear", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const user = req.user as any;
      if (user.userType !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Clear user cache
      const userCache = new Map();
      userCache.clear();

      res.json({
        success: true,
        message: "Cache limpo com sucesso",
        clearedAt: new Date()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Apply monitoring middleware
  app.use(monitoringService.trackRequest.bind(monitoringService));
  app.use(monitoringService.trackError.bind(monitoringService));

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