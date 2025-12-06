import { Router } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';

const router = Router();

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Listar conversas do usuário
 *     description: Retorna todas as conversas do usuário autenticado
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversas obtida com sucesso
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Find all conversations where user is participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { userId1: userId },
          { userId2: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        },
        room: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    nickname: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Transform to frontend format
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.userId1 === userId ? conv.user2 : conv.user1;
      const lastMessage = conv.room.messages[0];

      return {
        id: conv.id,
        userId1: conv.userId1,
        userId2: conv.userId2,
        roomId: conv.roomId, // Include roomId for WebSocket
        otherUser,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          sender: lastMessage.sender,
          conversationId: conv.id,
          roomId: conv.roomId,
          createdAt: lastMessage.createdAt,
          read: false, // TODO: implement read status
        } : undefined,
        unreadCount: 0, // TODO: implement unread count
        updatedAt: conv.updatedAt,
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     summary: Buscar conversa por ID
 *     description: Retorna os detalhes de uma conversa específica
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da conversa
 *     responses:
 *       200:
 *         description: Conversa encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Usuário não é participante desta conversa
 *       404:
 *         description: Conversa não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        },
        room: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    nickname: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    // Verify user is participant
    if (conversation.userId1 !== userId && conversation.userId2 !== userId) {
      return res.status(403).json({ error: 'Você não é participante desta conversa' });
    }

    const otherUser = conversation.userId1 === userId ? conversation.user2 : conversation.user1;
    const lastMessage = conversation.room.messages[0];

    const formattedConversation = {
      id: conversation.id,
      userId1: conversation.userId1,
      userId2: conversation.userId2,
      roomId: conversation.roomId, // Include roomId for WebSocket
      otherUser,
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        content: lastMessage.content,
        senderId: lastMessage.senderId,
        sender: lastMessage.sender,
        conversationId: conversation.id,
        roomId: conversation.roomId,
        createdAt: lastMessage.createdAt,
        read: false,
      } : undefined,
      unreadCount: 0,
      updatedAt: conversation.updatedAt,
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Criar nova conversa
 *     description: Cria uma nova conversa entre o usuário autenticado e outro usuário
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otherUserId
 *             properties:
 *               otherUserId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do outro usuário
 *     responses:
 *       201:
 *         description: Conversa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       409:
 *         description: Conversa já existe
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user!.userId;

    if (!otherUserId) {
      return res.status(400).json({ error: 'otherUserId é obrigatório' });
    }

    if (otherUserId === userId) {
      return res.status(400).json({ error: 'Você não pode criar uma conversa consigo mesmo' });
    }

    // Check if other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        nickname: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    if (!otherUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Order user IDs to ensure uniqueness
    const [userId1, userId2] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        userId1,
        userId2,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        }
      }
    });

    if (existingConversation) {
      const responseOtherUser = existingConversation.userId1 === userId ? existingConversation.user2 : existingConversation.user1;

      return res.status(200).json({
        id: existingConversation.id,
        userId1: existingConversation.userId1,
        userId2: existingConversation.userId2,
        roomId: existingConversation.roomId,
        otherUser: responseOtherUser,
        unreadCount: 0,
        updatedAt: existingConversation.updatedAt,
      });
    }

    // Create room first
    const room = await prisma.room.create({
      data: {}
    });

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId1,
        userId2,
        roomId: room.id,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          }
        }
      }
    });

    const responseOtherUser = conversation.userId1 === userId ? conversation.user2 : conversation.user1;

    res.status(201).json({
      id: conversation.id,
      userId1: conversation.userId1,
      userId2: conversation.userId2,
      roomId: conversation.roomId,
      otherUser: responseOtherUser,
      unreadCount: 0,
      updatedAt: conversation.updatedAt,
    });
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    res.status(500).json({ error: 'Erro ao criar conversa' });
  }
});

export default router;
