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

  // Configure Google OAuth strategy
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "190052814958-tsi43i10m25irafgqvn7hnqike3f3eql.apps.googleusercontent.com";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "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";
  const replatDomain = process.env.REPLIT_DEV_DOMAIN || "d797590d-a47b-43a2-948a-07f16f2e2817-00-3guspncus7p2n.picard.replit.dev";
  
  console.log("Configuring Google OAuth with Client ID:", googleClientId);
  console.log("Callback URL:", `https://${replatDomain}/auth/google/callback`);
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: `https://${replatDomain}/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google OAuth callback received, processing profile:", profile.id);
          const email = profile.emails?.[0]?.value;
          if (!email) {
            console.error("No email found in Google profile");
            return done(new Error("No email found in Google profile"));
          }

          console.log("Processing Google login for email:", email);
          // Check if user already exists
          let user = await storage.getUserByEmail(email);
          
          if (user) {
            // User exists, return them
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

          console.log("New user created:", newUser.email);
          return done(null, newUser);
        } catch (error) {
          console.error("Error in Google OAuth callback:", error);
          return done(error);
        }
      }
    )
  );
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: `https://${replatDomain}/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            console.log("Google OAuth callback received, processing profile:", profile.id);
            const email = profile.emails?.[0]?.value;
            if (!email) {
              console.error("No email found in Google profile");
              return done(new Error("No email found in Google profile"));
            }

            console.log("Processing Google login for email:", email);
            // Check if user already exists
            let user = await storage.getUserByEmail(email);
            
            if (user) {
              // User exists, return them
              return done(null, user);
            }

            // Create new user from Google profile
            const newUser = await storage.createUser({
              username: profile.displayName || email.split('@')[0],
              email: email,
              password: '', // Empty password for Google OAuth users
              userType: 'contratante' // Default user type, can be changed later
            });

            return done(null, newUser);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }



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
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erro no login automático" });
        }
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao criar usuário" });
    }
  });

  app.post("/api/login", passport.authenticate('local'), (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Google OAuth routes
  app.get("/auth/google", (req, res, next) => {
    console.log("Starting Google OAuth authentication...");
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })(req, res, next);
  });

  app.get("/auth/google/callback", 
    (req, res, next) => {
      console.log("Google OAuth callback received");
      passport.authenticate("google", { 
        failureRedirect: "/login",
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

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const { password, ...userWithoutPassword } = req.user as any;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Não autenticado" });
    }
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
      const event = await storage.createEvent({
        ...validatedData,
        organizerId: (req.user as any).id,
      });
      res.json(event);
    } catch (error: any) {
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

  // Stripe subscription endpoint
  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    let user = req.user as any;

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.send({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
        return;
      } catch (error) {
        // Subscription might not exist, continue to create new one
      }
    }
    
    if (!user.email) {
      throw new Error('No user email on file');
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
      });

      user = await storage.updateStripeCustomerId(user.id, customer.id);

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);
  
      res.send({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      return res.status(400).send({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);

  // WebSocket for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });

  return httpServer;
}
