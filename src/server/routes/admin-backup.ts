import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

export default async function adminBackupRoutes(fastify: FastifyInstance) {
  fastify.get('/export', async (_request, reply) => {
    const dbPath = path.resolve(process.cwd(), 'data/rostertool.sqlite');
    if (!fs.existsSync(dbPath)) {
      return reply.status(404).send({ error: 'Database file not found' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `rostertool-backup-${timestamp}.sqlite`;

    const stream = fs.createReadStream(dbPath);
    return reply
      .header('Content-Type', 'application/octet-stream')
      .header('Content-Disposition', `attachment; filename="${filename}"`)
      .send(stream);
  });
}
