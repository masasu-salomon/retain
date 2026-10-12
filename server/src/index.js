import { env } from './lib/env.js';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

const server = app.listen(env.port, () => {
  console.log(`Retain API listening on port ${env.port}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
