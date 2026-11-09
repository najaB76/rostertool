import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import adminBackupRoutes from '../../src/server/routes/admin-backup.js';

describe('Admin Data Backup API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(adminBackupRoutes, { prefix: '/api/admin/backup' });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('GET /api/admin/backup/export - streams SQLite database backup file', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/admin/backup/export'
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/octet-stream');
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="rostertool-backup-.*\.sqlite"/);
    expect(res.rawPayload.length).toBeGreaterThan(0);
  });
});
