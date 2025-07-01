import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  loadTime?: number;
}

interface UsePerformanceResult {
  metrics: PerformanceMetrics;
  score: number;
  status: 'loading' | 'good' | 'needs-improvement' | 'poor';
}

export const usePerformanceMonitoring = (): UsePerformanceResult => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [loadTime, setLoadTime] = useState<number | undefined>();

  useEffect(() => {
    // Monitor page load time
    const startTime = performance.now();
    
    const measureLoadTime = () => {
      const endTime = performance.now();
      setLoadTime(endTime - startTime);
    };

    // Measure load time when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', measureLoadTime);
    } else {
      measureLoadTime();
    }

    // Monitor Core Web Vitals
    const initWebVitals = async () => {
      try {
        const { getCLS, getFID, getLCP, getTTFB } = await import('web-vitals');
        
        getCLS((metric) => {
          setMetrics(prev => ({ ...prev, cls: metric.value }));
        });
        
        getFID((metric) => {
          setMetrics(prev => ({ ...prev, fid: metric.value }));
        });
        
        getLCP((metric) => {
          setMetrics(prev => ({ ...prev, lcp: metric.value }));
        });
        
        getTTFB((metric) => {
          setMetrics(prev => ({ ...prev, ttfb: metric.value }));
        });
        
      } catch (error) {
        console.warn('Web Vitals not available:', error);
      }
    };

    initWebVitals();

    return () => {
      document.removeEventListener('DOMContentLoaded', measureLoadTime);
    };
  }, []);

  // Calculate performance score based on metrics
  const calculateScore = (): number => {
    const { lcp, fid, cls } = metrics;
    let score = 100;
    
    if (lcp !== undefined) {
      if (lcp > 4000) score -= 30;
      else if (lcp > 2500) score -= 15;
    }
    
    if (fid !== undefined) {
      if (fid > 300) score -= 25;
      else if (fid > 100) score -= 10;
    }
    
    if (cls !== undefined) {
      if (cls > 0.25) score -= 25;
      else if (cls > 0.1) score -= 10;
    }
    
    if (loadTime !== undefined) {
      if (loadTime > 3000) score -= 20;
      else if (loadTime > 1500) score -= 10;
    }
    
    return Math.max(0, score);
  };

  const getStatus = (score: number) => {
    if (score >= 90) return 'good';
    if (score >= 70) return 'needs-improvement';
    return 'poor';
  };

  const score = calculateScore();
  
  return {
    metrics: { ...metrics, loadTime },
    score,
    status: metrics.lcp === undefined && metrics.fid === undefined ? 'loading' : getStatus(score)
  };
};

// Hook for monitoring component performance
export const useComponentPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // 60fps = 16.67ms per frame
        console.warn(`Slow component render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
      
      // In production, send to monitoring service
      if (process.env.NODE_ENV === 'production' && renderTime > 50) {
        // TODO: Send to monitoring service
        console.log(`Performance metric: ${componentName} render time: ${renderTime}ms`);
      }
    };
  }, [componentName]);
};

// Hook for monitoring API calls performance
export const useApiPerformance = () => {
  const trackApiCall = (endpoint: string, startTime: number, success: boolean) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const metric = {
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString()
    };
    
    // Store in session for debugging
    const apiMetrics = JSON.parse(sessionStorage.getItem('apiMetrics') || '[]');
    apiMetrics.push(metric);
    
    // Keep only last 50 metrics
    if (apiMetrics.length > 50) {
      apiMetrics.shift();
    }
    
    sessionStorage.setItem('apiMetrics', JSON.stringify(apiMetrics));
    
    // Log slow APIs
    if (duration > 2000) {
      console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
    
    return metric;
  };
  
  return { trackApiCall };
};