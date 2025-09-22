import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { RestCountriesHttpAdapter } from '../RestCountriesHttpAdapter.js';
import type { Country, CountryFilter, CountrySortBy } from '../../../domain/entities/Country.js';

// Mock do axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('RestCountriesHttpAdapter', () => {
  let adapter: RestCountriesHttpAdapter;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: vi.fn(),
    };
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    adapter = new RestCountriesHttpAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://restcountries.com/v3.1',
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RestCountriesBFF/1.0.0',
        },
      });
    });

    it('should accept custom base URL', () => {
      const customBaseURL = 'https://custom-api.com';
      new RestCountriesHttpAdapter(customBaseURL);
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: customBaseURL,
        })
      );
    });
  });

  describe('findAll', () => {
    const mockRestCountriesResponse = [
      {
        cca2: 'BR',
        cca3: 'BRA',
        name: {
          common: 'Brazil',
          official: 'Federative Republic of Brazil',
          nativeName: {
            por: {
              common: 'Brasil',
              official: 'República Federativa do Brasil',
            },
          },
        },
        capital: ['Brasília'],
        region: 'Americas',
        subregion: 'South America',
        population: 212559417,
        area: 8515767.049,
        currencies: {
          BRL: {
            name: 'Brazilian Real',
            symbol: 'R$',
          },
        },
        languages: {
          por: 'Portuguese',
        },
        timezones: ['UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00'],
        flags: {
          svg: 'https://flagcdn.com/br.svg',
          png: 'https://flagcdn.com/w320/br.png',
        },
        maps: {
          googleMaps: 'https://goo.gl/maps/waCKk21HeeqFzkNC9',
          openStreetMaps: 'https://www.openstreetmap.org/relation/59470',
        },
      },
      {
        cca2: 'US',
        cca3: 'USA',
        name: {
          common: 'United States',
          official: 'United States of America',
          nativeName: null,
        },
        capital: ['Washington, D.C.'],
        region: 'Americas',
        subregion: 'North America',
        population: 329484123,
        area: 9833517.0,
        currencies: {
          USD: {
            name: 'United States Dollar',
            symbol: '$',
          },
        },
        languages: {
          eng: 'English',
        },
        timezones: ['UTC-12:00', 'UTC-11:00', 'UTC-10:00'],
        flags: {
          svg: 'https://flagcdn.com/us.svg',
          png: 'https://flagcdn.com/w320/us.png',
        },
        maps: {
          googleMaps: 'https://goo.gl/maps/e8M246zq4A5zH6Xv6',
          openStreetMaps: 'https://www.openstreetmap.org/relation/148838',
        },
      },
    ];

    it('should fetch all countries successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const result = await adapter.findAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/all?fields=name,cca2,cca3,population,region');
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(20);
    });

    it('should apply name filter correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const filter: CountryFilter = { name: 'Brazil' };
      const result = await adapter.findAll(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.name.common).toBe('Brazil');
    });

    it('should apply region filter correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const filter: CountryFilter = { region: 'Americas' };
      const result = await adapter.findAll(filter);

      expect(result.items).toHaveLength(2);
      expect(result.items.every(country => country.region === 'Americas')).toBe(true);
    });

    it('should apply language filter correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const filter: CountryFilter = { language: 'Portuguese' };
      const result = await adapter.findAll(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.languages).toContain('Portuguese');
    });

    it('should apply currency filter correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const filter: CountryFilter = { currency: 'BRL' };
      const result = await adapter.findAll(filter);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.currencies.some(c => c.code === 'BRL')).toBe(true);
    });

    it('should apply pagination correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const result = await adapter.findAll(undefined, { page: 1, perPage: 1 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.perPage).toBe(1);
    });

    it('should sort by name ascending', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const result = await adapter.findAll(undefined, undefined, 'name');

      expect(result.items[0]?.name.common).toBe('Brazil');
      expect(result.items[1]?.name.common).toBe('United States');
    });

    it('should sort by name descending', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const result = await adapter.findAll(undefined, undefined, 'name_desc');

      expect(result.items[0]?.name.common).toBe('United States');
      expect(result.items[1]?.name.common).toBe('Brazil');
    });

    it('should sort by population ascending', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const result = await adapter.findAll(undefined, undefined, 'population');

      expect(result.items[0]?.population).toBe(212559417); // Brazil
      expect(result.items[1]?.population).toBe(329484123); // USA
    });

    it('should sort by population descending', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockRestCountriesResponse,
      });

      const result = await adapter.findAll(undefined, undefined, 'population_desc');

      expect(result.items[0]?.population).toBe(329484123); // USA
      expect(result.items[1]?.population).toBe(212559417); // Brazil
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(adapter.findAll()).rejects.toThrow('Erro ao buscar países: Network error');
    });

    it('should handle empty response', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [],
      });

      const result = await adapter.findAll();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findByCode', () => {
    const mockSingleCountryResponse = [
      {
        cca2: 'BR',
        cca3: 'BRA',
        name: {
          common: 'Brazil',
          official: 'Federative Republic of Brazil',
          nativeName: {
            por: {
              common: 'Brasil',
              official: 'República Federativa do Brasil',
            },
          },
        },
        capital: ['Brasília'],
        region: 'Americas',
        subregion: 'South America',
        population: 212559417,
        area: 8515767.049,
        currencies: {
          BRL: {
            name: 'Brazilian Real',
            symbol: 'R$',
          },
        },
        languages: {
          por: 'Portuguese',
        },
        timezones: ['UTC-03:00'],
        flags: {
          svg: 'https://flagcdn.com/br.svg',
          png: 'https://flagcdn.com/w320/br.png',
        },
        maps: {
          googleMaps: 'https://goo.gl/maps/waCKk21HeeqFzkNC9',
          openStreetMaps: 'https://www.openstreetmap.org/relation/59470',
        },
      },
    ];

    it('should find country by code successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockSingleCountryResponse,
      });

      const result = await adapter.findByCode('BR');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/alpha/BR?fields=name,cca2,cca3,population,region');
      expect(result).toBeDefined();
      expect(result?.code2).toBe('BR');
      expect(result?.code3).toBe('BRA');
      expect(result?.name.common).toBe('Brazil');
    });

    it('should return null for non-existent country', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [],
      });

      const result = await adapter.findByCode('XX');

      expect(result).toBeNull();
    });

    it('should handle 404 errors gracefully', async () => {
      const error = {
        response: { status: 404 },
        isAxiosError: true,
      };
      vi.mocked(axios.isAxiosError).mockReturnValue(true);
      mockAxiosInstance.get.mockRejectedValue(error);

      const result = await adapter.findByCode('XX');

      expect(result).toBeNull();
    });

    it('should handle other API errors', async () => {
      const error = new Error('Server error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(adapter.findByCode('BR')).rejects.toThrow('Erro ao buscar país por código: Server error');
    });
  });

  describe('Data Mapping', () => {
    it('should map REST API response to domain entity correctly', async () => {
      const mockResponse = [
        {
          cca2: 'BR',
          cca3: 'BRA',
          name: {
            common: 'Brazil',
            official: 'Federative Republic of Brazil',
            nativeName: {
              por: {
                common: 'Brasil',
                official: 'República Federativa do Brasil',
              },
            },
          },
          capital: ['Brasília'],
          region: 'Americas',
          subregion: 'South America',
          population: 212559417,
          area: 8515767.049,
          currencies: {
            BRL: {
              name: 'Brazilian Real',
              symbol: 'R$',
            },
          },
          languages: {
            por: 'Portuguese',
          },
          timezones: ['UTC-03:00'],
          flags: {
            svg: 'https://flagcdn.com/br.svg',
            png: 'https://flagcdn.com/w320/br.png',
          },
          maps: {
            googleMaps: 'https://goo.gl/maps/waCKk21HeeqFzkNC9',
            openStreetMaps: 'https://www.openstreetmap.org/relation/59470',
          },
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await adapter.findByCode('BR');

      expect(result).toEqual({
        code2: 'BR',
        code3: 'BRA',
        name: {
          common: 'Brazil',
          official: 'Federative Republic of Brazil',
          native: 'Brasil',
        },
        capital: 'Brasília',
        region: 'Americas',
        subregion: 'South America',
        population: 212559417,
        area: 8515767.049,
        currencies: [
          {
            code: 'BRL',
            name: 'Brazilian Real',
            symbol: 'R$',
          },
        ],
        languages: ['Portuguese'],
        timezones: ['UTC-03:00'],
        flags: {
          svg: 'https://flagcdn.com/br.svg',
          png: 'https://flagcdn.com/w320/br.png',
        },
        maps: {
          googleMaps: 'https://goo.gl/maps/waCKk21HeeqFzkNC9',
          openStreetMaps: 'https://www.openstreetmap.org/relation/59470',
        },
      });
    });

    it('should handle missing optional fields', async () => {
      const mockResponse = [
        {
          cca2: 'US',
          cca3: 'USA',
          name: {
            common: 'United States',
            official: 'United States of America',
            nativeName: null,
          },
          capital: null,
          region: 'Americas',
          subregion: null,
          population: 329484123,
          area: null,
          currencies: null,
          languages: null,
          timezones: null,
          flags: null,
          maps: null,
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await adapter.findByCode('US');

      expect(result?.capital).toBeNull();
      expect(result?.subregion).toBeNull();
      expect(result?.area).toBeNull();
      expect(result?.currencies).toEqual([]);
      expect(result?.languages).toEqual([]);
      expect(result?.timezones).toEqual([]);
      expect(result?.flags).toBeUndefined();
      expect(result?.maps).toBeUndefined();
    });
  });

  describe('Interface Compliance', () => {
    it('should implement CountryRepository interface', () => {
      expect(typeof adapter.findAll).toBe('function');
      expect(typeof adapter.findByCode).toBe('function');
    });

    it('should return correct types', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [],
      });

      const findAllResult = await adapter.findAll();
      const findByCodeResult = await adapter.findByCode('XX');

      expect(findAllResult).toHaveProperty('items');
      expect(findAllResult).toHaveProperty('total');
      expect(findAllResult).toHaveProperty('page');
      expect(findAllResult).toHaveProperty('perPage');
      expect(findByCodeResult).toBeNull();
    });
  });
});
