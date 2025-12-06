import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Realtime Chat API',
      version: '1.0.0',
      description: 'API REST e WebSocket para aplicação de chat em tempo real',
      contact: {
        name: 'API Support',
        email: 'support@realtimechat.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.realtimechat.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT de autenticação'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome do usuário',
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'joao@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Papel do usuário no sistema',
              default: 'user'
            },
            isActive: {
              type: 'boolean',
              description: 'Status de ativação do usuário',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do usuário'
            }
          }
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único da mensagem'
            },
            content: {
              type: 'string',
              description: 'Conteúdo da mensagem',
              example: 'Olá, tudo bem?'
            },
            senderId: {
              type: 'string',
              format: 'uuid',
              description: 'ID do usuário que enviou a mensagem'
            },
            roomId: {
              type: 'string',
              description: 'ID da sala de chat',
              example: 'room-123'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação da mensagem'
            },
            sender: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT Access Token (válido por 1 hora)',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refreshToken: {
              type: 'string',
              description: 'JWT Refresh Token (válido por 7 dias)',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Erro ao processar requisição'
            },
            message: {
              type: 'string',
              description: 'Detalhes do erro (apenas em desenvolvimento)'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticação'
      },
      {
        name: 'Users',
        description: 'Endpoints de gerenciamento de usuários'
      },
      {
        name: 'Messages',
        description: 'Endpoints de mensagens'
      },
      {
        name: 'WebSocket',
        description: 'Documentação do protocolo WebSocket'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/docs/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
