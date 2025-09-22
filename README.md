# 🌍 RestCountries BFF - GraphQL Backend

> **Portfólio de Backend** - BFF GraphQL em TypeScript com arquitetura hexagonal, cache, rate-limiting e interface em português

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)](https://graphql.org/)
[![Fastify](https://img.shields.io/badge/Fastify-202020?style=for-the-badge&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## 🎯 Sobre o Projeto

Este é um **Backend for Frontend (BFF)** que demonstra habilidades avançadas em desenvolvimento backend:

- **🔄 Tradução de APIs**: Consome REST Countries API e expõe interface GraphQL em português
- **🏗️ Arquitetura Hexagonal**: Implementação completa de Clean Architecture
- **⚡ Performance**: Cache em memória, rate-limiting e paginação otimizada
- **🧪 Qualidade**: 150+ testes unitários com 80%+ de cobertura
- **📊 Observabilidade**: Logs estruturados e métricas de performance
- **🐳 Containerização**: Docker com multi-stage builds

## 🚀 Stack Tecnológica

### Core Technologies
- **Runtime**: Node.js 20+ com ES Modules
- **Framework**: Fastify (alta performance)
- **GraphQL**: Mercurius (plugin oficial do Fastify)
- **TypeScript**: Strict mode com tipagem rigorosa
- **Validação**: Zod para schemas e validação de dados

### Infrastructure & Performance
- **Cache**: Node-cache com TTL configurável
- **Rate Limiting**: Proteção contra abuso de API
- **HTTP Client**: Axios com interceptors e retry logic
- **Logging**: Pino para logs estruturados

### Quality & Testing
- **Testing**: Vitest com mocks e fixtures
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Coverage**: 80%+ de cobertura de testes

### DevOps & Deployment
- **Containerização**: Docker com multi-stage builds
- **Orquestração**: Docker Compose
- **Environment**: Configuração por variáveis de ambiente

## 🏗️ Arquitetura Hexagonal

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Resolvers  │  │   Mappers   │  │   Schema (PT-BR)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Application Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Use Cases   │  │ Validation  │  │ Business Logic      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Domain Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Entities   │  │    Ports    │  │ Domain Services     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Adapters  │  │    Cache    │  │ External APIs       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Funcionalidades Implementadas

### 🔍 API Features
- **GraphQL Interface**: Schema completo em português
- **Filtros Avançados**: Por região, idioma, moeda, nome
- **Paginação**: Controle de página e itens por página
- **Ordenação**: Por nome, população (crescente/decrescente)
- **Busca por Código**: ISO 2 e 3 dígitos

### ⚡ Performance & Reliability
- **Cache Inteligente**: TTL configurável com chaves baseadas em parâmetros
- **Rate Limiting**: Proteção contra abuso (100 req/min padrão)
- **Error Handling**: Tratamento robusto de erros com fallbacks
- **Graceful Degradation**: Sistema continua funcionando mesmo com falhas de cache

### 🧪 Quality Assurance
- **150+ Testes Unitários**: Cobertura completa de todas as camadas
- **Mocks & Fixtures**: Dados de teste realistas
- **Integration Tests**: Testes end-to-end do servidor
- **Type Safety**: TypeScript strict mode em todo o projeto

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Docker (opcional)

### Instalação Local

```bash
# Clonar o repositório
git clone <repository-url>
cd RestCountriesBFF

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### Docker

```bash
# Build e execução com Docker Compose
docker-compose up --build

# Ou apenas build da imagem
docker build -t rest-countries-bff .
docker run -p 3000:3000 rest-countries-bff
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Hot reload com tsx
npm run build           # Build TypeScript
npm start              # Executar versão buildada

# Testes
npm test               # Executar todos os testes
npm run test:unit      # Testes unitários
npm run test:coverage  # Testes com cobertura
npm run test:watch     # Modo watch

# Qualidade de Código
npm run lint           # Verificar código
npm run lint:fix       # Corrigir problemas
npm run format         # Formatar código
npm run type-check     # Verificar tipos
```

## 🌐 Endpoints

### GraphQL Playground
- **URL**: http://localhost:3000/graphiql
- **Descrição**: Interface interativa para testar queries

### GraphQL API
- **URL**: http://localhost:3000/graphql
- **Método**: POST
- **Content-Type**: application/json

### Health Check
- **URL**: http://localhost:3000/health
- **Método**: GET

## 📊 Schema GraphQL (Português)

### Tipos Principais

```graphql
type Pais {
  codigo2: String!
  codigo3: String!
  nome: NomePais!
  capital: String
  regiao: String!
  subregiao: String
  populacao: Int!
  area: Float
  moedas: [Moeda!]!
  linguas: [String!]!
  fusos: [String!]!
  bandeiras: Bandeiras
  mapas: Mapas
}

type ListaPaises {
  itens: [Pais!]!
  total: Int!
  pagina: Int!
  porPagina: Int!
}
```

### Queries Disponíveis

```graphql
type Query {
  paises(
    filtro: FiltroPais
    pagina: Int = 1
    porPagina: Int = 20
    ordenacao: OrdenacaoPais = nome
  ): ListaPaises!

  pais(codigo: String!): Pais
}
```

## 🔍 Exemplos de Queries

### 1. Países por População (Maior Primeiro)

```graphql
query {
  paises(
    ordenacao: populacao_desc
    porPagina: 5
  ) {
    total
    itens {
      nome { comum }
      codigo2
      regiao
      populacao
    }
  }
}
```

### 2. Buscar País Específico

```graphql
query {
  pais(codigo: "BR") {
    nome { oficial }
    capital
    moedas { codigo simbolo }
    linguas
    mapas { googleMaps }
  }
}
```

### 3. Países da América do Sul

```graphql
query {
  paises(
    filtro: { regiao: "Americas" }
    porPagina: 10
  ) {
    total
    itens {
      nome { comum }
      capital
      populacao
    }
  }
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
PORT=3000                           # Porta do servidor
HOST=0.0.0.0                       # Host do servidor
CACHE_TTL=300                      # TTL do cache (5 min)
RATE_LIMIT_MAX=100                 # Max requisições por janela
RATE_LIMIT_TIME_WINDOW=60000       # Janela de tempo (1 min)
NODE_ENV=production                # Ambiente
```

## 🧪 Estrutura de Testes

```
src/
├── domain/entities/__tests__/          # Testes de entidades
├── application/use-cases/__tests__/    # Testes de casos de uso
├── graphql/mappers/__tests__/          # Testes de mappers
├── infrastructure/adapters/__tests__/  # Testes de adapters
└── __tests__/integration/              # Testes de integração
```

### Cobertura de Testes
- **Domain**: 100% - Entidades e regras de negócio
- **Application**: 100% - Casos de uso e validações
- **Infrastructure**: 95% - Adapters e serviços externos
- **GraphQL**: 100% - Mappers e resolvers

## 🏗️ Estrutura do Projeto

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/             # Entidades de negócio
│   │   └── Country.ts        # Entidade principal
│   └── ports/                # Interfaces (contratos)
│       └── CountryRepository.ts
├── application/              # Camada de Aplicação
│   └── use-cases/           # Casos de uso
│       ├── ListCountries.ts
│       └── GetCountryByCode.ts
├── infrastructure/           # Camada de Infraestrutura
│   ├── adapters/            # Adaptadores externos
│   │   ├── RestCountriesHttpAdapter.ts
│   │   └── CachedCountryRepository.ts
│   ├── cache/               # Serviços de cache
│   └── server/              # Configuração do servidor
└── graphql/                 # Camada de Interface
    ├── mappers/             # Mapeadores para GraphQL
    ├── resolvers/           # Resolvers GraphQL
    └── schema.graphql       # Schema GraphQL
```

## 🔄 Fluxo de Dados

1. **Cliente** → GraphQL Query (português)
2. **Resolver** → Valida com Zod
3. **Use Case** → Aplica lógica de negócio
4. **Repository** → Verifica cache
5. **HTTP Adapter** → Chama REST Countries API
6. **Mapper** → Traduz para GraphQL (português)
7. **Resposta** → Cliente recebe dados normalizados

## 🚀 Deploy

### Docker Compose

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Variáveis de Produção

```bash
NODE_ENV=production
PORT=3000
CACHE_TTL=600
RATE_LIMIT_MAX=200
RATE_LIMIT_TIME_WINDOW=60000
```

## 📈 Monitoramento

### Health Check

```bash
curl http://localhost:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### Logs Estruturados

O servidor utiliza Pino para logging com:
- Níveis configuráveis (debug, info, warn, error)
- Formatação colorida em desenvolvimento
- Logs JSON em produção
- Request/Response logging

## 🎯 Destaques Técnicos

### Arquitetura
- **Hexagonal Architecture**: Separação clara de responsabilidades
- **Dependency Injection**: Inversão de dependências
- **Ports & Adapters**: Interfaces bem definidas
- **Domain-Driven Design**: Foco no domínio de negócio

### Performance
- **Cache Strategy**: Cache-aside pattern com TTL
- **Rate Limiting**: Proteção contra abuso
- **Connection Pooling**: Reutilização de conexões HTTP
- **Memory Management**: Garbage collection otimizado

### Quality
- **Type Safety**: TypeScript strict mode
- **Error Handling**: Tratamento robusto de erros
- **Validation**: Zod schemas para validação
- **Testing**: Cobertura abrangente com mocks

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com o 🧠 demonstrando habilidades avançadas em Backend Development**

*Este projeto faz parte do meu portfólio de desenvolvimento backend, mostrando expertise em TypeScript, GraphQL, arquitetura hexagonal, testes e DevOps.*
