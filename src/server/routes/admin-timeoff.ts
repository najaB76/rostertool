import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { timeOffRequests, volunteers } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function adminTimeOffRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { status?: string } }>('/', async (request, _reply) => {
    const { status } = request.query;
    
    let query = db.select({
      id: timeOffRequests.id,
      volunteerId: timeOffRequests.volunteerId,
      date: timeOffRequests.date,
      status: timeOffRequests.status,
      reason: timeOffRequests.reason,
      volunteerName: volunteers.fullName,
      volunteerNationality: volunteers.nationality
    })
    .from(timeOffRequests)
    .leftJoin(volunteers, eq(timeOffRequests.volunteerId, volunteers.id))
    .orderBy(desc(timeOffRequests.createdAt)) as any;

    if (status) {
       query = query.where(eq(timeOffRequests.status, status));
    }

    return await query;
  });

  fastify.post<{ Params: { id: string }, Body: { status: 'Approved' | 'Denied' } }>(
    '/:id/review',
    async (request, reply) => {
      const { status } = request.body;
      if (status !== 'Approved' && status !== 'Denied') {
        return reply.status(400).send({ error: 'Status must be Approved or Denied' });
      }

      await db.update(timeOffRequests)
        .set({ status, reviewedAt: new Date().toISOString() })
        .where(eq(timeOffRequests.id, request.params.id));
        
      return { success: true };
    }
  );
}
