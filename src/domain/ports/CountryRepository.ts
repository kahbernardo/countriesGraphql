import type { Country, CountryFilter, CountryListResult, PaginationParams, CountrySortBy } from '../entities/Country.js';

export interface CountryRepository {
  findAll(
    filter?: CountryFilter,
    pagination?: PaginationParams,
    sortBy?: CountrySortBy
  ): Promise<CountryListResult>;

  findByCode(code: string): Promise<Country | null>;
}
