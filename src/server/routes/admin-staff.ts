import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { staffUsers, staffPto } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export default async function adminStaffRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request, _reply) => {
    const staff = await db.select().from(staffUsers).where(eq(staffUsers.isActive, 1));
    return staff;
  });

  fastify.get('/pto', async (_request, _reply) => {
    const pto = await db.select({
      id: staffPto.id,
      staffId: staffPto.staffId,
      startDate: staffPto.startDate,
      endDate: staffPto.endDate,
      notes: staffPto.notes,
      staffName: staffUsers.fullName
    })
    .from(staffPto)
    .innerJoin(staffUsers, eq(staffPto.staffId, staffUsers.id))
    .orderBy(desc(staffPto.startDate));

    return pto;
  });

  fastify.post<{ Params: { id: string }, Body: { startDate: string, endDate: string, notes?: string } }>(
    '/:id/pto',
    async (request, reply) => {
      const { startDate, endDate, notes } = request.body;
      if (!startDate || !endDate) {
        return reply.status(400).send({ error: 'startDate and endDate required' });
      }

      await db.insert(staffPto).values({
        id: crypto.randomUUID(),
        staffId: request.params.id,
        startDate,
        endDate,
        notes
      });

      return reply.status(201).send({ success: true });
    }
  );
}
