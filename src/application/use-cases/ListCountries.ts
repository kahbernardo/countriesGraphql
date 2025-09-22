import type { Country, CountryFilter, CountryListResult, PaginationParams, CountrySortBy } from '../../domain/entities/Country.js';
import type { CountryRepository } from '../../domain/ports/CountryRepository.js';

export interface ListCountriesRequest {
  readonly filter?: CountryFilter | undefined;
  readonly pagination?: PaginationParams | undefined;
  readonly sortBy?: CountrySortBy | undefined;
}

export class ListCountries {
  constructor(private readonly countryRepository: CountryRepository) {}

  async execute(request: ListCountriesRequest): Promise<CountryListResult> {
    const { filter, pagination, sortBy } = request;

    // Validações básicas
    if (pagination) {
      if (pagination.page < 1) {
        throw new Error('Página deve ser maior que 0');
      }
      if (pagination.perPage < 1 || pagination.perPage > 100) {
        throw new Error('Itens por página deve estar entre 1 e 100');
      }
    }

    return await this.countryRepository.findAll(filter, pagination, sortBy);
  }
}
