# Guia de Testes - RestCountries BFF

## Visão Geral

Este projeto implementa uma estratégia abrangente de testes que cobre todas as camadas da arquitetura hexagonal, garantindo a qualidade e confiabilidade do código.

## Estrutura de Testes

### 📁 Organização dos Testes

```
src/
├── __tests__/
│   ├── fixtures/           # Dados de teste reutilizáveis
│   ├── integration/        # Testes de integração
│   ├── mocks/             # Mocks e stubs
│   ├── setup.ts           # Configuração global dos testes
│   └── test-helpers.ts    # Utilitários de teste
├── domain/
│   └── entities/
│       └── __tests__/     # Testes de entidades de domínio
├── application/
│   └── use-cases/
│       └── __tests__/     # Testes de casos de uso
├── infrastructure/
│   └── adapters/
│       └── __tests__/     # Testes de adaptadores
└── graphql/
    ├── mappers/
    │   └── __tests__/     # Testes de mappers
    └── resolvers/
        └── __tests__/     # Testes de resolvers
```

## Tipos de Testes

### 🧪 Testes Unitários

**Objetivo**: Testar unidades individuais de código em isolamento.

#### Camada de Domínio
- **Entidades**: Validação de propriedades, comportamentos e invariantes
- **Interfaces**: Verificação de contratos e tipos

```typescript
// Exemplo: Teste de entidade Country
describe('Country Entity', () => {
  it('should have all required properties', () => {
    expect(mockCountry.code2).toBe('BR');
    expect(mockCountry.name.common).toBe('Brazil');
    // ...
  });
});
```

#### Camada de Aplicação
- **Use Cases**: Lógica de negócio, validações e orquestração
- **Validações**: Parâmetros de entrada e regras de negócio

```typescript
// Exemplo: Teste de use case
describe('ListCountries Use Case', () => {
  it('should list countries successfully', async () => {
    const result = await listCountries.execute({});
    expect(result).toBeDefined();
  });
});
```

#### Camada de Infraestrutura
- **Adaptadores**: Mapeamento de dados, chamadas HTTP, cache
- **Mocks**: Simulação de dependências externas

```typescript
// Exemplo: Teste de adaptador HTTP
describe('RestCountriesHttpAdapter', () => {
  it('should fetch countries from API', async () => {
    const result = await adapter.findAll();
    expect(result.items).toBeDefined();
  });
});
```

#### Camada GraphQL
- **Mappers**: Conversão entre domínio e GraphQL
- **Resolvers**: Lógica de resolução de queries

```typescript
// Exemplo: Teste de mapper
describe('CountryMapper', () => {
  it('should map domain to GraphQL format', () => {
    const result = CountryMapper.toGraphQL(mockCountry);
    expect(result.codigo2).toBe('BR');
  });
});
```

### 🔗 Testes de Integração

**Objetivo**: Testar a integração entre diferentes componentes e camadas.

#### Servidor
- **Endpoints**: Health check, GraphQL, CORS
- **Configuração**: Rate limiting, cache, middleware
- **Fluxo completo**: Requisição → Processamento → Resposta

```typescript
// Exemplo: Teste de integração do servidor
describe('Server Integration', () => {
  it('should respond to GraphQL queries', async () => {
    const response = await fetch('/graphql', {
      method: 'POST',
      body: JSON.stringify({ query: '...' })
    });
    expect(response.status).toBe(200);
  });
});
```

## Ferramentas e Configuração

### 🛠️ Stack de Testes

- **Vitest**: Framework de testes principal
- **Mocks**: Vitest mocks para isolamento
- **Coverage**: Cobertura de código com v8
- **TypeScript**: Tipagem rigorosa nos testes

### 📊 Configuração de Cobertura

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## Executando Testes

### 🚀 Comandos Disponíveis

```bash
# Todos os testes
npm test

# Testes unitários apenas
npm run test:unit

# Testes de integração apenas
npm run test:integration

# Testes com cobertura
npm run test:coverage

# Modo watch (desenvolvimento)
npm run test:watch

# CI/CD
npm run test:ci
```

### 📋 Scripts Personalizados

```bash
# Usando o script de teste
./scripts/test.sh unit
./scripts/test.sh integration
./scripts/test.sh all
./scripts/test.sh coverage
./scripts/test.sh watch
```

## Estratégias de Mock

### 🎭 Mocks por Camada

#### Repository Mock
```typescript
class CountryRepositoryMock implements CountryRepository {
  private mockData: Country[] = [];
  
  async findAll(): Promise<CountryListResult> {
    return { items: this.mockData, total: 0, page: 1, perPage: 20 };
  }
}
```

#### Cache Mock
```typescript
const mockCache = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  flush: vi.fn(),
};
```

#### HTTP Client Mock
```typescript
const mockAxios = {
  get: vi.fn(),
  create: vi.fn(),
};
```

### 🔧 Fixtures e Helpers

#### Fixtures
```typescript
// Dados de teste reutilizáveis
export const mockCountry: Country = {
  code2: 'BR',
  code3: 'BRA',
  name: { common: 'Brazil', official: '...' },
  // ...
};
```

#### Test Helpers
```typescript
// Utilitários de teste
export class TestHelpers {
  static createMockCountryRepository() { /* ... */ }
  static validateCountry(country: any) { /* ... */ }
  static createTestQuery(type: string) { /* ... */ }
}
```

## Padrões de Teste

### ✅ Boas Práticas

1. **AAA Pattern**: Arrange, Act, Assert
2. **Isolamento**: Cada teste é independente
3. **Nomes Descritivos**: Descrevem o comportamento esperado
4. **Mocks Específicos**: Apenas o necessário para o teste
5. **Validação Completa**: Verificar todos os aspectos relevantes

### 🎯 Estrutura de Teste

```typescript
describe('Component', () => {
  describe('Method', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const input = createMockInput();
      const expected = createExpectedOutput();
      
      // Act
      const result = await component.method(input);
      
      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

## Validação de Interfaces

### 🔍 Verificação de Contratos

#### Entidades de Domínio
- Propriedades obrigatórias
- Tipos corretos
- Validações de negócio
- Imutabilidade

#### Use Cases
- Parâmetros de entrada
- Validações de negócio
- Tratamento de erros
- Retorno correto

#### Adaptadores
- Implementação de interfaces
- Mapeamento de dados
- Tratamento de erros externos
- Cache e performance

#### GraphQL
- Schema correto
- Resolvers funcionais
- Mapeamento de tipos
- Validação de entrada

## Cobertura de Testes

### 📈 Métricas Atuais

- **Domínio**: 100% (entidades e interfaces)
- **Aplicação**: 100% (use cases)
- **Infraestrutura**: 80%+ (adaptadores)
- **GraphQL**: 100% (mappers e resolvers)
- **Integração**: 90%+ (servidor e endpoints)

### 🎯 Objetivos de Cobertura

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Debugging de Testes

### 🐛 Ferramentas

```bash
# Executar teste específico
npm test -- --run src/domain/entities/__tests__/Country.test.ts

# Modo debug
npm test -- --run --reporter=verbose

# Cobertura detalhada
npm run test:coverage
```

### 📝 Logs e Debug

```typescript
// Debug em testes
console.log('Debug info:', result);

// Assertions detalhadas
expect(result).toMatchObject({
  items: expect.arrayContaining([
    expect.objectContaining({
      codigo2: 'BR'
    })
  ])
});
```

## CI/CD

### 🔄 Integração Contínua

```yaml
# Exemplo de pipeline
test:
  script:
    - npm ci
    - npm run test:ci
    - npm run lint
    - npm run type-check
```

### 📊 Relatórios

- **Coverage**: HTML, JSON, LCOV
- **Test Results**: JUnit XML
- **Linting**: ESLint reports

## Manutenção de Testes

### 🔧 Atualizações

1. **Novos Recursos**: Adicionar testes correspondentes
2. **Refatoração**: Atualizar testes conforme necessário
3. **Bugs**: Adicionar testes de regressão
4. **Performance**: Monitorar tempo de execução

### 📚 Documentação

- Manter README atualizado
- Documentar novos padrões
- Explicar decisões de design
- Guias de troubleshooting

## Troubleshooting

### ❌ Problemas Comuns

#### Testes Falhando
```bash
# Verificar logs detalhados
npm test -- --run --reporter=verbose

# Executar teste específico
npm test -- --run src/path/to/test.test.ts
```

#### Cobertura Baixa
```bash
# Verificar relatório de cobertura
npm run test:coverage
open coverage/index.html
```

#### Mocks Não Funcionando
```typescript
// Verificar configuração de mocks
vi.clearAllMocks();
vi.resetAllMocks();
```

### 🆘 Suporte

- Consulte a documentação do Vitest
- Verifique os logs de erro
- Use o modo debug
- Consulte a documentação do projeto

---

**Lembre-se**: Testes são uma ferramenta de qualidade, não apenas uma verificação. Eles documentam o comportamento esperado e facilitam refatorações futuras.
