import { FastifyInstance } from 'fastify';
import { reportingService } from '../services/reporting-service.js';

export default async function adminReportsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request, reply) => {
    try {
      const data = await reportingService.getReports();
      return data;
    } catch (e: any) {
      return reply.status(500).send({ error: e.message });
    }
  });
}
