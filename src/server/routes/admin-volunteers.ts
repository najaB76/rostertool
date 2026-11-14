import { FastifyInstance } from 'fastify';
import { volunteerService } from '../services/volunteer-service.js';

export default async function adminVolunteersRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { status?: string; inHouseStart?: string; inHouseEnd?: string } }>('/', async (request, _reply) => {
    const { status, inHouseStart, inHouseEnd } = request.query;
    const vols = await volunteerService.getVolunteers(status, inHouseStart, inHouseEnd);
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

  fastify.get('/sources', async (_request, _reply) => {
    return await volunteerService.getApplicationSources();
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const vol = await volunteerService.getVolunteerById(request.params.id);
    if (!vol) {
      return reply.status(404).send({ error: 'Volunteer not found' });
    }
    return vol;
  });

  fastify.post<{ Params: { id: string }, Body: any }>('/:id', async (request, reply) => {
    try {
      const vol = await volunteerService.updateVolunteer(request.params.id, request.body);
      return vol;
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

  fastify.post<{ Params: { id: string }, Body: { 
    departureRating?: number; 
    departureNotes?: string; 
    rehireStatus?: string;
    rating?: number;
    reviewNotes?: string;
    futureAcceptanceRecommendation?: string;
  } }>(
    '/:id/depart',
    async (request, reply) => {
      const rating = request.body.departureRating ?? request.body.rating;
      const notes = request.body.departureNotes ?? request.body.reviewNotes ?? '';
      const rehire = request.body.rehireStatus ?? request.body.futureAcceptanceRecommendation ?? 'Accept';

      if (!rating) {
        return reply.status(400).send({ error: 'departureRating (1-5) is required' });
      }
      try {
        await volunteerService.departVolunteer(request.params.id, rating, notes, rehire);
        return { success: true };
      } catch (e: any) {
        return reply.status(400).send({ error: e.message });
      }
    }
  );

  fastify.get<{ Params: { id: string } }>('/:id/stays', async (request, reply) => {
    try {
      const stays = await volunteerService.getVolunteerStays(request.params.id);
      return stays;
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  fastify.post<{ Params: { id: string }, Body: { arrivalDate: string; departureDate?: string | null; noEndDate?: boolean } }>(
    '/:id/reactivate',
    async (request, reply) => {
      const { arrivalDate, departureDate, noEndDate } = request.body;
      if (!arrivalDate) {
        return reply.status(400).send({ error: 'arrivalDate is required to re-activate a volunteer' });
      }
      try {
        const vol = await volunteerService.reactivateVolunteer(request.params.id, { arrivalDate, departureDate, noEndDate });
        return vol;
      } catch (e: any) {
        return reply.status(400).send({ error: e.message });
      }
    }
  );

  fastify.post<{ Params: { id: string }, Body: { arrivalDate: string; departureDate: string; primaryRole?: string; notes?: string } }>(
    '/:id/accept',
    async (request, reply) => {
      const { arrivalDate, departureDate, primaryRole, notes } = request.body;
      if (!arrivalDate || !departureDate) {
        return reply.status(400).send({ error: 'arrivalDate and departureDate are required to accept an applicant' });
      }
      try {
        const vol = await volunteerService.acceptVolunteer(request.params.id, { arrivalDate, departureDate, primaryRole, notes });
        return vol;
      } catch (e: any) {
        return reply.status(400).send({ error: e.message });
      }
    }
  );

  fastify.post<{ Params: { id: string } }>('/:id/activate', async (request, reply) => {
    try {
      const vol = await volunteerService.activateVolunteer(request.params.id);
      return vol;
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  fastify.post<{ Params: { id: string }, Body?: { cancellationReason?: string } }>('/:id/cancel', async (request, reply) => {
    try {
      const reason = request.body?.cancellationReason;
      const vol = await volunteerService.cancelVolunteer(request.params.id, reason);
      return vol;
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  fastify.post<{ Params: { id: string } }>('/:id/reset-token', async (request, reply) => {
    try {
      const token = await volunteerService.resetToken(request.params.id);
      return { magicLinkToken: token, portalUrl: `/portal?token=${token}` };
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });
}
