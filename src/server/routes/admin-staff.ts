import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { staffUsers, staffPto } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export default async function adminStaffRoutes(fastify: FastifyInstance) {
  // List active staff
  fastify.get('/', async (_request, _reply) => {
    const staff = await db.select().from(staffUsers).where(eq(staffUsers.isActive, 1));
    return staff;
  });

  // Create new staff member
  fastify.post<{ Body: { fullName: string; nationality?: string; role?: string; contactInfo?: string } }>(
    '/',
    async (request, reply) => {
      const { fullName, nationality, role, contactInfo } = request.body;
      if (!fullName || !fullName.trim()) {
        return reply.status(400).send({ error: 'fullName is required' });
      }

      const id = crypto.randomUUID();
      const newStaff = {
        id,
        fullName: fullName.trim(),
        nationality: nationality || 'ES',
        role: role || 'Receptionist',
        contactInfo: contactInfo || null,
        isActive: 1
      };

      await db.insert(staffUsers).values(newStaff);
      return reply.status(201).send(newStaff);
    }
  );

  // Update staff member
  fastify.put<{ Params: { id: string }; Body: { fullName?: string; nationality?: string; role?: string; contactInfo?: string } }>(
    '/:id',
    async (request, reply) => {
      const { id } = request.params;
      const { fullName, nationality, role, contactInfo } = request.body;

      const existing = await db.select().from(staffUsers).where(eq(staffUsers.id, id)).get();
      if (!existing) {
        return reply.status(404).send({ error: 'Staff member not found' });
      }

      const updateData: any = {};
      if (fullName !== undefined) updateData.fullName = fullName.trim();
      if (nationality !== undefined) updateData.nationality = nationality;
      if (role !== undefined) updateData.role = role;
      if (contactInfo !== undefined) updateData.contactInfo = contactInfo;

      await db.update(staffUsers).set(updateData).where(eq(staffUsers.id, id));
      const updated = await db.select().from(staffUsers).where(eq(staffUsers.id, id)).get();
      return reply.status(200).send(updated);
    }
  );

  // Delete staff member
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request, reply) => {
      const { id } = request.params;
      const existing = await db.select().from(staffUsers).where(eq(staffUsers.id, id)).get();
      if (!existing) {
        return reply.status(404).send({ error: 'Staff member not found' });
      }

      await db.delete(staffUsers).where(eq(staffUsers.id, id));
      return reply.status(200).send({ success: true });
    }
  );

  // PTO list
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

  // Create PTO
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
