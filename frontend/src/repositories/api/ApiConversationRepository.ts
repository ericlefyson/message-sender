import type { IConversationRepository } from '../types';
import type { Conversation, Message } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiConversationRepository implements IConversationRepository {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getConversations(): Promise<Conversation[]> {
    // Backend doesn't have a conversations endpoint
    // This would need to be implemented on the backend
    // For now, return empty array or throw error
    console.warn('Backend does not have /api/conversations endpoint');
    return [];
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    // Backend doesn't have a conversations endpoint
    // This would need to be implemented on the backend
    console.warn('Backend does not have /api/conversations/:id endpoint');
    return null;
  }

  async createConversation(otherUserId: string): Promise<Conversation> {
    // Backend doesn't have a conversations endpoint
    // This would need to be implemented on the backend
    console.warn('Backend does not have POST /api/conversations endpoint');
    throw new Error('Conversations endpoint not implemented in backend');
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    // Backend uses roomId instead of conversationId
    const response = await fetch(`${API_URL}/api/messages/${conversationId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar mensagens');
    }

    const messages = await response.json();

    // Transform backend message format to frontend format
    return messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      sender: {
        id: msg.sender.id,
        name: msg.sender.name,
        nickname: msg.sender.email, // Backend uses email instead of nickname
        createdAt: msg.sender.createdAt,
      },
      conversationId: msg.roomId,
      createdAt: msg.createdAt,
      read: false, // Backend doesn't track read status yet
    }));
  }
}
