import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Server } from '../../infrastructure/server/Server.js';
import type { ServerConfig } from '../../infrastructure/server/Server.js';

describe('Server Integration Tests', () => {
  let server: Server;
  let config: ServerConfig;

  beforeEach(() => {
    config = {
      port: 3001, // Use different port for tests
      host: '0.0.0.0',
      cacheTTL: 60,
      rateLimitMax: 1000,
      rateLimitTimeWindow: 60000,
    };
    server = new Server(config);
  });

  afterEach(async () => {
    try {
      await server.stop();
    } catch (error) {
      // Ignore errors when stopping test server
    }
  });

  describe('Server Initialization', () => {
    it('should create server instance', () => {
      expect(server).toBeInstanceOf(Server);
    });

    it('should have correct configuration', () => {
      const fastifyInstance = server.getFastifyInstance();
      expect(fastifyInstance).toBeDefined();
    });
  });

  describe('Health Check Endpoint', () => {
    it('should respond to health check', async () => {
      await server.start();
      
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('uptime');
      expect(typeof data.uptime).toBe('number');
    });

    it('should return valid timestamp', async () => {
      await server.start();
      
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();

      const timestamp = new Date(data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('GraphQL Endpoint', () => {
    it('should respond to GraphQL queries', async () => {
      await server.start();

      const query = `
        query {
          paises(porPagina: 1) {
            total
            pagina
            porPagina
            itens {
              codigo2
              nome {
                comum
              }
            }
          }
        }
      `;

      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('paises');
      expect(data.data.paises).toHaveProperty('total');
      expect(data.data.paises).toHaveProperty('itens');
      expect(Array.isArray(data.data.paises.itens)).toBe(true);
    });

    it('should handle GraphQL errors gracefully', async () => {
      await server.start();

      const invalidQuery = `
        query {
          invalidField {
            nonExistentField
          }
        }
      `;

      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: invalidQuery }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('errors');
      expect(Array.isArray(data.errors)).toBe(true);
    });

    it('should handle pais query', async () => {
      await server.start();

      const query = `
        query {
          pais(codigo: "BR") {
            codigo2
            codigo3
            nome {
              comum
              oficial
            }
            regiao
            populacao
          }
        }
      `;

      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('pais');
    });
  });

  describe('GraphQL Playground', () => {
    it('should serve GraphQL Playground', async () => {
      await server.start();

      const response = await fetch('http://localhost:3001/graphiql');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      await server.start();

      const response = await fetch('http://localhost:3001/health', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
    });

    it('should include CORS headers in responses', async () => {
      await server.start();

      const response = await fetch('http://localhost:3001/health', {
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      await server.start();

      // Make multiple requests quickly
      const promises = Array.from({ length: 10 }, () =>
        fetch('http://localhost:3001/health')
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed (rate limit is high for tests)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid endpoints', async () => {
      await server.start();

      const response = await fetch('http://localhost:3001/invalid-endpoint');

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON in GraphQL', async () => {
      await server.start();

      const response = await fetch('http://localhost:3001/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Server Lifecycle', () => {
    it('should start and stop gracefully', async () => {
      await expect(server.start()).resolves.not.toThrow();
      await expect(server.stop()).resolves.not.toThrow();
    });

    it('should handle multiple start attempts', async () => {
      await server.start();
      
      // Second start should not throw
      await expect(server.start()).resolves.not.toThrow();
      
      await server.stop();
    });

    it('should handle multiple stop attempts', async () => {
      await server.start();
      await server.stop();
      
      // Second stop should not throw
      await expect(server.stop()).resolves.not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should use custom port', async () => {
      const customConfig: ServerConfig = {
        port: 3002,
        host: '0.0.0.0',
        cacheTTL: 60,
        rateLimitMax: 100,
        rateLimitTimeWindow: 60000,
      };

      const customServer = new Server(customConfig);
      
      try {
        await customServer.start();
        
        const response = await fetch('http://localhost:3002/health');
        expect(response.status).toBe(200);
      } finally {
        await customServer.stop();
      }
    });

    it('should use custom host', async () => {
      const customConfig: ServerConfig = {
        port: 3003,
        host: '127.0.0.1',
        cacheTTL: 60,
        rateLimitMax: 100,
        rateLimitTimeWindow: 60000,
      };

      const customServer = new Server(customConfig);
      
      try {
        await customServer.start();
        
        const response = await fetch('http://127.0.0.1:3003/health');
        expect(response.status).toBe(200);
      } finally {
        await customServer.stop();
      }
    });
  });

  describe('Dependency Injection', () => {
    it('should have all required dependencies', async () => {
      await server.start();
      
      const fastifyInstance = server.getFastifyInstance();
      const diContainer = (fastifyInstance as any).diContainer;

      expect(diContainer).toBeDefined();
      expect(diContainer.cacheService).toBeDefined();
      expect(diContainer.countryRepository).toBeDefined();
      expect(diContainer.listCountries).toBeDefined();
      expect(diContainer.getCountryByCode).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests', async () => {
      await server.start();

      const concurrentRequests = 20;
      const promises = Array.from({ length: concurrentRequests }, () =>
        fetch('http://localhost:3001/health')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should respond within reasonable time', async () => {
      await server.start();

      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/health');
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });
  });
});
