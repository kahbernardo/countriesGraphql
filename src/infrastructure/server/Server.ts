import Fastify, { type FastifyInstance } from 'fastify';
import mercurius from 'mercurius';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import { RestCountriesHttpAdapter } from '../adapters/RestCountriesHttpAdapter.js';
import { CachedCountryRepository } from '../adapters/CachedCountryRepository.js';
import { NodeCacheService } from '../cache/CacheService.js';
import { ListCountries } from '../../application/use-cases/ListCountries.js';
import { GetCountryByCode } from '../../application/use-cases/GetCountryByCode.js';
import { registerCountryResolvers } from '../../graphql/resolvers/CountryResolvers.js';

export interface ServerConfig {
  readonly port: number;
  readonly host: string;
  readonly cacheTTL?: number;
  readonly rateLimitMax?: number;
  readonly rateLimitTimeWindow?: number;
}

export class Server {
  private readonly fastify: FastifyInstance;
  private readonly config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.fastify = Fastify({
      logger: {
        level: 'info',
      },
    });

    this.setupDependencyInjection();
  }

  private setupDependencyInjection(): void {
    // Cache
    const cacheService = new NodeCacheService(this.config.cacheTTL);
    
    // Repository
    const httpAdapter = new RestCountriesHttpAdapter();
    const countryRepository = new CachedCountryRepository(httpAdapter, cacheService, this.config.cacheTTL);
    
    // Use cases
    const listCountries = new ListCountries(countryRepository);
    const getCountryByCode = new GetCountryByCode(countryRepository);

    // Registrar no container de DI do Fastify
    this.fastify.decorate('diContainer', {
      cacheService,
      countryRepository,
      listCountries,
      getCountryByCode,
    });
  }

  async start(): Promise<void> {
    try {
      // Registrar plugins
      await this.fastify.register(cors, {
        origin: true,
        credentials: true,
      });

      await this.fastify.register(rateLimit, {
        max: this.config.rateLimitMax ?? 100,
        timeWindow: this.config.rateLimitTimeWindow ?? 60000, // 1 minuto
        errorResponseBuilder: () => ({
          error: 'Rate limit exceeded',
          message: 'Muitas requisições. Tente novamente em alguns minutos.',
        }),
      });

      // Carregar schema GraphQL
      const schemaPath = join(process.cwd(), 'src', 'graphql', 'schema.graphql');
      const schema = readFileSync(schemaPath, 'utf-8');

      // Registrar Mercurius com resolvers
      await this.fastify.register(mercurius, {
        schema,
        resolvers: {
          Query: {
            paises: async (parent: unknown, args: unknown, context: unknown, info: unknown) => {
              const { listCountries } = (this.fastify as any).diContainer;
              const { PaisesArgsSchema } = await import('../../graphql/resolvers/CountryResolvers.js');
              const { CountryMapper } = await import('../../graphql/mappers/CountryMapper.js');
              
              const validatedArgs = PaisesArgsSchema.parse(args);
              
              const result = await listCountries.execute({
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
                sortBy: validatedArgs.ordenacao as any,
              });

              return CountryMapper.toGraphQLList(result);
            },
            pais: async (parent: unknown, args: unknown, context: unknown, info: unknown) => {
              const { getCountryByCode } = (this.fastify as any).diContainer;
              const { PaisArgsSchema } = await import('../../graphql/resolvers/CountryResolvers.js');
              const { CountryMapper } = await import('../../graphql/mappers/CountryMapper.js');
              
              const validatedArgs = PaisArgsSchema.parse(args);
              
              const country = await getCountryByCode.execute({
                code: validatedArgs.codigo,
              });

              return country ? CountryMapper.toGraphQL(country) : null;
            },
          },
        },
        graphiql: true,
        ide: true,
        path: '/graphql',
        context: (request: unknown) => ({
          request: request as any,
        }),
      });

      // Health check
      this.fastify.get('/health', async () => {
        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        };
      });

      // Iniciar servidor
      await this.fastify.listen({
        port: this.config.port,
        host: this.config.host,
      });

      this.fastify.log.info(`🚀 Servidor iniciado em http://${this.config.host}:${this.config.port}`);
      this.fastify.log.info(`📊 GraphQL Playground disponível em http://${this.config.host}:${this.config.port}/graphiql`);
    } catch (error) {
      console.error('❌ Erro detalhado ao iniciar servidor:', error);
      this.fastify.log.error('Erro ao iniciar servidor:', error as any);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      await this.fastify.close();
      this.fastify.log.info('Servidor parado com sucesso');
    } catch (error) {
      this.fastify.log.error('Erro ao parar servidor:', error as any);
    }
  }

  getFastifyInstance(): FastifyInstance {
    return this.fastify;
  }
}
