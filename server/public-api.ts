import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import crypto from "crypto";

export interface ApiKey {
  id: string;
  userId: number;
  name: string;
  key: string;
  permissions: string[];
  rateLimitPerHour: number;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
}

export interface ApiUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
}

export class PublicApiService {
  private usageTracking: Map<string, { count: number; resetTime: Date }> = new Map();
  
  /**
   * Generate a new API key
   */
  generateApiKey(): string {
    const prefix = 'evt_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}${randomBytes}`;
  }

  /**
   * Create new API key for user
   */
  async createApiKey(userId: number, name: string, permissions: string[], rateLimitPerHour: number = 1000): Promise<ApiKey> {
    const apiKey: ApiKey = {
      id: crypto.randomUUID(),
      userId,
      name,
      key: this.generateApiKey(),
      permissions,
      rateLimitPerHour,
      isActive: true,
      createdAt: new Date(),
      usageCount: 0
    };

    // In a real implementation, this would be stored in the database
    // For now, we'll simulate storage
    return apiKey;
  }

  /**
   * Validate API key and check permissions
   */
  async validateApiKey(key: string, requiredPermission?: string): Promise<{ valid: boolean; apiKey?: ApiKey; error?: string }> {
    // Simulate API key validation
    if (!key || !key.startsWith('evt_')) {
      return { valid: false, error: 'Invalid API key format' };
    }

    // In production, this would query the database
    const mockApiKey: ApiKey = {
      id: crypto.randomUUID(),
      userId: 1,
      name: 'Development Key',
      key,
      permissions: ['events:read', 'events:write', 'services:read', 'venues:read', 'users:read'],
      rateLimitPerHour: 1000,
      isActive: true,
      createdAt: new Date(),
      usageCount: 0
    };

    if (!mockApiKey.isActive) {
      return { valid: false, error: 'API key is inactive' };
    }

    if (requiredPermission && !mockApiKey.permissions.includes(requiredPermission)) {
      return { valid: false, error: `Missing required permission: ${requiredPermission}` };
    }

    return { valid: true, apiKey: mockApiKey };
  }

  /**
   * Check rate limiting for API key
   */
  checkRateLimit(apiKeyId: string, limit: number): RateLimitInfo {
    const now = new Date();
    const resetTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const usage = this.usageTracking.get(apiKeyId);
    
    if (!usage || usage.resetTime < now) {
      // Reset or initialize usage
      this.usageTracking.set(apiKeyId, { count: 1, resetTime });
      return {
        limit,
        remaining: limit - 1,
        resetTime
      };
    }

    usage.count++;
    return {
      limit,
      remaining: Math.max(0, limit - usage.count),
      resetTime: usage.resetTime
    };
  }

  /**
   * Log API usage
   */
  async logApiUsage(apiKeyId: string, endpoint: string, method: string, statusCode: number, responseTime: number, req: Request): Promise<void> {
    const usage: ApiUsage = {
      id: crypto.randomUUID(),
      apiKeyId,
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    };

    // In production, this would be stored in database
    console.log('API Usage:', usage);
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(apiKeyId: string, period: 'day' | 'week' | 'month' = 'day') {
    // Mock usage statistics
    return {
      totalRequests: 156,
      successfulRequests: 148,
      failedRequests: 8,
      averageResponseTime: 245,
      topEndpoints: [
        { endpoint: '/api/v1/events', count: 45 },
        { endpoint: '/api/v1/services', count: 38 },
        { endpoint: '/api/v1/venues', count: 25 }
      ],
      errorBreakdown: {
        '400': 3,
        '401': 2,
        '404': 2,
        '500': 1
      }
    };
  }
}

/**
 * Middleware for API key authentication
 */
export function apiKeyAuth(requiredPermission?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const apiKey = req.header('X-API-Key') || req.query.api_key as string;

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Please provide an API key in the X-API-Key header or api_key query parameter'
      });
    }

    const apiService = new PublicApiService();
    const validation = await apiService.validateApiKey(apiKey, requiredPermission);

    if (!validation.valid) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: validation.error
      });
    }

    // Check rate limiting
    const rateLimit = apiService.checkRateLimit(validation.apiKey!.id, validation.apiKey!.rateLimitPerHour);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimit.limit.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.getTime().toString()
    });

    if (rateLimit.remaining <= 0) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'API rate limit exceeded. Please try again later.',
        resetTime: rateLimit.resetTime
      });
    }

    // Add API key info to request
    (req as any).apiKey = validation.apiKey;

    // Log usage on response
    const originalSend = res.send;
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      apiService.logApiUsage(
        validation.apiKey!.id,
        req.path,
        req.method,
        res.statusCode,
        responseTime,
        req
      );
      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Public API endpoint schemas
 */
export const apiSchemas = {
  // Events API
  eventResponse: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    location: z.string(),
    date: z.string(),
    budget: z.string(),
    guestCount: z.number().nullable(),
    status: z.string().nullable(),
    organizerId: z.number(),
    createdAt: z.string()
  }),

  // Services API
  serviceResponse: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    subcategory: z.string().nullable(),
    providerId: z.number(),
    pricing: z.object({
      type: z.string(),
      value: z.number()
    }).nullable(),
    createdAt: z.string()
  }),

  // Venues API
  venueResponse: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    location: z.string(),
    capacity: z.number().nullable(),
    amenities: z.array(z.string()).nullable(),
    ownerId: z.number(),
    createdAt: z.string()
  }),

  // Common error response
  errorResponse: z.object({
    error: z.string(),
    message: z.string(),
    timestamp: z.string().optional()
  }),

  // Pagination
  paginatedResponse: z.object({
    data: z.array(z.any()),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number()
    })
  })
};

export const publicApiService = new PublicApiService();

/**
 * API Documentation structure
 */
export const apiDocumentation = {
  openapi: "3.0.0",
  info: {
    title: "Evento+ Public API",
    version: "1.0.0",
    description: "Official API for Evento+ platform - Connect your applications with our event marketplace",
    contact: {
      name: "Evento+ API Support",
      email: "api@eventoplus.com"
    }
  },
  servers: [
    {
      url: "https://api.eventoplus.com/v1",
      description: "Production server"
    },
    {
      url: "https://staging-api.eventoplus.com/v1", 
      description: "Staging server"
    }
  ],
  security: [
    {
      ApiKeyAuth: []
    }
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key"
      }
    },
    schemas: {
      Event: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          location: { type: "string" },
          date: { type: "string", format: "date-time" },
          budget: { type: "string" },
          guestCount: { type: "integer", nullable: true },
          status: { type: "string", nullable: true },
          organizerId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Service: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          subcategory: { type: "string", nullable: true },
          providerId: { type: "integer" },
          pricing: {
            type: "object",
            nullable: true,
            properties: {
              type: { type: "string" },
              value: { type: "number" }
            }
          },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Venue: {
        type: "object", 
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          location: { type: "string" },
          capacity: { type: "integer", nullable: true },
          amenities: { type: "array", items: { type: "string" }, nullable: true },
          ownerId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          timestamp: { type: "string", format: "date-time" }
        }
      },
      PaginatedResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: {} },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" }
            }
          }
        }
      }
    }
  },
  paths: {
    "/events": {
      get: {
        summary: "List events",
        description: "Retrieve a paginated list of events",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 }
          },
          {
            name: "limit", 
            in: "query",
            schema: { type: "integer", default: 20, maximum: 100 }
          },
          {
            name: "category",
            in: "query", 
            schema: { type: "string" }
          },
          {
            name: "location",
            in: "query",
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" }
              }
            }
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/events/{id}": {
      get: {
        summary: "Get event by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          "200": {
            description: "Event details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Event" }
              }
            }
          },
          "404": {
            description: "Event not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/services": {
      get: {
        summary: "List services",
        description: "Retrieve a paginated list of services",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 }
          },
          {
            name: "limit",
            in: "query", 
            schema: { type: "integer", default: 20, maximum: 100 }
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" }
              }
            }
          }
        }
      }
    },
    "/venues": {
      get: {
        summary: "List venues", 
        description: "Retrieve a paginated list of venues",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 }
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20, maximum: 100 }
          },
          {
            name: "category", 
            in: "query",
            schema: { type: "string" }
          },
          {
            name: "location",
            in: "query",
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedResponse" }
              }
            }
          }
        }
      }
    }
  }
};