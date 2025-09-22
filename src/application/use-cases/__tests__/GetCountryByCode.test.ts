import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetCountryByCode } from '../GetCountryByCode.js';
import type { CountryRepository } from '../../../domain/ports/CountryRepository.js';
import { mockCountry, mockCountryUSA } from '../../../__tests__/fixtures/countryFixtures.js';

describe('GetCountryByCode Use Case', () => {
  let mockRepository: CountryRepository;
  let getCountryByCode: GetCountryByCode;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findByCode: vi.fn(),
    };
    getCountryByCode = new GetCountryByCode(mockRepository);
  });

  describe('Successful Execution', () => {
    it('should get country by 2-letter code', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const result = await getCountryByCode.execute({ code: 'BR' });

      expect(result).toEqual(mockCountry);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('BR');
    });

    it('should get country by 3-letter code', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountryUSA);

      const result = await getCountryByCode.execute({ code: 'USA' });

      expect(result).toEqual(mockCountryUSA);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('USA');
    });

    it('should handle case insensitive codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const result = await getCountryByCode.execute({ code: 'br' });

      expect(result).toEqual(mockCountry);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('BR');
    });

    it('should handle mixed case codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountryUSA);

      const result = await getCountryByCode.execute({ code: 'UsA' });

      expect(result).toEqual(mockCountryUSA);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('USA');
    });

    it('should return null when country not found', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(null);

      const result = await getCountryByCode.execute({ code: 'XX' });

      expect(result).toBeNull();
      expect(mockRepository.findByCode).toHaveBeenCalledWith('XX');
    });
  });

  describe('Validation', () => {
    it('should reject empty code', async () => {
      await expect(
        getCountryByCode.execute({ code: '' })
      ).rejects.toThrow('Código do país é obrigatório');
    });

    it('should reject whitespace-only code', async () => {
      await expect(
        getCountryByCode.execute({ code: '   ' })
      ).rejects.toThrow('Código do país é obrigatório');
    });

    it('should reject null code', async () => {
      await expect(
        getCountryByCode.execute({ code: null as any })
      ).rejects.toThrow('Código do país é obrigatório');
    });

    it('should reject undefined code', async () => {
      await expect(
        getCountryByCode.execute({ code: undefined as any })
      ).rejects.toThrow('Código do país é obrigatório');
    });

    it('should accept valid 2-letter codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const validCodes = ['BR', 'US', 'PT', 'FR', 'DE'];
      
      for (const code of validCodes) {
        await expect(
          getCountryByCode.execute({ code })
        ).resolves.toBeDefined();
      }
    });

    it('should accept valid 3-letter codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const validCodes = ['BRA', 'USA', 'PRT', 'FRA', 'DEU'];
      
      for (const code of validCodes) {
        await expect(
          getCountryByCode.execute({ code })
        ).resolves.toBeDefined();
      }
    });

    it('should trim whitespace from codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const result = await getCountryByCode.execute({ code: '  BR  ' });

      expect(result).toEqual(mockCountry);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('BR');
    });
  });

  describe('Error Handling', () => {
    it('should propagate repository errors', async () => {
      const error = new Error('Repository error');
      vi.mocked(mockRepository.findByCode).mockRejectedValue(error);

      await expect(
        getCountryByCode.execute({ code: 'BR' })
      ).rejects.toThrow('Repository error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      vi.mocked(mockRepository.findByCode).mockRejectedValue(networkError);

      await expect(
        getCountryByCode.execute({ code: 'BR' })
      ).rejects.toThrow('Network timeout');
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(mockRepository.findByCode).mockRejectedValue(dbError);

      await expect(
        getCountryByCode.execute({ code: 'BR' })
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(null);

      const result = await getCountryByCode.execute({ 
        code: 'VERYLONGCODE' 
      });

      expect(result).toBeNull();
      expect(mockRepository.findByCode).toHaveBeenCalledWith('VERYLONGCODE');
    });

    it('should handle special characters in codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(null);

      const result = await getCountryByCode.execute({ 
        code: 'BR-1' 
      });

      expect(result).toBeNull();
      expect(mockRepository.findByCode).toHaveBeenCalledWith('BR-1');
    });

    it('should handle numeric codes', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(null);

      const result = await getCountryByCode.execute({ 
        code: '123' 
      });

      expect(result).toBeNull();
      expect(mockRepository.findByCode).toHaveBeenCalledWith('123');
    });
  });

  describe('Interface Compliance', () => {
    it('should implement the correct interface', () => {
      expect(getCountryByCode).toBeInstanceOf(GetCountryByCode);
      expect(typeof getCountryByCode.execute).toBe('function');
    });

    it('should accept valid request parameters', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const validRequests = [
        { code: 'BR' },
        { code: 'USA' },
        { code: 'pt' },
        { code: 'UsA' },
      ];

      for (const request of validRequests) {
        await expect(getCountryByCode.execute(request)).resolves.toBeDefined();
      }
    });

    it('should return correct types', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      const result = await getCountryByCode.execute({ code: 'BR' });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('code2');
      expect(result).toHaveProperty('code3');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('region');
      expect(result).toHaveProperty('population');
    });

    it('should return null for non-existent countries', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(null);

      const result = await getCountryByCode.execute({ code: 'XX' });

      expect(result).toBeNull();
    });
  });

  describe('Repository Integration', () => {
    it('should call repository with correct parameters', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      await getCountryByCode.execute({ code: 'BR' });

      expect(mockRepository.findByCode).toHaveBeenCalledTimes(1);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('BR');
    });

    it('should not call other repository methods', async () => {
      vi.mocked(mockRepository.findByCode).mockResolvedValue(mockCountry);

      await getCountryByCode.execute({ code: 'BR' });

      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });
  });
});
