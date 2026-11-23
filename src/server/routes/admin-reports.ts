import { FastifyInstance } from 'fastify';
import { reportingService } from '../services/reporting-service.js';

export default async function adminReportsRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { startDate?: string; endDate?: string } }>('/', async (request, reply) => {
    try {
      const { startDate, endDate } = request.query;
      const data = await reportingService.getReports(startDate, endDate);
      return data;
    } catch (e: any) {
      return reply.status(500).send({ error: e.message });
    }
  });
}
