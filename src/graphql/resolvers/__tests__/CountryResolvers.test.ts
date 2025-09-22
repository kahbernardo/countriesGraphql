import { describe, it, expect, beforeEach, vi } from 'vitest';
import { countryResolvers } from '../CountryResolvers.js';
import type { ListCountries } from '../../../application/use-cases/ListCountries.js';
import type { GetCountryByCode } from '../../../application/use-cases/GetCountryByCode.js';
import { mockCountry, mockCountryUSA, mockCountryListResult } from '../../../__tests__/fixtures/countryFixtures.js';

describe('CountryResolvers', () => {
  let mockListCountries: ListCountries;
  let mockGetCountryByCode: GetCountryByCode;
  let mockContext: any;

  beforeEach(() => {
    mockListCountries = {
      execute: vi.fn(),
    } as any;

    mockGetCountryByCode = {
      execute: vi.fn(),
    } as any;

    mockContext = {
      listCountries: mockListCountries,
      getCountryByCode: mockGetCountryByCode,
    };
  });

  describe('Query.paises', () => {
    it('should resolve paises query successfully', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);

      const result = await countryResolvers.Query.paises(
        null,
        {
          pagina: 1,
          porPagina: 20,
          ordenacao: 'nome',
        },
        mockContext
      );

      expect(result).toBeDefined();
      expect(result.total).toBe(3);
      expect(result.pagina).toBe(1);
      expect(result.porPagina).toBe(20);
      expect(result.itens).toHaveLength(3);
      expect(mockListCountries.execute).toHaveBeenCalledWith({
        filter: undefined,
        pagination: { page: 1, perPage: 20 },
        sortBy: 'nome',
      });
    });

    it('should resolve paises query with filters', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);

      const result = await countryResolvers.Query.paises(
        null,
        {
          filtro: {
            nome: 'Brazil',
            regiao: 'Americas',
            lingua: 'por',
          },
          pagina: 1,
          porPagina: 10,
          ordenacao: 'populacao_desc',
        },
        mockContext
      );

      expect(result).toBeDefined();
      expect(mockListCountries.execute).toHaveBeenCalledWith({
        filter: {
          name: 'Brazil',
          region: 'Americas',
          language: 'por',
        },
        pagination: { page: 1, perPage: 10 },
        sortBy: 'populacao_desc',
      });
    });

    it('should handle empty filters', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);

      const result = await countryResolvers.Query.paises(
        null,
        {
          filtro: {},
          pagina: 1,
          porPagina: 20,
          ordenacao: 'nome',
        },
        mockContext
      );

      expect(result).toBeDefined();
      expect(mockListCountries.execute).toHaveBeenCalledWith({
        filter: {
          name: undefined,
          region: undefined,
          subregion: undefined,
          currency: undefined,
          language: undefined,
        },
        pagination: { page: 1, perPage: 20 },
        sortBy: 'nome',
      });
    });

    it('should use default values when parameters are not provided', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);

      const result = await countryResolvers.Query.paises(
        null,
        {},
        mockContext
      );

      expect(result).toBeDefined();
      expect(mockListCountries.execute).toHaveBeenCalledWith({
        filter: undefined,
        pagination: { page: 1, perPage: 20 },
        sortBy: 'nome',
      });
    });

    it('should handle use case errors', async () => {
      const error = new Error('Use case error');
      vi.mocked(mockListCountries.execute).mockRejectedValue(error);

      await expect(
        countryResolvers.Query.paises(
          null,
          { pagina: 1, porPagina: 20, ordenacao: 'nome' },
          mockContext
        )
      ).rejects.toThrow('Use case error');
    });

    it('should validate input parameters', async () => {
      await expect(
        countryResolvers.Query.paises(
          null,
          { pagina: 0, porPagina: 20, ordenacao: 'nome' },
          mockContext
        )
      ).rejects.toThrow();
    });

    it('should handle different sort orders', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);

      const sortOrders = ['nome', 'nome_desc', 'populacao', 'populacao_desc'];

      for (const sortOrder of sortOrders) {
        await countryResolvers.Query.paises(
          null,
          { pagina: 1, porPagina: 20, ordenacao: sortOrder },
          mockContext
        );

        expect(mockListCountries.execute).toHaveBeenCalledWith({
          filter: undefined,
          pagination: { page: 1, perPage: 20 },
          sortBy: sortOrder,
        });
      }
    });
  });

  describe('Query.pais', () => {
    it('should resolve pais query successfully', async () => {
      vi.mocked(mockGetCountryByCode.execute).mockResolvedValue(mockCountry);

      const result = await countryResolvers.Query.pais(
        null,
        { codigo: 'BR' },
        mockContext
      );

      expect(result).toBeDefined();
      expect(result?.codigo2).toBe('BR');
      expect(result?.codigo3).toBe('BRA');
      expect(result?.nome.comum).toBe('Brazil');
      expect(mockGetCountryByCode.execute).toHaveBeenCalledWith({
        code: 'BR',
      });
    });

    it('should return null when country not found', async () => {
      vi.mocked(mockGetCountryByCode.execute).mockResolvedValue(null);

      const result = await countryResolvers.Query.pais(
        null,
        { codigo: 'XX' },
        mockContext
      );

      expect(result).toBeNull();
      expect(mockGetCountryByCode.execute).toHaveBeenCalledWith({
        code: 'XX',
      });
    });

    it('should handle different country codes', async () => {
      vi.mocked(mockGetCountryByCode.execute).mockResolvedValue(mockCountryUSA);

      const codes = ['US', 'USA', 'us', 'UsA'];

      for (const code of codes) {
        await countryResolvers.Query.pais(
          null,
          { codigo: code },
          mockContext
        );

        expect(mockGetCountryByCode.execute).toHaveBeenCalledWith({
          code,
        });
      }
    });

    it('should handle use case errors', async () => {
      const error = new Error('Use case error');
      vi.mocked(mockGetCountryByCode.execute).mockRejectedValue(error);

      await expect(
        countryResolvers.Query.pais(
          null,
          { codigo: 'BR' },
          mockContext
        )
      ).rejects.toThrow('Use case error');
    });

    it('should validate input parameters', async () => {
      await expect(
        countryResolvers.Query.pais(
          null,
          { codigo: '' },
          mockContext
        )
      ).rejects.toThrow();
    });

    it('should handle whitespace in codes', async () => {
      vi.mocked(mockGetCountryByCode.execute).mockResolvedValue(mockCountry);

      const result = await countryResolvers.Query.pais(
        null,
        { codigo: '  BR  ' },
        mockContext
      );

      expect(result).toBeDefined();
      expect(mockGetCountryByCode.execute).toHaveBeenCalledWith({
        code: '  BR  ',
      });
    });
  });

  describe('Input Validation', () => {
    it('should validate paises query parameters', async () => {
      const invalidInputs = [
        { pagina: -1, porPagina: 20, ordenacao: 'nome' },
        { pagina: 1, porPagina: 0, ordenacao: 'nome' },
        { pagina: 1, porPagina: 101, ordenacao: 'nome' },
        { pagina: 1, porPagina: 20, ordenacao: 'invalid_sort' },
      ];

      for (const input of invalidInputs) {
        await expect(
          countryResolvers.Query.paises(null, input, mockContext)
        ).rejects.toThrow();
      }
    });

    it('should validate pais query parameters', async () => {
      const invalidInputs = [
        { codigo: '' },
        { codigo: null },
        { codigo: undefined },
      ];

      for (const input of invalidInputs) {
        await expect(
          countryResolvers.Query.pais(null, input, mockContext)
        ).rejects.toThrow();
      }
    });

    it('should accept valid input parameters', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);
      vi.mocked(mockGetCountryByCode.execute).mockResolvedValue(mockCountry);

      const validPaisesInputs = [
        { pagina: 1, porPagina: 1, ordenacao: 'nome' },
        { pagina: 1, porPagina: 100, ordenacao: 'populacao_desc' },
        { pagina: 999, porPagina: 50, ordenacao: 'nome_desc' },
      ];

      for (const input of validPaisesInputs) {
        await expect(
          countryResolvers.Query.paises(null, input, mockContext)
        ).resolves.toBeDefined();
      }

      const validPaisInputs = [
        { codigo: 'BR' },
        { codigo: 'USA' },
        { codigo: 'pt' },
        { codigo: 'UsA' },
      ];

      for (const input of validPaisInputs) {
        await expect(
          countryResolvers.Query.pais(null, input, mockContext)
        ).resolves.toBeDefined();
      }
    });
  });

  describe('Context Handling', () => {
    it('should use context dependencies correctly', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);
      vi.mocked(mockGetCountryByCode.execute).mockResolvedValue(mockCountry);

      await countryResolvers.Query.paises(null, {}, mockContext);
      await countryResolvers.Query.pais(null, { codigo: 'BR' }, mockContext);

      expect(mockListCountries.execute).toHaveBeenCalled();
      expect(mockGetCountryByCode.execute).toHaveBeenCalled();
    });

    it('should handle missing context dependencies', async () => {
      const incompleteContext = {
        listCountries: mockListCountries,
        // getCountryByCode missing
      };

      await expect(
        countryResolvers.Query.pais(null, { codigo: 'BR' }, incompleteContext)
      ).rejects.toThrow();
    });
  });

  describe('Return Types', () => {
    it('should return correct GraphQL types for paises', async () => {
      vi.mocked(mockListCountries.execute).mockResolvedValue(mockCountryListResult);

      const result = await countryResolvers.Query.paises(null, {}, mockContext);

      expect(result).toHaveProperty('itens');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pagina');
      expect(result).toHaveProperty('porPagina');
      expect(Array.isArray(result.itens)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.pagina).toBe('number');
      expect(typeof result.porPagina).toBe('number');
    });

    it('should return correct GraphQL types for pais', async () => {
      vi.mocked(mockGetCountryByCode.execute).mockResolvedValue(mockCountry);

      const result = await countryResolvers.Query.pais(null, { codigo: 'BR' }, mockContext);

      expect(result).toHaveProperty('codigo2');
      expect(result).toHaveProperty('codigo3');
      expect(result).toHaveProperty('nome');
      expect(result).toHaveProperty('regiao');
      expect(result).toHaveProperty('populacao');
      expect(result?.nome).toHaveProperty('comum');
      expect(result?.nome).toHaveProperty('oficial');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      vi.mocked(mockListCountries.execute).mockRejectedValue(networkError);

      await expect(
        countryResolvers.Query.paises(null, {}, mockContext)
      ).rejects.toThrow('Network timeout');
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      vi.mocked(mockGetCountryByCode.execute).mockRejectedValue(validationError);

      await expect(
        countryResolvers.Query.pais(null, { codigo: 'BR' }, mockContext)
      ).rejects.toThrow('Validation failed');
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      vi.mocked(mockListCountries.execute).mockRejectedValue(unexpectedError);

      await expect(
        countryResolvers.Query.paises(null, {}, mockContext)
      ).rejects.toThrow('Unexpected error');
    });
  });
});
