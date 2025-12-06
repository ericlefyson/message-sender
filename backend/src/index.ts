import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { setupWebSocket } from './websocket';
import messagesRouter from './routes/messages';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import { authenticate } from './middleware/authenticate';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
const server = createServer(app);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Middleware de error handling global
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Setup WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`WebSocket disponível em ws://localhost:${PORT}`);
});