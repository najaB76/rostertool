import { FastifyInstance } from 'fastify';
import { headcountService } from '../services/headcount-service.js';

export default async function adminHeadcountRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { startDate: string, endDate: string } }>('/', async (request, reply) => {
    const { startDate, endDate } = request.query;
    if (!startDate || !endDate) {
      return reply.status(400).send({ error: 'startDate and endDate are required' });
    }
    const days = await headcountService.getDailyHeadcounts(startDate, endDate);
    return days;
  });
}
