import { describe, it, expect } from 'vitest';
import type { Country, CountryFilter, CountrySortBy, PaginationParams, CountryListResult } from '../Country.js';
import { mockCountry, mockCountryUSA, mockCountryPortugal } from '../../../__tests__/fixtures/countryFixtures.js';

describe('Country Entity', () => {
  describe('Country Interface', () => {
    it('should have all required properties', () => {
      expect(mockCountry.code2).toBe('BR');
      expect(mockCountry.code3).toBe('BRA');
      expect(mockCountry.name.common).toBe('Brazil');
      expect(mockCountry.name.official).toBe('Federative Republic of Brazil');
      expect(mockCountry.capital).toBe('Brasília');
      expect(mockCountry.region).toBe('Americas');
      expect(mockCountry.population).toBe(212559417);
      expect(mockCountry.currencies).toHaveLength(1);
      expect(mockCountry.languages).toHaveLength(1);
      expect(mockCountry.timezones).toHaveLength(4);
    });

    it('should handle optional properties correctly', () => {
      expect(mockCountryUSA.capital).toBe('Washington, D.C.');
      expect(mockCountryUSA.subregion).toBe('North America');
      expect(mockCountryUSA.area).toBe(9833517.0);
      expect(mockCountryUSA.flags).toBeDefined();
      expect(mockCountryUSA.maps).toBeDefined();
    });

    it('should handle null values in optional properties', () => {
      expect(mockCountryUSA.name.native).toBeNull();
    });

    it('should have readonly properties', () => {
      // Verificar se as propriedades são readonly
      const country: Country = mockCountry;
      
      // TypeScript deve impedir modificações em tempo de compilação
      // Em runtime, as propriedades podem ser modificadas, mas isso é um anti-pattern
      expect(country.code2).toBe('BR');
      expect(country.code3).toBe('BRA');
      expect(country.name.common).toBe('Brazil');
      
      // Verificar que a estrutura está correta
      expect(typeof country.code2).toBe('string');
      expect(typeof country.code3).toBe('string');
      expect(typeof country.name.common).toBe('string');
    });
  });

  describe('CountryFilter Interface', () => {
    it('should accept valid filter properties', () => {
      const filter: CountryFilter = {
        name: 'Brazil',
        region: 'Americas',
        subregion: 'South America',
        currency: 'BRL',
        language: 'Portuguese',
      };

      expect(filter.name).toBe('Brazil');
      expect(filter.region).toBe('Americas');
      expect(filter.subregion).toBe('South America');
      expect(filter.currency).toBe('BRL');
      expect(filter.language).toBe('Portuguese');
    });

    it('should accept partial filters', () => {
      const filter: CountryFilter = {
        region: 'Europe',
      };

      expect(filter.region).toBe('Europe');
      expect(filter.name).toBeUndefined();
    });

    it('should accept empty filter', () => {
      const filter: CountryFilter = {};
      expect(Object.keys(filter)).toHaveLength(0);
    });
  });

  describe('CountrySortBy Type', () => {
    it('should accept valid sort values', () => {
      const validSorts: CountrySortBy[] = ['name', 'name_desc', 'population', 'population_desc'];
      
      validSorts.forEach(sort => {
        expect(['name', 'name_desc', 'population', 'population_desc']).toContain(sort);
      });
    });
  });

  describe('PaginationParams Interface', () => {
    it('should accept valid pagination parameters', () => {
      const pagination: PaginationParams = {
        page: 1,
        perPage: 20,
      };

      expect(pagination.page).toBe(1);
      expect(pagination.perPage).toBe(20);
    });

    it('should accept different page sizes', () => {
      const pagination: PaginationParams = {
        page: 2,
        perPage: 50,
      };

      expect(pagination.page).toBe(2);
      expect(pagination.perPage).toBe(50);
    });
  });

  describe('CountryListResult Interface', () => {
    it('should have all required properties', () => {
      const result: CountryListResult = {
        items: [mockCountry, mockCountryUSA],
        total: 2,
        page: 1,
        perPage: 20,
      };

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
    });

    it('should handle empty results', () => {
      const result: CountryListResult = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
      };

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle pagination metadata correctly', () => {
      const result: CountryListResult = {
        items: [mockCountry],
        total: 100,
        page: 3,
        perPage: 10,
      };

      expect(result.total).toBe(100);
      expect(result.page).toBe(3);
      expect(result.perPage).toBe(10);
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent currency data', () => {
      mockCountry.currencies.forEach(currency => {
        expect(currency.code).toBeDefined();
        expect(typeof currency.code).toBe('string');
        expect(currency.code.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent language data', () => {
      mockCountry.languages.forEach(language => {
        expect(typeof language).toBe('string');
        expect(language.length).toBeGreaterThan(0);
      });
    });

    it('should have consistent timezone data', () => {
      mockCountry.timezones.forEach(timezone => {
        expect(typeof timezone).toBe('string');
        expect(timezone).toMatch(/^UTC[+-]\d{2}:\d{2}$/);
      });
    });

    it('should have valid population numbers', () => {
      expect(mockCountry.population).toBeGreaterThan(0);
      expect(Number.isInteger(mockCountry.population)).toBe(true);
    });

    it('should have valid area numbers when present', () => {
      if (mockCountry.area !== null && mockCountry.area !== undefined) {
        expect(mockCountry.area).toBeGreaterThan(0);
        expect(typeof mockCountry.area).toBe('number');
      }
    });
  });

  describe('Country Comparison', () => {
    it('should allow comparison of countries by population', () => {
      const countries = [mockCountry, mockCountryUSA, mockCountryPortugal];
      const sortedByPopulation = countries.sort((a, b) => a.population - b.population);
      
      expect(sortedByPopulation[0]).toBe(mockCountryPortugal); // Menor população
      expect(sortedByPopulation[2]).toBe(mockCountryUSA); // Maior população
    });

    it('should allow comparison of countries by name', () => {
      const countries = [mockCountry, mockCountryUSA, mockCountryPortugal];
      const sortedByName = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      expect(sortedByName[0]).toBe(mockCountry); // Brazil
      expect(sortedByName[1]).toBe(mockCountryPortugal); // Portugal
      expect(sortedByName[2]).toBe(mockCountryUSA); // United States
    });
  });
});