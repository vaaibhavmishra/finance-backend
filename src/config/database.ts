import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
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
