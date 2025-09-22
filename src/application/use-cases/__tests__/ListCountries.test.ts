import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListCountries } from '../ListCountries.js';
import type { CountryRepository } from '../../../domain/ports/CountryRepository.js';
import type { Country, CountryListResult } from '../../../domain/entities/Country.js';
import { mockCountry, mockCountryUSA, mockCountryPortugal, mockCountryListResult } from '../../../__tests__/fixtures/countryFixtures.js';

describe('ListCountries Use Case', () => {
  let mockRepository: CountryRepository;
  let listCountries: ListCountries;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findByCode: vi.fn(),
    };
    listCountries = new ListCountries(mockRepository);
  });

  describe('Successful Execution', () => {
    it('should list countries successfully with default parameters', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const result = await listCountries.execute({});

      expect(result).toEqual(mockCountryListResult);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined
      );
    });

    it('should list countries with pagination', async () => {
      const paginationResult: CountryListResult = {
        items: [mockCountry],
        total: 1,
        page: 1,
        perPage: 10,
      };
      vi.mocked(mockRepository.findAll).mockResolvedValue(paginationResult);

      const result = await listCountries.execute({
        pagination: { page: 1, perPage: 10 },
      });

      expect(result).toEqual(paginationResult);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        undefined,
        { page: 1, perPage: 10 },
        undefined
      );
    });

    it('should list countries with filters', async () => {
      const filterResult: CountryListResult = {
        items: [mockCountry],
        total: 1,
        page: 1,
        perPage: 20,
      };
      vi.mocked(mockRepository.findAll).mockResolvedValue(filterResult);

      const result = await listCountries.execute({
        filter: { region: 'Americas' },
      });

      expect(result).toEqual(filterResult);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { region: 'Americas' },
        undefined,
        undefined
      );
    });

    it('should list countries with sorting', async () => {
      const sortedResult: CountryListResult = {
        items: [mockCountryPortugal, mockCountry, mockCountryUSA],
        total: 3,
        page: 1,
        perPage: 20,
      };
      vi.mocked(mockRepository.findAll).mockResolvedValue(sortedResult);

      const result = await listCountries.execute({
        sortBy: 'population',
      });

      expect(result).toEqual(sortedResult);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        'population'
      );
    });

    it('should list countries with all parameters', async () => {
      const fullResult: CountryListResult = {
        items: [mockCountry],
        total: 1,
        page: 1,
        perPage: 5,
      };
      vi.mocked(mockRepository.findAll).mockResolvedValue(fullResult);

      const result = await listCountries.execute({
        filter: { region: 'Americas', language: 'Portuguese' },
        pagination: { page: 1, perPage: 5 },
        sortBy: 'name',
      });

      expect(result).toEqual(fullResult);
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { region: 'Americas', language: 'Portuguese' },
        { page: 1, perPage: 5 },
        'name'
      );
    });
  });

  describe('Validation', () => {
    it('should validate page number is greater than 0', async () => {
      await expect(
        listCountries.execute({
          pagination: { page: 0, perPage: 20 },
        })
      ).rejects.toThrow('Página deve ser maior que 0');
    });

    it('should validate page number is not negative', async () => {
      await expect(
        listCountries.execute({
          pagination: { page: -1, perPage: 20 },
        })
      ).rejects.toThrow('Página deve ser maior que 0');
    });

    it('should validate perPage is greater than 0', async () => {
      await expect(
        listCountries.execute({
          pagination: { page: 1, perPage: 0 },
        })
      ).rejects.toThrow('Itens por página deve estar entre 1 e 100');
    });

    it('should validate perPage is not negative', async () => {
      await expect(
        listCountries.execute({
          pagination: { page: 1, perPage: -1 },
        })
      ).rejects.toThrow('Itens por página deve estar entre 1 e 100');
    });

    it('should validate perPage is not greater than 100', async () => {
      await expect(
        listCountries.execute({
          pagination: { page: 1, perPage: 101 },
        })
      ).rejects.toThrow('Itens por página deve estar entre 1 e 100');
    });

    it('should accept valid pagination parameters', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      await expect(
        listCountries.execute({
          pagination: { page: 1, perPage: 1 },
        })
      ).resolves.toBeDefined();

      await expect(
        listCountries.execute({
          pagination: { page: 1, perPage: 100 },
        })
      ).resolves.toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate repository errors', async () => {
      const error = new Error('Repository error');
      vi.mocked(mockRepository.findAll).mockRejectedValue(error);

      await expect(listCountries.execute({})).rejects.toThrow('Repository error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      vi.mocked(mockRepository.findAll).mockRejectedValue(networkError);

      await expect(listCountries.execute({})).rejects.toThrow('Network timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results', async () => {
      const emptyResult: CountryListResult = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
      };
      vi.mocked(mockRepository.findAll).mockResolvedValue(emptyResult);

      const result = await listCountries.execute({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle large page numbers', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const result = await listCountries.execute({
        pagination: { page: 999, perPage: 20 },
      });

      expect(result).toBeDefined();
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        undefined,
        { page: 999, perPage: 20 },
        undefined
      );
    });

    it('should handle complex filters', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const result = await listCountries.execute({
        filter: {
          name: 'Brazil',
          region: 'Americas',
          subregion: 'South America',
          currency: 'BRL',
          language: 'Portuguese',
        },
      });

      expect(result).toBeDefined();
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        {
          name: 'Brazil',
          region: 'Americas',
          subregion: 'South America',
          currency: 'BRL',
          language: 'Portuguese',
        },
        undefined,
        undefined
      );
    });
  });

  describe('Interface Compliance', () => {
    it('should implement the correct interface', () => {
      expect(listCountries).toBeInstanceOf(ListCountries);
      expect(typeof listCountries.execute).toBe('function');
    });

    it('should accept valid request parameters', async () => {
      vi.mocked(mockRepository.findAll).mockResolvedValue(mockCountryListResult);

      const validRequests = [
        {},
        { filter: { region: 'Europe' } },
        { pagination: { page: 1, perPage: 10 } },
        { sortBy: 'name' as const },
        {
          filter: { region: 'Americas' },
          pagination: { page: 1, perPage: 5 },
          sortBy: 'population' as const,
        },
      ];

      for (const request of validRequests) {
        await expect(listCountries.execute(request)).resolves.toBeDefined();
      }
    });
  });
});