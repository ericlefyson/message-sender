import type { IConversationRepository } from '../types';
import type { Conversation, Message } from '../../types';
import { MockDataStore } from './mockData';

export class MockConversationRepository implements IConversationRepository {
  private store = MockDataStore.getInstance();

  async getConversations(): Promise<Conversation[]> {
    await this.delay(400);
    return this.store.getConversations();
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    await this.delay(200);
    return this.store.getConversationById(id);
  }

  async createConversation(otherUserId: string): Promise<Conversation> {
    await this.delay(300);
    return this.store.createConversation(otherUserId);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    await this.delay(250);
    return this.store.getMessages(conversationId);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
