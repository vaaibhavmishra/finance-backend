import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Backend API',
      version: '1.0.0',
      description:
        'Finance Data Processing and Access Control Backend — A RESTful API for managing financial records with role-based access control, dashboard analytics, and comprehensive data validation.',
      contact: {
        name: 'Vaibhav Mishra',
        email: 'mishravaibhav12321@gmail.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string' },
            errors: { type: 'object' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Registration, login, and token management' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Financial Records', description: 'CRUD for financial records' },
      { name: 'Dashboard', description: 'Analytics and summary endpoints' },
    ],
  },
  apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
