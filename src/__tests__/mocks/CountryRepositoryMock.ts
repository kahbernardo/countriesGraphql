import type { Country, CountryFilter, CountryListResult, PaginationParams, CountrySortBy } from '../../domain/entities/Country.js';
import type { CountryRepository } from '../../domain/ports/CountryRepository.js';
import { mockCountry, mockCountryListResult } from '../fixtures/countryFixtures.js';

export class CountryRepositoryMock implements CountryRepository {
  private mockData: Country[] = [mockCountry];
  private mockResult: CountryListResult = mockCountryListResult;

  // Configuração para simular diferentes cenários
  private shouldThrowError = false;
  private errorMessage = 'Mock error';

  // Métodos para configurar o comportamento do mock
  setMockData(data: Country[]): void {
    this.mockData = data;
  }

  setMockResult(result: CountryListResult): void {
    this.mockResult = result;
  }

  setShouldThrowError(shouldThrow: boolean, message = 'Mock error'): void {
    this.shouldThrowError = shouldThrow;
    this.errorMessage = message;
  }

  // Implementação da interface
  async findAll(
    filter?: CountryFilter,
    pagination?: PaginationParams,
    sortBy?: CountrySortBy
  ): Promise<CountryListResult> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    // Simular filtros básicos
    let filteredData = [...this.mockData];

    if (filter) {
      if (filter.name) {
        filteredData = filteredData.filter(country =>
          country.name.common.toLowerCase().includes(filter.name!.toLowerCase())
        );
      }
      if (filter.region) {
        filteredData = filteredData.filter(country => country.region === filter.region);
      }
      if (filter.language) {
        filteredData = filteredData.filter(country =>
          country.languages.includes(filter.language!)
        );
      }
    }

    // Simular ordenação
    if (sortBy) {
      switch (sortBy) {
        case 'name':
          filteredData.sort((a, b) => a.name.common.localeCompare(b.name.common));
          break;
        case 'name_desc':
          filteredData.sort((a, b) => b.name.common.localeCompare(a.name.common));
          break;
        case 'population':
          filteredData.sort((a, b) => a.population - b.population);
          break;
        case 'population_desc':
          filteredData.sort((a, b) => b.population - a.population);
          break;
      }
    }

    // Simular paginação
    const page = pagination?.page ?? 1;
    const perPage = pagination?.perPage ?? 20;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      items: paginatedData,
      total: filteredData.length,
      page,
      perPage,
    };
  }

  async findByCode(code: string): Promise<Country | null> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }

    const country = this.mockData.find(c => 
      c.code2.toLowerCase() === code.toLowerCase() || 
      c.code3.toLowerCase() === code.toLowerCase()
    );

    return country ?? null;
  }

  // Métodos para verificar chamadas
  private findAllCallCount = 0;
  private findByCodeCallCount = 0;
  private lastFindAllParams: { filter?: CountryFilter; pagination?: PaginationParams; sortBy?: CountrySortBy } = {};
  private lastFindByCodeParams: { code: string } = { code: '' };

  getFindAllCallCount(): number {
    return this.findAllCallCount;
  }

  getFindByCodeCallCount(): number {
    return this.findByCodeCallCount;
  }

  getLastFindAllParams(): typeof this.lastFindAllParams {
    return this.lastFindAllParams;
  }

  getLastFindByCodeParams(): typeof this.lastFindByCodeParams {
    return this.lastFindByCodeParams;
  }

  resetCallCounts(): void {
    this.findAllCallCount = 0;
    this.findByCodeCallCount = 0;
  }
}
