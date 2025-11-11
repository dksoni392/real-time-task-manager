import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real-Time Task Management API',
      version: '1.0.0',
      description: 'API documentation for the real-time task management system.',
    },
    // This part is crucial for JWT
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // This part makes the 'Authorize' button work globally
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: 'http://localhost:3000/api/v1', // Your local dev server
      },
      {
        url: 'https://real-time-task-manager-ge6t.onrender.com/api/v1', // Your production server
      },
    ],
  },
  // This tells swagger-jsdoc where to find your API annotations
  apis: [
    './src/api/routes/*.ts',
    './src/api/dtos/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Serve the Swagger UI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  console.log('Swagger docs available at /api-docs');
};