import { Server, type ServerConfig } from './infrastructure/server/Server.js';

const config: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  cacheTTL: Number(process.env.CACHE_TTL) || 300, // 5 minutos
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  rateLimitTimeWindow: Number(process.env.RATE_LIMIT_TIME_WINDOW) || 60000, // 1 minuto
};

const server = new Server(config);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Recebido SIGINT, parando servidor...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Recebido SIGTERM, parando servidor...');
  await server.stop();
  process.exit(0);
});

// Iniciar servidor
server.start().catch((error) => {
  console.error('Erro fatal ao iniciar servidor:', error);
  process.exit(1);
});
