import { describe, it, expect } from 'vitest';
import { CountryMapper } from '../CountryMapper.js';
import type { Country } from '../../../domain/entities/Country.js';
import { mockCountry, mockCountryUSA, mockCountryPortugal } from '../../../__tests__/fixtures/countryFixtures.js';

describe('CountryMapper', () => {
  describe('toGraphQL', () => {
    it('should map country to GraphQL format correctly', () => {
      const result = CountryMapper.toGraphQL(mockCountry);

      expect(result.codigo2).toBe('BR');
      expect(result.codigo3).toBe('BRA');
      expect(result.nome.comum).toBe('Brazil');
      expect(result.nome.oficial).toBe('Federative Republic of Brazil');
      expect(result.nome.nativo).toBe('Brasil');
      expect(result.capital).toBe('Brasília');
      expect(result.regiao).toBe('Americas');
      expect(result.subregiao).toBe('South America');
      expect(result.populacao).toBe(212559417);
      expect(result.area).toBe(8515767.049);
      expect(result.moedas).toHaveLength(1);
      expect(result.moedas[0].codigo).toBe('BRL');
      expect(result.moedas[0].nome).toBe('Brazilian Real');
      expect(result.moedas[0].simbolo).toBe('R$');
      expect(result.linguas).toEqual(['Portuguese']);
      expect(result.fusos).toEqual(['UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00']);
      expect(result.bandeiras?.svg).toBe('https://flagcdn.com/br.svg');
      expect(result.bandeiras?.png).toBe('https://flagcdn.com/w320/br.png');
      expect(result.mapas?.googleMaps).toBe('https://goo.gl/maps/waCKk21HeeqFzkNC9');
      expect(result.mapas?.openStreetMaps).toBe('https://www.openstreetmap.org/relation/59470');
    });

    it('should handle null values correctly', () => {
      const result = CountryMapper.toGraphQL(mockCountryUSA);

      expect(result.nome.nativo).toBeNull();
      expect(result.capital).toBe('Washington, D.C.');
      expect(result.subregiao).toBe('North America');
      expect(result.area).toBe(9833517.0);
      expect(result.bandeiras?.svg).toBe('https://flagcdn.com/us.svg');
      expect(result.bandeiras?.png).toBe('https://flagcdn.com/w320/us.png');
      expect(result.mapas?.googleMaps).toBe('https://goo.gl/maps/e8M246zq4A5zH6Xv6');
      expect(result.mapas?.openStreetMaps).toBe('https://www.openstreetmap.org/relation/148838');
    });

    it('should handle undefined optional properties', () => {
      const countryWithUndefined: Country = {
        code2: 'XX',
        code3: 'XXX',
        name: {
          common: 'Test Country',
          official: 'Test Country Official',
          native: undefined,
        },
        capital: undefined,
        region: 'Test Region',
        subregion: undefined,
        population: 1000000,
        area: undefined,
        currencies: [],
        languages: [],
        timezones: [],
        flags: undefined,
        maps: undefined,
      };

      const result = CountryMapper.toGraphQL(countryWithUndefined);

      expect(result.nome.nativo).toBeNull();
      expect(result.capital).toBeNull();
      expect(result.subregiao).toBeNull();
      expect(result.area).toBeNull();
      expect(result.bandeiras).toBeNull();
      expect(result.mapas).toBeNull();
    });

    it('should map multiple currencies correctly', () => {
      const countryWithMultipleCurrencies: Country = {
        ...mockCountry,
        currencies: [
          {
            code: 'BRL',
            name: 'Brazilian Real',
            symbol: 'R$',
          },
          {
            code: 'USD',
            name: 'US Dollar',
            symbol: '$',
          },
        ],
      };

      const result = CountryMapper.toGraphQL(countryWithMultipleCurrencies);

      expect(result.moedas).toHaveLength(2);
      expect(result.moedas[0].codigo).toBe('BRL');
      expect(result.moedas[0].nome).toBe('Brazilian Real');
      expect(result.moedas[0].simbolo).toBe('R$');
      expect(result.moedas[1].codigo).toBe('USD');
      expect(result.moedas[1].nome).toBe('US Dollar');
      expect(result.moedas[1].simbolo).toBe('$');
    });

    it('should map multiple languages correctly', () => {
      const countryWithMultipleLanguages: Country = {
        ...mockCountry,
        languages: ['Portuguese', 'English', 'Spanish'],
      };

      const result = CountryMapper.toGraphQL(countryWithMultipleLanguages);

      expect(result.linguas).toEqual(['Portuguese', 'English', 'Spanish']);
    });

    it('should map multiple timezones correctly', () => {
      const countryWithMultipleTimezones: Country = {
        ...mockCountry,
        timezones: ['UTC-05:00', 'UTC-04:00', 'UTC-03:00'],
      };

      const result = CountryMapper.toGraphQL(countryWithMultipleTimezones);

      expect(result.fusos).toEqual(['UTC-05:00', 'UTC-04:00', 'UTC-03:00']);
    });

    it('should handle currencies with missing optional fields', () => {
      const countryWithIncompleteCurrency: Country = {
        ...mockCountry,
        currencies: [
          {
            code: 'BRL',
            name: undefined,
            symbol: undefined,
          },
        ],
      };

      const result = CountryMapper.toGraphQL(countryWithIncompleteCurrency);

      expect(result.moedas[0].codigo).toBe('BRL');
      expect(result.moedas[0].nome).toBeNull();
      expect(result.moedas[0].simbolo).toBeNull();
    });

    it('should handle flags with missing optional fields', () => {
      const countryWithIncompleteFlags: Country = {
        ...mockCountry,
        flags: {
          svg: undefined,
          png: undefined,
        },
      };

      const result = CountryMapper.toGraphQL(countryWithIncompleteFlags);

      expect(result.bandeiras?.svg).toBeNull();
      expect(result.bandeiras?.png).toBeNull();
    });

    it('should handle maps with missing optional fields', () => {
      const countryWithIncompleteMaps: Country = {
        ...mockCountry,
        maps: {
          googleMaps: undefined,
          openStreetMaps: undefined,
        },
      };

      const result = CountryMapper.toGraphQL(countryWithIncompleteMaps);

      expect(result.mapas?.googleMaps).toBeNull();
      expect(result.mapas?.openStreetMaps).toBeNull();
    });
  });

  describe('toGraphQLList', () => {
    it('should map country list correctly', () => {
      const listResult = {
        items: [mockCountry, mockCountryUSA, mockCountryPortugal],
        total: 3,
        page: 1,
        perPage: 20,
      };

      const result = CountryMapper.toGraphQLList(listResult);

      expect(result.itens).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.pagina).toBe(1);
      expect(result.porPagina).toBe(20);
      expect(result.itens[0].codigo2).toBe('BR');
      expect(result.itens[1].codigo2).toBe('US');
      expect(result.itens[2].codigo2).toBe('PT');
    });

    it('should handle empty list', () => {
      const emptyResult = {
        items: [],
        total: 0,
        page: 1,
        perPage: 20,
      };

      const result = CountryMapper.toGraphQLList(emptyResult);

      expect(result.itens).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.pagina).toBe(1);
      expect(result.porPagina).toBe(20);
    });

    it('should handle pagination metadata correctly', () => {
      const paginatedResult = {
        items: [mockCountry],
        total: 100,
        page: 5,
        perPage: 10,
      };

      const result = CountryMapper.toGraphQLList(paginatedResult);

      expect(result.itens).toHaveLength(1);
      expect(result.total).toBe(100);
      expect(result.pagina).toBe(5);
      expect(result.porPagina).toBe(10);
    });

    it('should map all countries in the list', () => {
      const listResult = {
        items: [mockCountry, mockCountryUSA],
        total: 2,
        page: 1,
        perPage: 2,
      };

      const result = CountryMapper.toGraphQLList(listResult);

      expect(result.itens[0].codigo2).toBe('BR');
      expect(result.itens[0].nome.comum).toBe('Brazil');
      expect(result.itens[1].codigo2).toBe('US');
      expect(result.itens[1].nome.comum).toBe('United States');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data integrity during mapping', () => {
      const result = CountryMapper.toGraphQL(mockCountry);

      // Verificar que todos os dados originais foram preservados
      expect(result.codigo2).toBe(mockCountry.code2);
      expect(result.codigo3).toBe(mockCountry.code3);
      expect(result.nome.comum).toBe(mockCountry.name.common);
      expect(result.nome.oficial).toBe(mockCountry.name.official);
      expect(result.nome.nativo).toBe(mockCountry.name.native);
      expect(result.capital).toBe(mockCountry.capital);
      expect(result.regiao).toBe(mockCountry.region);
      expect(result.subregiao).toBe(mockCountry.subregion);
      expect(result.populacao).toBe(mockCountry.population);
      expect(result.area).toBe(mockCountry.area);
    });

    it('should preserve array lengths', () => {
      const result = CountryMapper.toGraphQL(mockCountry);

      expect(result.moedas).toHaveLength(mockCountry.currencies.length);
      expect(result.linguas).toHaveLength(mockCountry.languages.length);
      expect(result.fusos).toHaveLength(mockCountry.timezones.length);
    });

    it('should preserve array order', () => {
      const result = CountryMapper.toGraphQL(mockCountry);

      expect(result.linguas[0]).toBe(mockCountry.languages[0]);
      expect(result.fusos[0]).toBe(mockCountry.timezones[0]);
    });
  });

  describe('Type Safety', () => {
    it('should return correct GraphQL types', () => {
      const result = CountryMapper.toGraphQL(mockCountry);

      // Verificar tipos básicos
      expect(typeof result.codigo2).toBe('string');
      expect(typeof result.codigo3).toBe('string');
      expect(typeof result.nome.comum).toBe('string');
      expect(typeof result.nome.oficial).toBe('string');
      expect(typeof result.regiao).toBe('string');
      expect(typeof result.populacao).toBe('number');

      // Verificar tipos opcionais
      if (result.capital !== null) {
        expect(typeof result.capital).toBe('string');
      }
      if (result.area !== null) {
        expect(typeof result.area).toBe('number');
      }

      // Verificar arrays
      expect(Array.isArray(result.moedas)).toBe(true);
      expect(Array.isArray(result.linguas)).toBe(true);
      expect(Array.isArray(result.fusos)).toBe(true);
    });

    it('should handle null and undefined consistently', () => {
      const countryWithNulls: Country = {
        ...mockCountry,
        name: {
          ...mockCountry.name,
          native: null,
        },
        capital: null,
        subregion: null,
        area: null,
      };

      const result = CountryMapper.toGraphQL(countryWithNulls);

      expect(result.nome.nativo).toBeNull();
      expect(result.capital).toBeNull();
      expect(result.subregiao).toBeNull();
      expect(result.area).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle country with no currencies', () => {
      const countryWithNoCurrencies: Country = {
        ...mockCountry,
        currencies: [],
      };

      const result = CountryMapper.toGraphQL(countryWithNoCurrencies);

      expect(result.moedas).toEqual([]);
    });

    it('should handle country with no languages', () => {
      const countryWithNoLanguages: Country = {
        ...mockCountry,
        languages: [],
      };

      const result = CountryMapper.toGraphQL(countryWithNoLanguages);

      expect(result.linguas).toEqual([]);
    });

    it('should handle country with no timezones', () => {
      const countryWithNoTimezones: Country = {
        ...mockCountry,
        timezones: [],
      };

      const result = CountryMapper.toGraphQL(countryWithNoTimezones);

      expect(result.fusos).toEqual([]);
    });

    it('should handle very large numbers', () => {
      const countryWithLargeNumbers: Country = {
        ...mockCountry,
        population: 999999999999,
        area: 999999999999.99,
      };

      const result = CountryMapper.toGraphQL(countryWithLargeNumbers);

      expect(result.populacao).toBe(999999999999);
      expect(result.area).toBe(999999999999.99);
    });
  });
});