import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiter geral para API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Usar user ID se autenticado, senão IP
    if (req.isAuthenticated && req.isAuthenticated()) {
      return `user:${(req.user as any)?.id}`;
    }
    return req.ip || 'unknown';
  }
});

// Rate limiter específico para autenticação
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rate limiter para criação de recursos
export const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 criações por minuto
  message: {
    error: 'Muitas criações de recursos. Aguarde um momento.',
    retryAfter: 60
  },
  keyGenerator: (req: Request) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return `create:${(req.user as any)?.id}`;
    }
    return `create:${req.ip || 'unknown'}`;
  }
});

// Rate limiter para webhooks e API pública
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // máximo 30 webhooks por minuto
  message: {
    error: 'Rate limit exceeded for webhook calls',
    retryAfter: 60
  },
  keyGenerator: (req: Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const apiKey = authHeader.replace('Bearer ', '');
      return `webhook:${apiKey}`;
    }
    return `webhook:${req.ip || 'unknown'}`;
  }
});