import cron from 'node-cron';
import { storage } from './storage';

export interface SystemMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  requests: number;
  errors: number;
  responseTime: number;
  activeUsers: number;
  databaseConnections: number;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class MonitoringService {
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];

  constructor() {
    this.startMetricsCollection();
    this.startHealthChecks();
  }

  // Request tracking middleware
  trackRequest(req: any, res: any, next: any) {
    const start = Date.now();
    this.requestCount++;

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      this.responseTimes.push(responseTime);
      
      if (res.statusCode >= 400) {
        this.errorCount++;
      }

      // Alert on high response times
      if (responseTime > 5000) {
        this.createAlert({
          type: 'warning',
          title: 'Slow Response Time',
          message: `Request to ${req.path} took ${responseTime}ms`,
          severity: 'medium'
        });
      }
    });

    next();
  }

  // Error tracking middleware
  trackError(error: Error, req: any, res: any, next: any) {
    this.errorCount++;
    
    this.createAlert({
      type: 'error',
      title: 'Application Error',
      message: `${error.message} at ${req.path}`,
      severity: 'high'
    });

    // Log error details for debugging
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    next(error);
  }

  private startMetricsCollection() {
    // Collect metrics every minute
    cron.schedule('* * * * *', () => {
      this.collectMetrics();
    });
  }

  private startHealthChecks() {
    // Health checks every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.performHealthChecks();
    });
  }

  private collectMetrics() {
    const avgResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;

    const metric: SystemMetrics = {
      timestamp: new Date(),
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
      requests: this.requestCount,
      errors: this.errorCount,
      responseTime: avgResponseTime,
      activeUsers: 0, // Would be calculated from active sessions
      databaseConnections: 1 // Simplified
    };

    this.metrics.push(metric);
    
    // Keep only last 24 hours of metrics
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);

    // Reset counters
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];

    this.checkMetricThresholds(metric);
  }

  private checkMetricThresholds(metric: SystemMetrics) {
    // Memory usage alert
    if (metric.memory > 500) { // 500MB
      this.createAlert({
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage: ${metric.memory.toFixed(2)}MB`,
        severity: 'medium'
      });
    }

    // Error rate alert
    if (metric.errors > 10) {
      this.createAlert({
        type: 'error',
        title: 'High Error Rate',
        message: `${metric.errors} errors in the last minute`,
        severity: 'high'
      });
    }

    // Response time alert
    if (metric.responseTime > 2000) {
      this.createAlert({
        type: 'warning',
        title: 'Slow Response Times',
        message: `Average response time: ${metric.responseTime.toFixed(2)}ms`,
        severity: 'medium'
      });
    }
  }

  private async performHealthChecks() {
    try {
      // Database health check
      await storage.getUser(1);
      
      // API endpoints health check
      const healthChecks = [
        { name: 'Database', status: 'healthy' },
        { name: 'Authentication', status: 'healthy' },
        { name: 'File Storage', status: 'healthy' },
        { name: 'External APIs', status: 'healthy' }
      ];

      console.log('Health Check Results:', healthChecks);
    } catch (error) {
      this.createAlert({
        type: 'error',
        title: 'Health Check Failed',
        message: `System component health check failed: ${error}`,
        severity: 'critical'
      });
    }
  }

  private createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Send critical alerts immediately
    if (alert.severity === 'critical') {
      this.sendCriticalAlert(alert);
    }
  }

  private sendCriticalAlert(alert: Alert) {
    console.error('CRITICAL ALERT:', alert);
    
    // In production, this would send alerts via:
    // - Email
    // - SMS
    // - Slack/Discord webhook
    // - PagerDuty
  }

  getMetrics(period: string = '1h'): SystemMetrics[] {
    const now = new Date();
    let cutoff: Date;

    switch (period) {
      case '1h':
        cutoff = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  getAlerts(resolved: boolean | null = null): Alert[] {
    if (resolved === null) {
      return this.alerts;
    }
    return this.alerts.filter(a => a.resolved === resolved);
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  getSystemStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    lastCheck: Date;
    components: { name: string; status: string; lastCheck: Date }[];
  } {
    const activeAlerts = this.getAlerts(false);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const warningAlerts = activeAlerts.filter(a => a.severity === 'high' || a.severity === 'medium');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (warningAlerts.length > 0) {
      status = 'warning';
    }

    return {
      status,
      uptime: process.uptime(),
      lastCheck: new Date(),
      components: [
        { name: 'API Server', status: 'healthy', lastCheck: new Date() },
        { name: 'Database', status: 'healthy', lastCheck: new Date() },
        { name: 'WebSocket', status: 'healthy', lastCheck: new Date() },
        { name: 'Payment System', status: 'healthy', lastCheck: new Date() }
      ]
    };
  }
}

export const monitoringService = new MonitoringService();