import { FastifyInstance } from 'fastify';
import crypto from 'crypto';

// In-memory set of active authentication tokens
const activeSessions = new Set<string>();

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  return activeSessions.has(token);
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { username?: string; pin?: string } }>('/login', async (request, reply) => {
    const { username, pin } = request.body || {};

    const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
    const expectedPin = (process.env.ADMIN_PIN || '1234').trim();

    if (
      username &&
      username.trim().toLowerCase() === expectedUser &&
      pin &&
      pin.trim() === expectedPin
    ) {
      const token = crypto.randomBytes(32).toString('hex');
      activeSessions.add(token);
      return reply.status(200).send({
        success: true,
        token,
        username: expectedUser
      });
    }

    return reply.status(401).send({ error: 'Invalid Username or PIN' });
  });

  fastify.get('/verify', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;

    if (isValidAdminToken(token)) {
      return { valid: true };
    }

    return reply.status(401).send({ valid: false, error: 'Unauthorized' });
  });

  fastify.post('/logout', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;
    if (token) {
      activeSessions.delete(token);
    }
    return { success: true };
  });
}
