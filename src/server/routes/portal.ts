import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/client.js';
import { volunteers, shiftAssignments, shiftDefinitions, timeOffRequests } from '../db/schema.js';
import { eq, and, gte, desc } from 'drizzle-orm';
import crypto from 'crypto';

async function authenticatePortal(request: FastifyRequest, reply: FastifyReply) {
  const token = (request.query as any).token;
  if (!token) {
    return reply.status(401).send({ error: 'Missing magic link token' });
  }

  const vol = await db.select().from(volunteers).where(eq(volunteers.magicLinkToken, token)).get();
  if (!vol) {
    return reply.status(401).send({ error: 'Invalid or revoked token' });
  }
  
  if (vol.status !== 'Active' && vol.status !== 'Accepted') {
    return reply.status(403).send({ error: 'Portal access is only available to active volunteers' });
  }

  (request as any).volunteer = vol;
}

export default async function portalRoutes(fastify: FastifyInstance) {
  fastify.get('/', { preHandler: authenticatePortal }, async (_request, _reply) => {
     return { success: true };
  });

  fastify.get('/me', { preHandler: authenticatePortal }, async (request, _reply) => {
    const vol = (request as any).volunteer;
    
    // Get upcoming shifts
    const today = new Date().toISOString().split('T')[0];
    const upcoming = await db.select({
      id: shiftAssignments.id,
      date: shiftAssignments.date,
      shiftName: shiftDefinitions.name,
      startTime: shiftDefinitions.startTime,
      endTime: shiftDefinitions.endTime
    })
    .from(shiftAssignments)
    .innerJoin(shiftDefinitions, eq(shiftAssignments.shiftDefinitionId, shiftDefinitions.id))
    .where(and(eq(shiftAssignments.volunteerId, vol.id), gte(shiftAssignments.date, today)))
    .orderBy(shiftAssignments.date);

    // Get time off requests
    const timeOff = await db.select().from(timeOffRequests).where(eq(timeOffRequests.volunteerId, vol.id)).orderBy(desc(timeOffRequests.createdAt));

    return {
      volunteer: vol,
      myUpcomingShifts: upcoming,
      myTimeOffRequests: timeOff,
      hostelWeeklyRoster: null // Omitted for brevity, but would fetch the grid here
    };
  });

  fastify.post<{ Body: { date: string, reason: string } }>('/time-off', { preHandler: authenticatePortal }, async (request, reply) => {
    const vol = (request as any).volunteer;
    const { date, reason } = request.body;

    if (!date) {
      return reply.status(400).send({ error: 'Date is required' });
    }

    await db.insert(timeOffRequests).values({
      id: crypto.randomUUID(),
      volunteerId: vol.id,
      date,
      reason,
      status: 'Pending'
    });

    return reply.status(201).send({ success: true });
  });
}
