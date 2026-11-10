import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { db } from '../db/client.js';
import { adminUsers } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

export interface AdminSession {
  userId: string;
  username: string;
  lastActiveAt: number;
}

// 30 minutes inactivity timeout
export const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

// In-memory map of active authentication tokens -> session details
export const activeSessions = new Map<string, AdminSession>();

export function getSessionFromToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  // Check inactivity timeout
  const now = Date.now();
  if (now - session.lastActiveAt > SESSION_INACTIVITY_TIMEOUT_MS) {
    activeSessions.delete(token);
    return null;
  }

  // Refresh sliding expiration
  session.lastActiveAt = now;
  return session;
}

export function isValidAdminToken(token: string | undefined): boolean {
  return !!getSessionFromToken(token);
}

export async function requireAdminAuth(request: any, reply: any) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;
  const session = getSessionFromToken(token);
  if (!session) {
    return reply.status(401).send({ error: 'Unauthorized: Session expired or invalid' });
  }
  request.session = session;
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { username?: string; pin?: string } }>('/login', async (request, reply) => {
    const { username, pin } = request.body || {};

    if (!username || !pin) {
      return reply.status(401).send({ error: 'Username and PIN are required' });
    }

    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pin.trim();

    // Query admin_users table
    const user = await db
      .select()
      .from(adminUsers)
      .where(eq(sql`lower(${adminUsers.username})`, cleanUser))
      .get();

    if (user && user.pin === cleanPin) {
      const token = crypto.randomBytes(32).toString('hex');
      const session: AdminSession = { 
        userId: user.id, 
        username: user.username,
        lastActiveAt: Date.now()
      };
      activeSessions.set(token, session);

      return reply.status(200).send({
        success: true,
        token,
        username: user.username,
        userId: user.id
      });
    }

    return reply.status(401).send({ error: 'Invalid Username or PIN' });
  });

  fastify.get('/verify', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;

    const session = getSessionFromToken(token);
    if (session) {
      return { valid: true, user: { userId: session.userId, username: session.username } };
    }

    return reply.status(401).send({ valid: false, error: 'Unauthorized: Session expired or invalid' });
  });

  fastify.post('/logout', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;
    if (token) {
      activeSessions.delete(token);
    }
    return { success: true };
  });

  // Self-service PIN change
  fastify.post<{ Body: { currentPin?: string; newPin?: string } }>('/change-pin', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;

    const session = getSessionFromToken(token);
    if (!session) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { currentPin, newPin } = request.body || {};
    if (!currentPin || !newPin) {
      return reply.status(400).send({ error: 'Current PIN and New PIN are required' });
    }

    if (newPin.trim().length < 4) {
      return reply.status(400).send({ error: 'New PIN must be at least 4 digits' });
    }

    // Check current PIN against database
    const user = await db.select().from(adminUsers).where(eq(adminUsers.id, session.userId)).get();
    if (!user || user.pin !== currentPin.trim()) {
      return reply.status(400).send({ error: 'Current PIN is incorrect' });
    }

    // Update PIN
    await db.update(adminUsers).set({ pin: newPin.trim() }).where(eq(adminUsers.id, session.userId));

    return reply.status(200).send({ success: true, message: 'PIN changed successfully' });
  });
}
