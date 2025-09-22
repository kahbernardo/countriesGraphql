# Arquitetura do RestCountries BFF

## Visão Geral

Este projeto implementa uma arquitetura hexagonal (Ports and Adapters) para criar um BFF (Backend for Frontend) GraphQL que consome a API REST Countries e expõe uma interface em português.

## Princípios Arquiteturais

### 1. Arquitetura Hexagonal

A arquitetura hexagonal separa o código em três camadas principais:

- **Domínio**: Regras de negócio e entidades
- **Aplicação**: Casos de uso e orquestração
- **Infraestrutura**: Adaptadores externos e interfaces

### 2. Inversão de Dependência

- O domínio não depende de infraestrutura
- Use cases dependem de abstrações (ports)
- Implementações concretas (adapters) dependem das abstrações

### 3. Separação de Responsabilidades

- Cada camada tem uma responsabilidade específica
- Mapeamento claro entre domínio e interface GraphQL
- Cache e rate-limiting como cross-cutting concerns

## Estrutura de Camadas

```
┌─────────────────────────────────────────┐
│              GraphQL Layer              │
│  (Resolvers, Schema, Mappers)          │
├─────────────────────────────────────────┤
│            Application Layer            │
│         (Use Cases, Services)          │
├─────────────────────────────────────────┤
│              Domain Layer               │
│        (Entities, Ports, Rules)        │
├─────────────────────────────────────────┤
│           Infrastructure Layer          │
│    (HTTP Adapters, Cache, Server)      │
└─────────────────────────────────────────┘
```

## Componentes Principais

### Domain Layer

#### Entidades
- **Country**: Entidade principal com todas as propriedades de um país
- **CountryFilter**: Filtros para busca de países
- **PaginationParams**: Parâmetros de paginação
- **CountryListResult**: Resultado paginado de países

#### Ports (Interfaces)
- **CountryRepository**: Interface para acesso a dados de países

### Application Layer

#### Use Cases
- **ListCountries**: Lista países com filtros, paginação e ordenação
- **GetCountryByCode**: Busca país específico por código

### Infrastructure Layer

#### Adapters
- **RestCountriesHttpAdapter**: Consome a API REST Countries
- **CachedCountryRepository**: Adiciona cache ao repositório
- **NodeCacheService**: Implementação de cache em memória

#### Server
- **Server**: Configuração do Fastify com Mercurius
- **Rate Limiting**: Proteção contra abuso
- **CORS**: Configuração de CORS

### GraphQL Layer

#### Schema
- Schema GraphQL em português
- Tipos traduzidos (Pais, NomePais, Moeda, etc.)
- Inputs para filtros e paginação

#### Resolvers
- **CountryResolvers**: Resolvers para queries de países
- Validação com Zod
- Mapeamento para casos de uso

#### Mappers
- **CountryMapper**: Traduz entidades de domínio para GraphQL
- Conversão de inglês para português
- Tratamento de valores nulos

## Fluxo de Dados

### 1. Requisição GraphQL
```
Cliente → GraphQL Query (português) → Resolver
```

### 2. Validação e Processamento
```
Resolver → Zod Validation → Use Case → Repository
```

### 3. Cache e API Externa
```
Repository → Cache Check → HTTP Adapter → REST Countries API
```

### 4. Resposta
```
API Response → Domain Entity → GraphQL Mapper → Cliente
```

## Padrões Implementados

### 1. Repository Pattern
- Abstração do acesso a dados
- Facilita testes e mudanças de implementação
- Cache transparente

### 2. Use Case Pattern
- Encapsula lógica de negócio
- Orquestra operações
- Validações de entrada

### 3. Adapter Pattern
- Adapta APIs externas para o domínio
- Mapeamento de dados
- Tratamento de erros

### 4. Mapper Pattern
- Tradução entre camadas
- Conversão de idiomas
- Normalização de dados

## Cache Strategy

### Cache-Aside Pattern
1. Verificar cache
2. Se não encontrado, buscar na API
3. Armazenar no cache
4. Retornar dados

### Configuração
- **TTL**: 5 minutos por padrão
- **Chaves**: Baseadas em operação e parâmetros
- **Estratégia**: Invalidação por tempo

## Rate Limiting

### Configuração
- **Limite**: 100 requisições por minuto
- **Janela**: 60 segundos
- **Resposta**: Mensagem em português

### Implementação
- Plugin do Fastify
- Headers informativos
- Graceful degradation

## Tratamento de Erros

### Estratégia
1. **Validação**: Zod para entrada
2. **Use Cases**: Validações de negócio
3. **Adapters**: Tratamento de APIs externas
4. **GraphQL**: Erros estruturados

### Tipos de Erro
- **ValidationError**: Dados inválidos
- **NotFoundError**: Recurso não encontrado
- **ExternalAPIError**: Erro da API externa
- **RateLimitError**: Limite excedido

## Testes

### Estratégia
- **Unit Tests**: Entidades e use cases
- **Integration Tests**: Adapters e resolvers
- **E2E Tests**: Fluxo completo

### Cobertura
- Domínio: 100%
- Use Cases: 100%
- Mappers: 100%
- Adapters: 80%+

## Monitoramento

### Health Check
- Status da aplicação
- Uptime
- Timestamp

### Logs
- Estruturados com Pino
- Níveis configuráveis
- Formatação por ambiente

### Métricas
- Cache hit/miss ratio
- Rate limit hits
- Response times

## Escalabilidade

### Horizontal
- Stateless design
- Cache compartilhado (Redis)
- Load balancer

### Vertical
- Otimização de queries
- Cache inteligente
- Connection pooling

## Segurança

### Rate Limiting
- Proteção contra DDoS
- Limites por IP
- Graceful degradation

### CORS
- Configuração flexível
- Domínios permitidos
- Credentials support

### Headers
- Security headers
- CORS headers
- Rate limit headers

## Manutenibilidade

### Código Limpo
- Nomes descritivos
- Funções pequenas
- Responsabilidade única

### Documentação
- README completo
- Exemplos de uso
- Documentação de API

### Testes
- Cobertura alta
- Testes automatizados
- CI/CD pipeline

## Extensibilidade

### Novos Endpoints
1. Adicionar ao schema GraphQL
2. Criar resolver
3. Implementar use case
4. Adicionar testes

### Novas Fontes de Dados
1. Implementar novo adapter
2. Configurar no DI container
3. Manter interface do repositório

### Novos Filtros
1. Adicionar ao schema de filtro
2. Implementar no adapter
3. Atualizar validação Zod
