import type { Country } from '../../domain/entities/Country.js';
import type { CountryRepository } from '../../domain/ports/CountryRepository.js';

export interface GetCountryByCodeRequest {
  readonly code: string;
}

export class GetCountryByCode {
  constructor(private readonly countryRepository: CountryRepository) {}

  async execute(request: GetCountryByCodeRequest): Promise<Country | null> {
    const { code } = request;

    // Validação básica
    if (!code || code.trim().length === 0) {
      throw new Error('Código do país é obrigatório');
    }

    // Normalizar código (aceitar tanto códigos de 2 quanto 3 letras)
    const normalizedCode = code.trim().toUpperCase();

    return await this.countryRepository.findByCode(normalizedCode);
  }
}
