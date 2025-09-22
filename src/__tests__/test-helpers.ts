import type { Country, CountryListResult } from '../domain/entities/Country.js';
import type { CountryRepository } from '../domain/ports/CountryRepository.js';

/**
 * Helper functions for testing
 */

export class TestHelpers {
  /**
   * Creates a mock CountryRepository with configurable behavior
   */
  static createMockCountryRepository(): CountryRepository & {
    setMockData: (data: Country[]) => void;
    setMockResult: (result: CountryListResult) => void;
    setShouldThrowError: (shouldThrow: boolean, message?: string) => void;
    getCallCount: () => { findAll: number; findByCode: number };
    resetCallCount: () => void;
  } {
    let mockData: Country[] = [];
    let mockResult: CountryListResult = {
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
    };
    let shouldThrowError = false;
    let errorMessage = 'Mock error';
    let callCount = { findAll: 0, findByCode: 0 };

    return {
      async findAll() {
        callCount.findAll++;
        if (shouldThrowError) {
          throw new Error(errorMessage);
        }
        return mockResult;
      },

      async findByCode() {
        callCount.findByCode++;
        if (shouldThrowError) {
          throw new Error(errorMessage);
        }
        return mockData[0] || null;
      },

      setMockData(data: Country[]) {
        mockData = data;
      },

      setMockResult(result: CountryListResult) {
        mockResult = result;
      },

      setShouldThrowError(shouldThrow: boolean, message = 'Mock error') {
        shouldThrowError = shouldThrow;
        errorMessage = message;
      },

      getCallCount() {
        return { ...callCount };
      },

      resetCallCount() {
        callCount = { findAll: 0, findByCode: 0 };
      },
    };
  }

  /**
   * Creates a mock cache service
   */
  static createMockCacheService() {
    const cache = new Map<string, any>();

    return {
      get<T>(key: string): T | undefined {
        return cache.get(key);
      },

      set<T>(key: string, value: T, ttlSeconds?: number): boolean {
        cache.set(key, value);
        return true;
      },

      del(key: string): number {
        return cache.delete(key) ? 1 : 0;
      },

      flush(): void {
        cache.clear();
      },

      keys(): string[] {
        return Array.from(cache.keys());
      },

      getStats() {
        return {
          keys: cache.size,
          hits: 0,
          misses: 0,
        };
      },
    };
  }

  /**
   * Creates a mock HTTP client for testing
   */
  static createMockHttpClient() {
    const responses = new Map<string, any>();

    return {
      get: async (url: string) => {
        const response = responses.get(url);
        if (!response) {
          throw new Error(`No mock response for ${url}`);
        }
        return response;
      },

      setMockResponse(url: string, response: any) {
        responses.set(url, response);
      },

      clearMockResponses() {
        responses.clear();
      },
    };
  }

  /**
   * Validates that a country object has all required properties
   */
  static validateCountry(country: any): country is Country {
    return (
      country &&
      typeof country.code2 === 'string' &&
      typeof country.code3 === 'string' &&
      country.name &&
      typeof country.name.common === 'string' &&
      typeof country.name.official === 'string' &&
      typeof country.region === 'string' &&
      typeof country.population === 'number' &&
      Array.isArray(country.currencies) &&
      Array.isArray(country.languages) &&
      Array.isArray(country.timezones)
    );
  }

  /**
   * Validates that a GraphQL response has the correct structure
   */
  static validateGraphQLResponse(response: any): boolean {
    return (
      response &&
      (response.data !== undefined || response.errors !== undefined)
    );
  }

  /**
   * Creates a test GraphQL query
   */
  static createTestQuery(type: 'paises' | 'pais', variables: any = {}) {
    if (type === 'paises') {
      return {
        query: `
          query Paises($filtro: FiltroPais, $pagina: Int, $porPagina: Int, $ordenacao: OrdenacaoPais) {
            paises(filtro: $filtro, pagina: $pagina, porPagina: $porPagina, ordenacao: $ordenacao) {
              total
              pagina
              porPagina
              itens {
                codigo2
                codigo3
                nome {
                  comum
                  oficial
                  nativo
                }
                capital
                regiao
                subregiao
                populacao
                area
                moedas {
                  codigo
                  nome
                  simbolo
                }
                linguas
                fusos
                bandeiras {
                  svg
                  png
                }
                mapas {
                  googleMaps
                  openStreetMaps
                }
              }
            }
          }
        `,
        variables,
      };
    } else {
      return {
        query: `
          query Pais($codigo: String!) {
            pais(codigo: $codigo) {
              codigo2
              codigo3
              nome {
                comum
                oficial
                nativo
              }
              capital
              regiao
              subregiao
              populacao
              area
              moedas {
                codigo
                nome
                simbolo
              }
              linguas
              fusos
              bandeiras {
                svg
                png
              }
              mapas {
                googleMaps
                openStreetMaps
              }
            }
          }
        `,
        variables,
      };
    }
  }

  /**
   * Waits for a specified amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retries a function until it succeeds or max attempts are reached
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delay = 100
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts) {
          await this.wait(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Creates a mock server configuration for testing
   */
  static createTestServerConfig() {
    return {
      port: 3001,
      host: '0.0.0.0',
      cacheTTL: 60,
      rateLimitMax: 1000,
      rateLimitTimeWindow: 60000,
    };
  }

  /**
   * Validates that all required environment variables are set
   */
  static validateTestEnvironment(): boolean {
    const requiredVars = ['NODE_ENV'];
    return requiredVars.every(varName => process.env[varName] !== undefined);
  }

  /**
   * Creates a mock REST Countries API response
   */
  static createMockRestCountriesResponse() {
    return [
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
  }
}
