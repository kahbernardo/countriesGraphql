export interface Country {
  readonly code2: string;
  readonly code3: string;
  readonly name: {
    readonly common: string;
    readonly official: string;
    readonly native?: string | null;
  };
  readonly capital?: string | null;
  readonly region: string;
  readonly subregion?: string | null;
  readonly population: number;
  readonly area?: number | null;
  readonly currencies: ReadonlyArray<{
    readonly code: string;
    readonly name?: string | null;
    readonly symbol?: string | null;
  }>;
  readonly languages: ReadonlyArray<string>;
  readonly timezones: ReadonlyArray<string>;
  readonly flags?: {
    readonly svg?: string | null;
    readonly png?: string | null;
  } | undefined;
  readonly maps?: {
    readonly googleMaps?: string | null;
    readonly openStreetMaps?: string | null;
  } | undefined;
}

export interface CountryFilter {
  readonly name?: string | undefined;
  readonly region?: string | undefined;
  readonly subregion?: string | undefined;
  readonly currency?: string | undefined;
  readonly language?: string | undefined;
}

export type CountrySortBy = 
  | 'name'
  | 'name_desc'
  | 'population'
  | 'population_desc';

export interface PaginationParams {
  readonly page: number;
  readonly perPage: number;
}

export interface CountryListResult {
  readonly items: ReadonlyArray<Country>;
  readonly total: number;
  readonly page: number;
  readonly perPage: number;
}
