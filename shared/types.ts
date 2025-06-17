// Dashboard Analytics Types
export interface PrestadorStats {
  applicationsCount: number;
  servicesCount: number;
  averageRating: number;
  activeServices: number;
  pendingApplications: number;
}

export interface ContratanteStats {
  eventsCount: number;
  applicationsCount: number;
  totalBudget: number;
  activeEvents: number;
  pendingApplications: number;
}

export interface AnuncianteStats {
  venuesCount: number;
  reservationsCount: number;
  totalRevenue: number;
  activeVenues: number;
  occupancyRate: number;
}

export type DashboardStats = PrestadorStats | ContratanteStats | AnuncianteStats;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Chat Types
export interface ChatContact {
  id: number;
  name: string;
  email: string;
  userType: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

// Notification Types
export interface NotificationData {
  id: number;
  type: 'event' | 'message' | 'application' | 'booking' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: number;
  relatedId?: number;
}

// Performance Metrics
export interface PerformanceMetrics {
  responseTime: number;
  uptime: number;
  errorRate: number;
  activeUsers: number;
  totalRequests: number;
}

// Security Audit Types
export interface SecurityAudit {
  endpoint: string;
  method: string;
  timestamp: Date;
  ip: string;
  userId?: number;
  status: number;
  rateLimited: boolean;
}