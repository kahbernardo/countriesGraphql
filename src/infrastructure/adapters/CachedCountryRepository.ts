import type { Country, CountryFilter, CountryListResult, PaginationParams, CountrySortBy } from '../../domain/entities/Country.js';
import type { CountryRepository } from '../../domain/ports/CountryRepository.js';
import type { CacheService } from '../cache/CacheService.js';

export class CachedCountryRepository implements CountryRepository {
  constructor(
    private readonly repository: CountryRepository,
    private readonly cache: CacheService,
    private readonly defaultTTL = 300 // 5 minutos
  ) {}

  async findAll(
    filter?: CountryFilter,
    pagination?: PaginationParams,
    sortBy?: CountrySortBy
  ): Promise<CountryListResult> {
    const cacheKey = this.buildCacheKey('all', { filter, pagination, sortBy });
    
    try {
      const cached = this.cache.get<CountryListResult>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      // Cache error - continue without cache
    }

    const result = await this.repository.findAll(filter, pagination, sortBy);
    
    try {
      this.cache.set(cacheKey, result, this.defaultTTL);
    } catch (error) {
      // Cache error - continue without caching
    }
    
    return result;
  }

  async findByCode(code: string): Promise<Country | null> {
    const cacheKey = this.buildCacheKey('code', { code });
    
    try {
      const cached = this.cache.get<Country | null>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    } catch (error) {
      // Cache error - continue without cache
    }

    const result = await this.repository.findByCode(code);
    
    try {
      this.cache.set(cacheKey, result, this.defaultTTL);
    } catch (error) {
      // Cache error - continue without caching
    }
    
    return result;
  }

  private buildCacheKey(operation: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `country:${operation}:${sortedParams}`;
  }
}
