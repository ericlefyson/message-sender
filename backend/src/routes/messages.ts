import { Router } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';

const router = Router();

/**
 * @swagger
 * /api/messages/{roomId}:
 *   get:
 *     summary: Buscar mensagens de uma sala
 *     description: Retorna todas as mensagens de uma sala específica, ordenadas por data de criação
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sala de chat
 *         example: room-123
 *     responses:
 *       200:
 *         description: Mensagens obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: roomId é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Buscar mensagens de uma sala
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId || typeof roomId !== 'string') {
      return res.status(400).json({ error: 'roomId é obrigatório' });
    }

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Criar nova mensagem
 *     description: Cria uma nova mensagem em uma sala (opcional - o WebSocket já faz isso)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - roomId
 *             properties:
 *               content:
 *                 type: string
 *                 description: Conteúdo da mensagem
 *                 example: Olá, tudo bem?
 *               roomId:
 *                 type: string
 *                 description: ID da sala de chat
 *                 example: room-123
 *     responses:
 *       201:
 *         description: Mensagem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Dados inválidos ou faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Criar uma nova mensagem (via REST - opcional, pois o WebSocket já faz isso)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { content, roomId } = req.body;
    const senderId = req.user!.userId; // Usar userId do token autenticado

    if (!content || !roomId) {
      return res.status(400).json({
        error: 'content e roomId são obrigatórios'
      });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        roomId
      },
      include: { sender: true }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

export default router;