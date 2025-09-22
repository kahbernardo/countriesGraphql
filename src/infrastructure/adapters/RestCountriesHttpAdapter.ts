import axios, { type AxiosInstance } from 'axios';
import type { Country, CountryFilter, CountryListResult, PaginationParams, CountrySortBy } from '../../domain/entities/Country.js';
import type { CountryRepository } from '../../domain/ports/CountryRepository.js';

interface RestCountriesResponse {
  readonly cca2: string;
  readonly cca3: string;
  readonly name: {
    readonly common: string;
    readonly official: string;
    readonly nativeName?: Record<string, { readonly common?: string; readonly official?: string }> | null;
  };
  readonly capital?: readonly string[] | null;
  readonly region: string;
  readonly subregion?: string | null;
  readonly population: number;
  readonly area?: number | null;
  readonly currencies?: Record<string, { readonly name?: string; readonly symbol?: string }> | null;
  readonly languages?: Record<string, string> | null;
  readonly timezones?: readonly string[] | null;
  readonly flags?: {
    readonly svg?: string;
    readonly png?: string;
  };
  readonly maps?: {
    readonly googleMaps?: string;
    readonly openStreetMaps?: string;
  };
}

export class RestCountriesHttpAdapter implements CountryRepository {
  private readonly httpClient: AxiosInstance;

  constructor(baseURL = 'https://restcountries.com/v3.1') {
    this.httpClient = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RestCountriesBFF/1.0.0',
      },
    });
  }

  async findAll(
    filter?: CountryFilter,
    pagination?: PaginationParams,
    sortBy?: CountrySortBy
  ): Promise<CountryListResult> {
    try {
      const response = await this.httpClient.get<RestCountriesResponse[]>('/all?fields=name,cca2,cca3,population,region');
      let countries = response.data.map(this.mapToDomain);

      // Aplicar filtros
      if (filter) {
        countries = this.applyFilters(countries, filter);
      }

      // Aplicar ordenação
      if (sortBy) {
        countries = this.applySorting(countries, sortBy);
      }

      const total = countries.length;
      const page = pagination?.page ?? 1;
      const perPage = pagination?.perPage ?? 20;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const items = countries.slice(startIndex, endIndex);

      return {
        items,
        total,
        page,
        perPage,
      };
    } catch (error) {
      throw new Error(`Erro ao buscar países: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async findByCode(code: string): Promise<Country | null> {
    try {
      const response = await this.httpClient.get<RestCountriesResponse[]>(`/alpha/${code}?fields=name,cca2,cca3,population,region`);
      if (response.data.length === 0) {
        return null;
      }
      return this.mapToDomain(response.data[0]!);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Erro ao buscar país por código: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private mapToDomain(restCountry: RestCountriesResponse): Country {
    // Extrair nome nativo (primeiro idioma disponível)
    const nativeName = restCountry.name.nativeName 
      ? Object.values(restCountry.name.nativeName)[0]?.common ?? null
      : null;

    // Mapear moedas
    const currencies = restCountry.currencies 
      ? Object.entries(restCountry.currencies).map(([code, currency]) => ({
          code,
          name: currency.name ?? null,
          symbol: currency.symbol ?? null,
        }))
      : [];

    // Mapear idiomas
    const languages = restCountry.languages 
      ? Object.values(restCountry.languages)
      : [];

    return {
      code2: restCountry.cca2,
      code3: restCountry.cca3,
      name: {
        common: restCountry.name.common,
        official: restCountry.name.official,
        native: nativeName,
      },
      capital: restCountry.capital?.[0] ?? null,
      region: restCountry.region,
      subregion: restCountry.subregion ?? null,
      population: restCountry.population,
      area: restCountry.area ?? null,
      currencies,
      languages,
      timezones: restCountry.timezones ?? [],
      flags: restCountry.flags ? {
        svg: restCountry.flags.svg ?? null,
        png: restCountry.flags.png ?? null,
      } : undefined,
      maps: restCountry.maps ? {
        googleMaps: restCountry.maps.googleMaps ?? null,
        openStreetMaps: restCountry.maps.openStreetMaps ?? null,
      } : undefined,
    };
  }

  private applyFilters(countries: Country[], filter: CountryFilter): Country[] {
    return countries.filter(country => {
      if (filter.name && !country.name.common.toLowerCase().includes(filter.name.toLowerCase())) {
        return false;
      }
      if (filter.region && country.region !== filter.region) {
        return false;
      }
      if (filter.subregion && country.subregion !== filter.subregion) {
        return false;
      }
      if (filter.currency && !country.currencies.some(c => c.code === filter.currency)) {
        return false;
      }
      if (filter.language && !country.languages.includes(filter.language)) {
        return false;
      }
      return true;
    });
  }

  private applySorting(countries: Country[], sortBy: CountrySortBy): Country[] {
    const sorted = [...countries];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.common.localeCompare(b.name.common));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.common.localeCompare(a.name.common));
      case 'population':
        return sorted.sort((a, b) => a.population - b.population);
      case 'population_desc':
        return sorted.sort((a, b) => b.population - a.population);
      default:
        return sorted;
    }
  }
}
