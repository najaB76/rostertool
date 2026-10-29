import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { db } from '../db/client.js';
import { adminUsers } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { getSessionFromToken } from './auth.js';

export default async function adminUsersRoutes(fastify: FastifyInstance) {
  // Pre-handler auth check
  fastify.addHook('preHandler', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (request.query as any)?.token;
    const session = getSessionFromToken(token);
    if (!session) {
      return reply.status(401).send({ error: 'Unauthorized: Admin authentication required' });
    }
    (request as any).session = session;
  });

  // List all admin accounts
  fastify.get('/', async (_request, _reply) => {
    const list = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        createdAt: adminUsers.createdAt
      })
      .from(adminUsers)
      .orderBy(desc(adminUsers.createdAt));

    return list;
  });

  // Create admin account
  fastify.post<{ Body: { username?: string; pin?: string } }>('/', async (request, reply) => {
    const { username, pin } = request.body || {};

    if (!username || !username.trim()) {
      return reply.status(400).send({ error: 'Username is required' });
    }
    if (!pin || pin.trim().length < 4) {
      return reply.status(400).send({ error: 'PIN must be at least 4 digits' });
    }

    const cleanUser = username.trim().toLowerCase();

    // Check existing
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(sql`lower(${adminUsers.username})`, cleanUser))
      .get();

    if (existing) {
      return reply.status(400).send({ error: `Username "${username}" already exists` });
    }

    const id = crypto.randomUUID();
    const newUser = {
      id,
      username: username.trim(),
      pin: pin.trim()
    };

    await db.insert(adminUsers).values(newUser);

    return reply.status(201).send({
      id,
      username: newUser.username,
      createdAt: new Date().toISOString()
    });
  });

  // Update admin account
  fastify.put<{ Params: { id: string }; Body: { username?: string; pin?: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const { username, pin } = request.body || {};

    const user = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).get();
    if (!user) {
      return reply.status(404).send({ error: 'Admin user not found' });
    }

    const updates: any = {};
    if (username && username.trim()) {
      const cleanUser = username.trim().toLowerCase();
      const existing = await db
        .select()
        .from(adminUsers)
        .where(eq(sql`lower(${adminUsers.username})`, cleanUser))
        .get();

      if (existing && existing.id !== id) {
        return reply.status(400).send({ error: `Username "${username}" is already taken` });
      }
      updates.username = username.trim();
    }

    if (pin && pin.trim()) {
      if (pin.trim().length < 4) {
        return reply.status(400).send({ error: 'PIN must be at least 4 digits' });
      }
      updates.pin = pin.trim();
    }

    if (Object.keys(updates).length > 0) {
      await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id));
    }

    const updated = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).get();
    return reply.status(200).send({
      id: updated!.id,
      username: updated!.username,
      createdAt: updated!.createdAt
    });
  });

  // Delete admin account
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const session = (request as any).session;

    if (id === session.userId) {
      return reply.status(400).send({ error: 'Cannot delete your own administrative account while logged in' });
    }

    const countRes = await db.select({ count: sql<number>`count(*)` }).from(adminUsers).get();
    if ((countRes?.count ?? 0) <= 1) {
      return reply.status(400).send({ error: 'Cannot delete the sole administrator account' });
    }

    const existing = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).get();
    if (!existing) {
      return reply.status(404).send({ error: 'Admin user not found' });
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return reply.status(200).send({ success: true });
  });
}
