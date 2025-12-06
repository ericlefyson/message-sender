import type { IConversationRepository } from '../types';
import type { Conversation, Message } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiConversationRepository implements IConversationRepository {
  private userId: string | null = null;

  setCurrentUserId(userId: string) {
    this.userId = userId;
  }

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/api/conversations`, {
      headers: {
        'Authorization': `Bearer ${this.userId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar conversas');
    }

    return await response.json();
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const response = await fetch(`${API_URL}/api/conversations/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.userId}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  async createConversation(otherUserId: string): Promise<Conversation> {
    const response = await fetch(`${API_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userId}`,
      },
      body: JSON.stringify({ otherUserId }),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar conversa');
    }

    return await response.json();
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${this.userId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar mensagens');
    }

    return await response.json();
  }
}
