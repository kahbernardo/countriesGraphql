import type { Country } from '../../domain/entities/Country.js';

export const mockCountry: Country = {
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
  timezones: ['UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00'],
  flags: {
    svg: 'https://flagcdn.com/br.svg',
    png: 'https://flagcdn.com/w320/br.png',
  },
  maps: {
    googleMaps: 'https://goo.gl/maps/waCKk21HeeqFzkNC9',
    openStreetMaps: 'https://www.openstreetmap.org/relation/59470',
  },
};

export const mockCountryUSA: Country = {
  code2: 'US',
  code3: 'USA',
  name: {
    common: 'United States',
    official: 'United States of America',
    native: null,
  },
  capital: 'Washington, D.C.',
  region: 'Americas',
  subregion: 'North America',
  population: 329484123,
  area: 9833517.0,
  currencies: [
    {
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$',
    },
  ],
  languages: ['English'],
  timezones: [
    'UTC-12:00',
    'UTC-11:00',
    'UTC-10:00',
    'UTC-09:00',
    'UTC-08:00',
    'UTC-07:00',
    'UTC-06:00',
    'UTC-05:00',
    'UTC-04:00',
  ],
  flags: {
    svg: 'https://flagcdn.com/us.svg',
    png: 'https://flagcdn.com/w320/us.png',
  },
  maps: {
    googleMaps: 'https://goo.gl/maps/e8M246zq4A5zH6Xv6',
    openStreetMaps: 'https://www.openstreetmap.org/relation/148838',
  },
};

export const mockCountryPortugal: Country = {
  code2: 'PT',
  code3: 'PRT',
  name: {
    common: 'Portugal',
    official: 'Portuguese Republic',
    native: 'Portugal',
  },
  capital: 'Lisbon',
  region: 'Europe',
  subregion: 'Southern Europe',
  population: 10276617,
  area: 92090.0,
  currencies: [
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
    },
  ],
  languages: ['Portuguese'],
  timezones: ['UTC-01:00', 'UTC+00:00'],
  flags: {
    svg: 'https://flagcdn.com/pt.svg',
    png: 'https://flagcdn.com/w320/pt.png',
  },
  maps: {
    googleMaps: 'https://goo.gl/maps/8T9ZQZQZQZQZQZQZQ',
    openStreetMaps: 'https://www.openstreetmap.org/relation/37668',
  },
};

export const mockCountryList = [mockCountry, mockCountryUSA, mockCountryPortugal];

export const mockCountryListResult = {
  items: mockCountryList,
  total: 3,
  page: 1,
  perPage: 20,
};
