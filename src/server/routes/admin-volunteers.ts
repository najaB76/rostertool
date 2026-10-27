import { FastifyInstance } from 'fastify';
import { volunteerService } from '../services/volunteer-service.js';

export default async function adminVolunteersRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { status?: string } }>('/', async (request, _reply) => {
    const { status } = request.query;
    const vols = await volunteerService.getVolunteers(status);
    return vols;
  });

  fastify.post<{ Body: any }>('/', async (request, reply) => {
    try {
      const vol = await volunteerService.createVolunteer(request.body);
      return reply.status(201).send(vol);
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  fastify.put<{ Params: { id: string }, Body: any }>('/:id', async (request, reply) => {
    try {
      const vol = await volunteerService.updateVolunteer(request.params.id, request.body);
      return vol;
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  fastify.post<{ Params: { id: string }, Body: { rating: number; reviewNotes: string; futureAcceptanceRecommendation: string } }>(
    '/:id/depart',
    async (request, reply) => {
      const { rating, reviewNotes, futureAcceptanceRecommendation } = request.body;
      if (!rating || !futureAcceptanceRecommendation) {
        return reply.status(400).send({ error: 'rating and futureAcceptanceRecommendation required' });
      }
      try {
        await volunteerService.departVolunteer(request.params.id, rating, reviewNotes, futureAcceptanceRecommendation);
        return { success: true };
      } catch (e: any) {
        return reply.status(400).send({ error: e.message });
      }
    }
  );

  fastify.post<{ Params: { id: string } }>('/:id/reset-token', async (request, reply) => {
    try {
      const token = await volunteerService.resetToken(request.params.id);
      return { magicLinkToken: token, portalUrl: `/portal?token=${token}` };
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });
}
