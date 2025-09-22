import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
  // Setup global test environment
  console.log('🧪 Setting up test environment...');
});

afterAll(() => {
  // Cleanup global test environment
  console.log('🧹 Cleaning up test environment...');
});

beforeEach(() => {
  // Setup before each test
});

afterEach(() => {
  // Cleanup after each test
});

// Global test utilities
export const testUtils = {
  // Helper function to create mock data
  createMockCountry: (overrides = {}) => ({
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
    ...overrides,
  }),

  // Helper function to create mock GraphQL response
  createMockGraphQLResponse: (data: any) => ({
    data,
    errors: undefined,
  }),

  // Helper function to create mock error response
  createMockGraphQLError: (message: string) => ({
    data: null,
    errors: [{ message }],
  }),

  // Helper function to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper function to create mock fetch response
  createMockFetchResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  }),
};
