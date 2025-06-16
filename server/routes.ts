import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { insertEventSchema, insertEventApplicationSchema, insertUserSchema } from "@shared/schema";

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

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'evento-plus-session-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth strategy with error handling
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "190052814958-tsi43i10m25irafgqvn7hnqike3f3eql.apps.googleusercontent.com";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "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";
  const replatDomain = process.env.REPLIT_DEV_DOMAIN || "d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev";
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
        } catch (error) {
          console.error("=== Google OAuth Strategy Error ===");
          console.error("Error type:", error.constructor.name);
          console.error("Error message:", error.message);
          console.error("Full error:", error);
          return done(error);
        }
      }
    )
  );

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

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
    console.log("User Agent:", req.get('User-Agent'));
    console.log("Referer:", req.get('Referer'));
    
    // Test if Google strategy is properly configured
    console.log("Google strategy configured, proceeding with authentication...");
    
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
      const validatedData = insertEventSchema.parse(req.body);
      const userId = (req.user as any).id;
      
      const event = await storage.createEvent({
        ...validatedData,
        organizerId: userId
      });

      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
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
        applicantId: userId
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