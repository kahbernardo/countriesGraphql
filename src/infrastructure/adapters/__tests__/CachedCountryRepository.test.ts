import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedCountryRepository } from '../CachedCountryRepository.js';
import type { CountryRepository } from '../../../domain/ports/CountryRepository.js';
import type { Country, CountryFilter, CountryListResult, PaginationParams, CountrySortBy } from '../../../domain/entities/Country.js';
import { mockCountry, mockCountryUSA, mockCountryListResult } from '../../../__tests__/fixtures/countryFixtures.js';

describe('CachedCountryRepository', () => {
  let mockRepository: CountryRepository;
  let mockCache: any;
  let cachedRepository: CachedCountryRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findByCode: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      flush: vi.fn(),
      keys: vi.fn(),
    };

    cachedRepository = new CachedCountryRepository(mockRepository, mockCache, 300);
  });

  describe('Cache Miss - findAll', () => {
    it('should call repository when cache miss occurs', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const result = await cachedRepository.findAll();

      expect(mockCache.get).toHaveBeenCalled();
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('country:all:'),
        mockCountryListResult,
        300
      );
      expect(result).toEqual(mockCountryListResult);
    });

    it('should cache result with correct TTL', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      await cachedRepository.findAll();

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        mockCountryListResult,
        300
      );
    });

    it('should generate different cache keys for different parameters', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      await cachedRepository.findAll({ region: 'Americas' });
      await cachedRepository.findAll({ region: 'Europe' });

      expect(mockCache.set).toHaveBeenCalledTimes(2);
      const firstKey = vi.mocked(mockCache.set).mock.calls[0][0];
      const secondKey = vi.mocked(mockCache.set).mock.calls[1][0];
      expect(firstKey).not.toBe(secondKey);
    });
  });

  describe('Cache Hit - findAll', () => {
    it('should return cached result when cache hit occurs', async () => {
      vi.mocked(mockCache.get).mockReturnValue(mockCountryListResult);

      const result = await cachedRepository.findAll();

      expect(mockCache.get).toHaveBeenCalled();
      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
      expect(result).toEqual(mockCountryListResult);
    });

    it('should not call repository when cache hit occurs', async () => {
      vi.mocked(mockCache.get).mockReturnValue(mockCountryListResult);

      await cachedRepository.findAll();

      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('Cache Miss - findByCode', () => {
    it('should call repository when cache miss occurs', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const result = await cachedRepository.findByCode('BR');

      expect(mockCache.get).toHaveBeenCalled();
      expect(mockRepository.findByCode).toHaveBeenCalledWith('BR');
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('country:code:'),
        mockCountry,
        300
      );
      expect(result).toEqual(mockCountry);
    });

    it('should cache null results', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findByCode).mockResolvedValue(null);

      const result = await cachedRepository.findByCode('XX');

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        null,
        300
      );
      expect(result).toBeNull();
    });
  });

  describe('Cache Hit - findByCode', () => {
    it('should return cached result when cache hit occurs', async () => {
      vi.mocked(mockCache.get).mockReturnValue(mockCountry);

      const result = await cachedRepository.findByCode('BR');

      expect(mockCache.get).toHaveBeenCalled();
      expect(mockRepository.findByCode).not.toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
      expect(result).toEqual(mockCountry);
    });

    it('should return cached null result', async () => {
      vi.mocked(mockCache.get).mockReturnValue(null);

      const result = await cachedRepository.findByCode('XX');

      expect(mockRepository.findByCode).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same parameters', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const filter: CountryFilter = { region: 'Americas', language: 'Portuguese' };
      const pagination: PaginationParams = { page: 1, perPage: 10 };
      const sortBy: CountrySortBy = 'name';

      await cachedRepository.findAll(filter, pagination, sortBy);
      await cachedRepository.findAll(filter, pagination, sortBy);

      const firstKey = vi.mocked(mockCache.set).mock.calls[0][0];
      const secondKey = vi.mocked(mockCache.set).mock.calls[1][0];
      expect(firstKey).toBe(secondKey);
    });

    it('should generate different cache keys for different parameters', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      await cachedRepository.findAll({ region: 'Americas' });
      await cachedRepository.findAll({ region: 'Europe' });

      const firstKey = vi.mocked(mockCache.set).mock.calls[0][0];
      const secondKey = vi.mocked(mockCache.set).mock.calls[1][0];
      expect(firstKey).not.toBe(secondKey);
    });

    it('should include all parameters in cache key', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const filter: CountryFilter = { region: 'Americas' };
      const pagination: PaginationParams = { page: 2, perPage: 5 };
      const sortBy: CountrySortBy = 'population_desc';

      await cachedRepository.findAll(filter, pagination, sortBy);

      const cacheKey = vi.mocked(mockCache.set).mock.calls[0][0];
      expect(cacheKey).toContain('country:all:');
      expect(cacheKey).toContain('"region":"Americas"');
      expect(cacheKey).toContain('"page":2');
      expect(cacheKey).toContain('"perPage":5');
      expect(cacheKey).toContain('sortBy:"population_desc"');
    });
  });

  describe('Error Handling', () => {
    it('should propagate repository errors', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      const error = new Error('Repository error');
      vi.mocked(mockRepository.findAll).mockRejectedValue(error);

      await expect(cachedRepository.findAll()).rejects.toThrow('Repository error');
    });

    it('should not cache errors', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      const error = new Error('Repository error');
      vi.mocked(mockRepository.findAll).mockRejectedValue(error);

      try {
        await cachedRepository.findAll();
      } catch (e) {
        // Expected error
      }

      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should handle cache errors gracefully', async () => {
      vi.mocked(mockCache.get).mockImplementation(() => {
        throw new Error('Cache error');
      });
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      // Should still work even if cache fails
      const result = await cachedRepository.findAll();

      expect(result).toEqual(mockCountryListResult);
    });
  });

  describe('TTL Configuration', () => {
    it('should use custom TTL when provided', async () => {
      const customTTL = 600;
      const customCachedRepository = new CachedCountryRepository(mockRepository, mockCache, customTTL);
      
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      await customCachedRepository.findAll();

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        mockCountryListResult,
        customTTL
      );
    });

    it('should use default TTL when not provided', async () => {
      const defaultCachedRepository = new CachedCountryRepository(mockRepository, mockCache);
      
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      await defaultCachedRepository.findAll();

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        mockCountryListResult,
        300 // Default TTL
      );
    });
  });

  describe('Interface Compliance', () => {
    it('should implement CountryRepository interface', () => {
      expect(typeof cachedRepository.findAll).toBe('function');
      expect(typeof cachedRepository.findByCode).toBe('function');
    });

    it('should return correct types', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const findAllResult = await cachedRepository.findAll();
      const findByCodeResult = await cachedRepository.findByCode('BR');

      expect(findAllResult).toHaveProperty('items');
      expect(findAllResult).toHaveProperty('total');
      expect(findAllResult).toHaveProperty('page');
      expect(findAllResult).toHaveProperty('perPage');
      expect(findByCodeResult).toHaveProperty('code2');
      expect(findByCodeResult).toHaveProperty('code3');
    });
  });

  describe('Performance', () => {
    it('should avoid repository calls on cache hits', async () => {
      vi.mocked(mockCache.get).mockReturnValue(mockCountryListResult);

      // Multiple calls should only hit cache, not repository
      await cachedRepository.findAll();
      await cachedRepository.findAll();
      await cachedRepository.findAll();

      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockCache.get).toHaveBeenCalledTimes(3);
    });

    it('should call repository only once for same parameters', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const filter: CountryFilter = { region: 'Americas' };
      
      // First call should hit repository
      await cachedRepository.findAll(filter);
      
      // Second call should hit cache
      vi.mocked(mockCache.get).mockReturnValue(mockCountryListResult);
      await cachedRepository.findAll(filter);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
