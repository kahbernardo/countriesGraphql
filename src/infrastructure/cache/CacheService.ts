import NodeCache from 'node-cache';

export interface CacheService {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlSeconds?: number): boolean;
  del(key: string): number;
  flush(): void;
  keys(): string[];
}

export class NodeCacheService implements CacheService {
  private readonly cache: NodeCache;

  constructor(defaultTTL = 300) { // 5 minutos por padrão
    this.cache = new NodeCache({
      stdTTL: defaultTTL,
      checkperiod: 60, // Verificar expiração a cada minuto
      useClones: false, // Para melhor performance
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): boolean {
    if (ttlSeconds) {
      return this.cache.set(key, value, ttlSeconds);
    }
    return this.cache.set(key, value);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }

  keys(): string[] {
    return this.cache.keys();
  }

  getStats() {
    return this.cache.getStats();
  }
}
