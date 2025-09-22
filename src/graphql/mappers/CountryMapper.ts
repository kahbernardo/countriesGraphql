import type { Country } from '../../domain/entities/Country.js';

export interface NomePais {
  readonly comum: string;
  readonly oficial: string;
  readonly nativo?: string | null;
}

export interface Moeda {
  readonly codigo: string;
  readonly nome?: string | null;
  readonly simbolo?: string | null;
}

export interface Bandeiras {
  readonly svg?: string | null;
  readonly png?: string | null;
}

export interface Mapas {
  readonly googleMaps?: string | null;
  readonly openStreetMaps?: string | null;
}

export interface Pais {
  readonly codigo2: string;
  readonly codigo3: string;
  readonly nome: NomePais;
  readonly capital?: string | null;
  readonly regiao: string;
  readonly subregiao?: string | null;
  readonly populacao: number;
  readonly area?: number | null;
  readonly moedas: ReadonlyArray<Moeda>;
  readonly linguas: ReadonlyArray<string>;
  readonly fusos: ReadonlyArray<string>;
  readonly bandeiras?: Bandeiras | null;
  readonly mapas?: Mapas | null;
}

export interface ListaPaises {
  readonly itens: ReadonlyArray<Pais>;
  readonly total: number;
  readonly pagina: number;
  readonly porPagina: number;
}

export class CountryMapper {
  static toGraphQL(country: Country): Pais {
    return {
      codigo2: country.code2,
      codigo3: country.code3,
      nome: {
        comum: country.name.common,
        oficial: country.name.official,
        nativo: country.name.native ?? null,
      },
      capital: country.capital ?? null,
      regiao: country.region,
      subregiao: country.subregion ?? null,
      populacao: country.population,
      area: country.area ?? null,
      moedas: country.currencies.map(currency => ({
        codigo: currency.code,
        nome: currency.name ?? null,
        simbolo: currency.symbol ?? null,
      })),
      linguas: country.languages,
      fusos: country.timezones,
      bandeiras: country.flags ? {
        svg: country.flags.svg ?? null,
        png: country.flags.png ?? null,
      } : null,
      mapas: country.maps ? {
        googleMaps: country.maps.googleMaps ?? null,
        openStreetMaps: country.maps.openStreetMaps ?? null,
      } : null,
    };
  }

  static toGraphQLList(result: {
    readonly items: ReadonlyArray<Country>;
    readonly total: number;
    readonly page: number;
    readonly perPage: number;
  }): ListaPaises {
    return {
      itens: result.items.map(this.toGraphQL),
      total: result.total,
      pagina: result.page,
      porPagina: result.perPage,
    };
  }
}
