#!/bin/bash

# Script para executar testes do RestCountries BFF

echo "🧪 Executando testes do RestCountries BFF..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 20+ primeiro."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Função para executar testes
run_tests() {
    local test_type=$1
    local description=$2
    
    echo ""
    echo "🔍 $description"
    echo "=================================="
    
    case $test_type in
        "unit")
            npm run test -- --run src/domain src/application src/graphql/mappers
            ;;
        "integration")
            npm run test -- --run src/__tests__/integration
            ;;
        "all")
            npm run test -- --run
            ;;
        "coverage")
            npm run test:coverage
            ;;
        "watch")
            npm run test -- --watch
            ;;
        *)
            echo "❌ Tipo de teste inválido: $test_type"
            echo "Tipos disponíveis: unit, integration, all, coverage, watch"
            exit 1
            ;;
    esac
}

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo "📋 Uso: $0 [tipo_de_teste]"
    echo ""
    echo "Tipos de teste disponíveis:"
    echo "  unit       - Testes unitários (domínio, aplicação, mappers)"
    echo "  integration - Testes de integração (servidor)"
    echo "  all        - Todos os testes"
    echo "  coverage   - Testes com cobertura de código"
    echo "  watch      - Modo watch para desenvolvimento"
    echo ""
    echo "Exemplos:"
    echo "  $0 unit"
    echo "  $0 integration"
    echo "  $0 all"
    echo "  $0 coverage"
    echo "  $0 watch"
    exit 1
fi

# Executar testes baseado no argumento
case $1 in
    "unit")
        run_tests "unit" "Executando testes unitários"
        ;;
    "integration")
        run_tests "integration" "Executando testes de integração"
        ;;
    "all")
        run_tests "all" "Executando todos os testes"
        ;;
    "coverage")
        run_tests "coverage" "Executando testes com cobertura"
        ;;
    "watch")
        run_tests "watch" "Iniciando modo watch"
        ;;
    *)
        echo "❌ Tipo de teste inválido: $1"
        echo "Tipos disponíveis: unit, integration, all, coverage, watch"
        exit 1
        ;;
esac

# Verificar se os testes passaram
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Testes executados com sucesso!"
else
    echo ""
    echo "❌ Alguns testes falharam!"
    exit 1
fi
