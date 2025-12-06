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
    const response = await fetch(`${API_URL}/api/conversations`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar conversas');
    }

    return await response.json();
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const response = await fetch(`${API_URL}/api/conversations/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Falha ao carregar conversa');
    }

    return await response.json();
  }

  async createConversation(otherUserId: string): Promise<Conversation> {
    const response = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otherUserId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Falha ao criar conversa');
    }

    return await response.json();
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
        nickname: msg.sender.nickname,
        email: msg.sender.email,
        role: msg.sender.role,
        isActive: msg.sender.isActive,
        createdAt: msg.sender.createdAt,
      },
      conversationId: msg.roomId,
      createdAt: msg.createdAt,
      read: false, // Backend doesn't track read status yet
    }));
  }
}
