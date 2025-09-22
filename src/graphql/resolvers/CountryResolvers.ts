import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ListCountries } from '../../application/use-cases/ListCountries.js';
import { GetCountryByCode } from '../../application/use-cases/GetCountryByCode.js';
import { CountryMapper, type Pais, type ListaPaises } from '../mappers/CountryMapper.js';
import type { CountrySortBy } from '../../domain/entities/Country.js';

// Schemas de validação Zod
export const FiltroPaisSchema = z.object({
  nome: z.string().optional(),
  regiao: z.string().optional(),
  subregiao: z.string().optional(),
  moeda: z.string().optional(),
  lingua: z.string().optional(),
});

export const OrdenacaoPaisSchema = z.enum(['nome', 'nome_desc', 'populacao', 'populacao_desc']);

export const PaisesArgsSchema = z.object({
  filtro: FiltroPaisSchema.optional(),
  pagina: z.number().int().min(1).default(1),
  porPagina: z.number().int().min(1).max(100).default(20),
  ordenacao: OrdenacaoPaisSchema.default('nome'),
});

export const PaisArgsSchema = z.object({
  codigo: z.string().min(1),
});

export interface CountryResolversContext {
  readonly listCountries: ListCountries;
  readonly getCountryByCode: GetCountryByCode;
}

export const countryResolvers = {
  Query: {
    paises: async (
      _parent: unknown,
      args: unknown,
      context: CountryResolversContext
    ): Promise<ListaPaises> => {
      const validatedArgs = PaisesArgsSchema.parse(args);
      
      const result = await context.listCountries.execute({
        filter: validatedArgs.filtro ? {
          name: validatedArgs.filtro.nome ?? undefined,
          region: validatedArgs.filtro.regiao ?? undefined,
          subregion: validatedArgs.filtro.subregiao ?? undefined,
          currency: validatedArgs.filtro.moeda ?? undefined,
          language: validatedArgs.filtro.lingua ?? undefined,
        } : undefined,
        pagination: {
          page: validatedArgs.pagina,
          perPage: validatedArgs.porPagina,
        },
        sortBy: validatedArgs.ordenacao as CountrySortBy,
      });

      return CountryMapper.toGraphQLList(result);
    },

    pais: async (
      _parent: unknown,
      args: unknown,
      context: CountryResolversContext
    ): Promise<Pais | null> => {
      const validatedArgs = PaisArgsSchema.parse(args);
      
      const country = await context.getCountryByCode.execute({
        code: validatedArgs.codigo,
      });

      return country ? CountryMapper.toGraphQL(country) : null;
    },
  },
};

export function registerCountryResolvers(fastify: FastifyInstance): void {
  // Os resolvers são registrados diretamente no Mercurius durante o registro
  // Esta função é mantida para compatibilidade, mas não faz nada
  // Os resolvers reais são definidos no Server.ts
}
