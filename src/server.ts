import app from './app';
import { env } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

/**
 * Server Entry Point
 * Connects to the database and starts the Express server.
 */
async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   💰 Finance Backend API                          ║
  ║                                                   ║
  ║   → Server:  http://localhost:${env.PORT}              ║
  ║   → Docs:    http://localhost:${env.PORT}/api/docs     ║
  ║   → Health:  http://localhost:${env.PORT}/health        ║
  ║   → Mode:    ${env.NODE_ENV.padEnd(12)}                    ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await disconnectDatabase();
        logger.info('Server closed. Goodbye! 👋');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown — timeout exceeded');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason: Error) => {
      logger.error('Unhandled Rejection:', reason);
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
