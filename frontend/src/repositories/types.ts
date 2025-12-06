import type { User, Conversation, Message } from '../types';

// Repository interfaces - abstract the data layer
export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(name: string, nickname: string, email: string, password: string): Promise<User>;
  logout(): Promise<void>;
}

export interface IUserRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByNickname(nickname: string): Promise<User | null>;
}

export interface IConversationRepository {
  getConversations(): Promise<Conversation[]>;
  getConversationById(id: string): Promise<Conversation | null>;
  createConversation(otherUserId: string): Promise<Conversation>;
  getMessages(conversationId: string): Promise<Message[]>;
}

export interface IWebSocketService {
  connect(userId: string, conversationId: string): void;
  disconnect(): void;
  sendMessage(content: string): void;
  sendTyping(isTyping: boolean): void;
  markAsRead(messageId: string): void;
  onMessage(callback: (message: Message) => void): void;
  onHistory(callback: (messages: Message[]) => void): void;
  onTyping(callback: (isTyping: boolean) => void): void;
  onRead(callback: (messageId: string) => void): void;
  onConnectionChange(callback: (isConnected: boolean) => void): void;
}
