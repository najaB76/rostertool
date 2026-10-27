import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import fs from 'fs';

import adminRosterRoutes from './routes/admin-roster.js';
import adminVolunteersRoutes from './routes/admin-volunteers.js';
import adminHeadcountRoutes from './routes/admin-headcount.js';
import adminTimeOffRoutes from './routes/admin-timeoff.js';
import adminStaffRoutes from './routes/admin-staff.js';
import portalRoutes from './routes/portal.js';

const fastify = Fastify({ logger: true });

// Basic health check route
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register all API modules
await fastify.register(adminRosterRoutes, { prefix: '/api/admin/roster' });
await fastify.register(adminVolunteersRoutes, { prefix: '/api/admin/volunteers' });
await fastify.register(adminHeadcountRoutes, { prefix: '/api/admin/headcount' });
await fastify.register(adminTimeOffRoutes, { prefix: '/api/admin/time-off' });
await fastify.register(adminStaffRoutes, { prefix: '/api/admin/staff' });
await fastify.register(portalRoutes, { prefix: '/api/portal' });

// In production, serve the Vite static assets
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  await fastify.register(fastifyStatic, {
    root: distPath,
    prefix: '/',
  });

  // SPA fallback for frontend client routing
  fastify.setNotFoundHandler(async (request, reply) => {
    if (request.raw.url && request.raw.url.startsWith('/api')) {
      reply.status(404).send({ error: 'Endpoint not found' });
      return;
    }
    return reply.sendFile('index.html');
  });
}

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Hostel Roster server running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
