#!/bin/bash

# Script de configuração inicial do projeto RestCountries BFF

echo "🚀 Configurando RestCountries BFF GraphQL..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 20+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js versão 20+ é necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Verificar tipos TypeScript
echo "🔍 Verificando tipos TypeScript..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ Erro na verificação de tipos"
    exit 1
fi

echo "✅ Tipos TypeScript verificados"

# Executar linting
echo "🧹 Executando linting..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Problemas de linting encontrados. Execute 'npm run lint:fix' para corrigir"
fi

# Executar testes
echo "🧪 Executando testes..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Testes falharam"
    exit 1
fi

echo "✅ Todos os testes passaram"

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    exit 1
fi

echo "✅ Build concluído com sucesso"

echo ""
echo "🎉 Configuração concluída com sucesso!"
echo ""
echo "📋 Comandos disponíveis:"
echo "  npm run dev          - Executar em modo desenvolvimento"
echo "  npm start           - Executar versão de produção"
echo "  npm test            - Executar testes"
echo "  npm run lint:fix    - Corrigir problemas de linting"
echo ""
echo "🌐 URLs importantes:"
echo "  GraphQL Playground: http://localhost:3000/graphiql"
echo "  GraphQL Endpoint:   http://localhost:3000/graphql"
echo "  Health Check:       http://localhost:3000/health"
echo ""
echo "📚 Consulte o README.md para mais informações e exemplos de queries"
