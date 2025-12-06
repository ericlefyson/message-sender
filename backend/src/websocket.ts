import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import prisma from './lib/prisma';
import { verifyAccessToken } from './utils/jwt';

interface User {
  id: string;
  name: string;
  createdAt: Date;
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  roomId: string;
}

interface MessagePayload {
  content: string;
  senderId: string;
  roomId: string;
}

interface JoinPayload {
  userId: string;
  roomId: string;
  name?: string;
}

interface LeavePayload {
  userId: string;
}

type MessageWithSender = Message & { sender: User };

interface ChatMessage {
  type: 'message' | 'join' | 'leave' | 'history' | 'error';
  payload: MessageWithSender | MessageWithSender[] | JoinPayload | LeavePayload | string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  roomId: string;
  authenticatedUserId: string;
  email: string;
  role: string;
}

const clients: Map<WebSocket, ConnectedClient> = new Map();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    console.log('Nova tentativa de conexão WebSocket');

    // ETAPA 1: Validar JWT no handshake
    let authenticatedUserId: string;
    let userEmail: string;
    let userRole: string;

    try {
      // Extrair token da query string
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        console.log('Conexão rejeitada: token ausente');
        ws.send(JSON.stringify({
          type: 'error',
          payload: 'Token de autenticação é obrigatório'
        }));
        ws.close(4001, 'Token ausente');
        return;
      }

      // Validar token JWT
      const decoded = verifyAccessToken(token);
      authenticatedUserId = decoded.userId;
      userEmail = decoded.email;
      userRole = decoded.role;

      console.log(`WebSocket autenticado: ${userEmail} (${authenticatedUserId})`);

    } catch (error) {
      console.log('Conexão rejeitada: token inválido', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: 'Token inválido ou expirado'
      }));
      ws.close(4002, 'Token inválido');
      return;
    }

    // ETAPA 2: Enviar confirmação de autenticação
    ws.send(JSON.stringify({
      type: 'authenticated',
      payload: {
        userId: authenticatedUserId,
        email: userEmail
      }
    }));

    // ETAPA 3: Handler de mensagens
    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'join':
            await handleJoin(ws, message.payload as JoinPayload, authenticatedUserId, userEmail, userRole);
            break;
          case 'message':
            await handleMessage(ws, message.payload as MessagePayload, authenticatedUserId);
            break;
          default:
            ws.send(JSON.stringify({
              type: 'error',
              payload: 'Tipo de mensagem desconhecido'
            }));
        }
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: 'Erro ao processar mensagem'
        }));
      }
    });

    // ETAPA 4: Handler de desconexão
    ws.on('close', () => {
      const client = clients.get(ws);
      if (client) {
        console.log(`WebSocket desconectado: ${client.email}`);
        broadcastToRoom(client.roomId, {
          type: 'leave',
          payload: { userId: client.authenticatedUserId }
        }, ws);
        clients.delete(ws);
      }
    });

    ws.on('error', (error) => {
      console.error('Erro no WebSocket:', error);
    });
  });

  return wss;
}

async function handleJoin(
  ws: WebSocket,
  payload: JoinPayload,
  authenticatedUserId: string,
  email: string,
  role: string
) {
  const { userId, roomId } = payload;

  // SEGURANÇA: Validar que userId do payload === userId autenticado
  if (userId !== authenticatedUserId) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: 'Você não pode entrar como outro usuário'
    }));
    return;
  }

  // Verificar se usuário existe
  const user = await prisma.user.findUnique({
    where: { id: authenticatedUserId }
  });

  if (!user) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: 'Usuário não encontrado'
    }));
    return;
  }

  // Registrar cliente autenticado
  clients.set(ws, {
    ws,
    userId: authenticatedUserId,
    roomId,
    authenticatedUserId,
    email,
    role
  });

  // Buscar histórico de mensagens
  const messages = await prisma.message.findMany({
    where: { roomId },
    include: { sender: true },
    orderBy: { createdAt: 'asc' },
    take: 50
  });

  // Enviar histórico para o cliente que entrou
  ws.send(JSON.stringify({
    type: 'history',
    payload: messages
  }));

  // Notificar outros da sala
  broadcastToRoom(roomId, {
    type: 'join',
    payload: {
      userId: authenticatedUserId,
      name: user.name
    }
  }, ws);
}

async function handleMessage(
  _ws: WebSocket,
  payload: MessagePayload,
  authenticatedUserId: string
) {
  const { content, roomId } = payload;
  // IGNORAR senderId do payload - usar sempre authenticatedUserId!

  if (!content || !roomId) {
    _ws.send(JSON.stringify({
      type: 'error',
      payload: 'content e roomId são obrigatórios'
    }));
    return;
  }

  // Criar sala se não existir (upsert)
  await prisma.room.upsert({
    where: { id: roomId },
    update: {},
    create: { id: roomId }
  });

  // Persistir mensagem com senderId autenticado
  const message = await prisma.message.create({
    data: {
      content,
      senderId: authenticatedUserId, // ← SEMPRE usar ID autenticado!
      roomId
    },
    include: { sender: true }
  });

  // Broadcast para todos na sala (incluindo o remetente)
  broadcastToRoom(roomId, {
    type: 'message',
    payload: message
  });
}

function broadcastToRoom(roomId: string, message: ChatMessage, exclude?: WebSocket) {
  const messageStr = JSON.stringify(message);

  clients.forEach((client, clientWs) => {
    if (client.roomId === roomId && clientWs.readyState === WebSocket.OPEN) {
      // Se exclude for definido, não enviar para o WebSocket excluído
      if (!exclude || clientWs !== exclude) {
        clientWs.send(messageStr);
      }
    }
  });
}