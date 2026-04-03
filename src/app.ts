import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/environment';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter.middleware';

// Route imports
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import recordRoutes from './routes/record.routes';
import userRoutes from './routes/user.routes';

const app: Express = express();

// ===========================================
// Global Middleware
// ===========================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression() as unknown as express.RequestHandler);

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(generalLimiter);

// ===========================================
// API Documentation
// ===========================================
app.use(
  '/api/docs',
  swaggerUi.serve as unknown as express.RequestHandler[],
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Finance API Documentation',
  }) as unknown as express.RequestHandler,
);

// JSON spec endpoint
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ===========================================
// Health Check
// ===========================================
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Backend API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

// ===========================================
// API Routes
// ===========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// ===========================================
// Error Handling
// ===========================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
