import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';
import { setupWebSocket } from './websocket';
import messagesRouter from './routes/messages';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import conversationsRouter from './routes/conversations';
import { authenticate } from './middleware/authenticate';
import { swaggerSpec } from './config/swagger';
import { validateEnvironment, env } from './config/env';
import prisma from './lib/prisma';

// Validate environment variables at startup
try {
  validateEnvironment();
  console.log('✓ Environment variables validated successfully');
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error((error as Error).message);
  process.exit(1);
}

const app = express();
const server = createServer(app);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for Swagger UI
  crossOriginEmbedderPolicy: false,
}));

// Middlewares
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without origin (Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('CORS blocked for origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// Request size limit to prevent large payload attacks
app.use(express.json({ limit: '10mb' }));

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Realtime Chat API Documentation'
}));

// Rota para obter o JSON da especificação OpenAPI
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rotas REST
// Rota de autenticação (pública)
app.use('/api/auth', authRouter);

// Rotas protegidas (requerem autenticação)
app.use('/api/messages', authenticate, messagesRouter);
app.use('/api/users', authenticate, usersRouter);
app.use('/api/conversations', authenticate, conversationsRouter);

// Health check endpoint with database connectivity test
app.get('/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    database: 'unknown',
  };

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
    res.status(200).json(health);
  } catch (error) {
    health.status = 'degraded';
    health.database = 'disconnected';
    res.status(503).json(health);
  }
});

// Global error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: env.IS_DEVELOPMENT ? err.message : undefined
  });
});

// Setup WebSocket
setupWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`✓ Server running on port ${env.PORT}`);
  console.log(`✓ WebSocket available at ws://localhost:${env.PORT}`);
  console.log(`✓ Environment: ${env.NODE_ENV}`);
});