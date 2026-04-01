import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query} — ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

/**
 * Connect to the database with retry logic
 */
export async function connectDatabase(): Promise<void> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await prisma.$connect();
      logger.info('✅ Database connected successfully');
      return;
    } catch (error) {
      logger.error(`❌ Database connection attempt ${attempt}/${MAX_RETRIES} failed`);
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

/**
 * Gracefully disconnect from the database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('🔌 Database disconnected');
}

export { prisma };
