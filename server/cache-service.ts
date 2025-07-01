// Advanced Cache & Performance Optimization Service
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  enableGzip: boolean;
  enableEtag: boolean;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
  size: number;
  compressed?: boolean;
}

export interface CacheStats {
  totalKeys: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

export class AdvancedCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0
  };
  
  private readonly defaultConfig: CacheConfig = {
    ttl: 300, // 5 minutes
    maxSize: 1000, // 1000 entries max
    enableGzip: true,
    enableEtag: true
  };

  constructor(private config: Partial<CacheConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
    this.startCleanupTask();
  }

  // Armazenar item no cache
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const actualTtl = ttl || this.config.ttl || 300;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + actualTtl * 1000);
      
      // Calcular tamanho aproximado
      const size = this.calculateSize(value);
      
      // Verificar se precisa fazer eviction
      if (this.cache.size >= (this.config.maxSize || 1000)) {
        this.evictOldest();
      }

      const entry: CacheEntry<T> = {
        key,
        value,
        createdAt: now,
        expiresAt,
        hits: 0,
        size,
        compressed: this.config.enableGzip && size > 1024
      };

      this.cache.set(key, entry);
      this.stats.sets++;
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Recuperar item do cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar se expirou
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Incrementar hits
    entry.hits++;
    this.stats.hits++;
    
    return entry.value as T;
  }

  // Verificar se chave existe
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Remover item do cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0
    };
  }

  // Cache com função de loader
  async getOrSet<T>(
    key: string, 
    loader: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Tentar obter do cache primeiro
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Se não encontrou, executar loader
    try {
      const value = await loader();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      console.error('Cache loader error:', error);
      throw error;
    }
  }

  // Invalidar por padrão
  invalidatePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  // Estatísticas do cache
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      totalKeys: this.cache.size,
      totalSize,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0,
      evictions: this.stats.evictions,
      oldestEntry: entries.length > 0 ? 
        new Date(Math.min(...entries.map(e => e.createdAt.getTime()))) : undefined,
      newestEntry: entries.length > 0 ? 
        new Date(Math.max(...entries.map(e => e.createdAt.getTime()))) : undefined
    };
  }

  // Obter entradas por popularidade
  getPopularEntries(limit: number = 10): Array<{key: string, hits: number, size: number}> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        hits: entry.hits,
        size: entry.size
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  // Método para cache de queries de banco
  async cacheQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 600 // 10 minutos para queries
  ): Promise<T> {
    return this.getOrSet(`query:${queryKey}`, queryFn, ttl);
  }

  // Cache específico para API responses
  async cacheApiResponse<T>(
    endpoint: string,
    params: Record<string, any>,
    responseFn: () => Promise<T>,
    ttl: number = 300 // 5 minutos para APIs
  ): Promise<T> {
    const key = `api:${endpoint}:${this.hashParams(params)}`;
    return this.getOrSet(key, responseFn, ttl);
  }

  // Cache para dados de usuário
  async cacheUserData<T>(
    userId: number,
    dataType: string,
    dataFn: () => Promise<T>,
    ttl: number = 1800 // 30 minutos para dados de usuário
  ): Promise<T> {
    const key = `user:${userId}:${dataType}`;
    return this.getOrSet(key, dataFn, ttl);
  }

  // Invalidar cache de usuário
  invalidateUserCache(userId: number): number {
    return this.invalidatePattern(`^user:${userId}:`);
  }

  // Invalidar cache de API
  invalidateApiCache(endpoint: string): number {
    return this.invalidatePattern(`^api:${endpoint}:`);
  }

  // Métodos privados
  private evictOldest(): void {
    let oldest: { key: string; createdAt: Date } | null = null;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.createdAt < oldest.createdAt) {
        oldest = { key, createdAt: entry.createdAt };
      }
    }
    
    if (oldest) {
      this.cache.delete(oldest.key);
      this.stats.evictions++;
    }
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 1024; // Tamanho padrão se não conseguir serializar
    }
  }

  private hashParams(params: Record<string, any>): string {
    const str = JSON.stringify(params, Object.keys(params).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  private startCleanupTask(): void {
    // Limpeza a cada 5 minutos
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = new Date();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Método para backup do cache
  exportCache(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        value: entry.value,
        createdAt: entry.createdAt.toISOString(),
        expiresAt: entry.expiresAt.toISOString(),
        hits: entry.hits,
        size: entry.size
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Método para restaurar cache
  importCache(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      this.clear();
      
      for (const entry of importData.entries) {
        const cacheEntry: CacheEntry = {
          key: entry.key,
          value: entry.value,
          createdAt: new Date(entry.createdAt),
          expiresAt: new Date(entry.expiresAt),
          hits: entry.hits,
          size: entry.size
        };
        
        // Só importar se não expirou
        if (cacheEntry.expiresAt > new Date()) {
          this.cache.set(entry.key, cacheEntry);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Cache import error:', error);
      return false;
    }
  }
}

// Instâncias específicas para diferentes tipos de cache
export const queryCache = new AdvancedCacheService({
  ttl: 600, // 10 minutos
  maxSize: 500,
  enableGzip: true
});

export const apiCache = new AdvancedCacheService({
  ttl: 300, // 5 minutos
  maxSize: 1000,
  enableGzip: true
});

export const userCache = new AdvancedCacheService({
  ttl: 1800, // 30 minutos
  maxSize: 200,
  enableGzip: false
});

export const staticCache = new AdvancedCacheService({
  ttl: 3600, // 1 hora
  maxSize: 100,
  enableGzip: true
});

// Cache principal para uso geral
export const cacheService = new AdvancedCacheService({
  ttl: 300,
  maxSize: 1000,
  enableGzip: true,
  enableEtag: true
});

console.log('🚀 Advanced Cache Service initialized with multiple cache layers');