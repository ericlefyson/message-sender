import type { IWebSocketService } from '../types';
import type { Message } from '../../types';
import { MockDataStore } from './mockData';

export class MockWebSocketService implements IWebSocketService {
  private store = MockDataStore.getInstance();
  private connected = false;
  private currentConversationId: string | null = null;
  private currentUserId: string | null = null;

  // Callbacks
  private messageCallbacks: Array<(message: Message) => void> = [];
  private historyCallbacks: Array<(messages: Message[]) => void> = [];
  private typingCallbacks: Array<(isTyping: boolean) => void> = [];
  private readCallbacks: Array<(messageId: string) => void> = [];
  private connectionCallbacks: Array<(isConnected: boolean) => void> = [];

  connect(userId: string, conversationId: string): void {
    this.currentUserId = userId;
    this.currentConversationId = conversationId;

    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      this.notifyConnectionChange(true);

      // Send message history
      const messages = this.store.getMessages(conversationId);
      this.historyCallbacks.forEach(cb => cb(messages));
    }, 500);
  }

  disconnect(): void {
    this.connected = false;
    this.currentConversationId = null;
    this.currentUserId = null;
    this.notifyConnectionChange(false);
  }

  sendMessage(content: string): void {
    if (!this.connected || !this.currentConversationId || !this.currentUserId) {
      console.error('Not connected');
      return;
    }

    // Add message to store
    const message = this.store.addMessage(
      this.currentConversationId,
      content,
      this.currentUserId
    );

    // Simulate message being sent
    setTimeout(() => {
      this.messageCallbacks.forEach(cb => cb(message));

      // Simulate other user responding (50% chance)
      if (Math.random() > 0.5) {
        this.store.simulateIncomingMessage(this.currentConversationId!, 2000);

        // Simulate typing indicator
        setTimeout(() => {
          this.notifyTyping(true);
          setTimeout(() => {
            this.notifyTyping(false);
          }, 1500);
        }, 500);

        // Send the simulated response
        setTimeout(() => {
          const messages = this.store.getMessages(this.currentConversationId!);
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.senderId !== this.currentUserId) {
            this.messageCallbacks.forEach(cb => cb(lastMessage));
          }
        }, 3500);
      }
    }, 100);
  }

  sendTyping(isTyping: boolean): void {
    // In a real app, this would send to server
    // Mock: just log it
    console.log('Typing:', isTyping);
  }

  markAsRead(messageId: string): void {
    if (!this.connected) return;

    this.store.markAsRead(messageId);

    // Notify read callbacks
    setTimeout(() => {
      this.readCallbacks.forEach(cb => cb(messageId));
    }, 100);
  }

  // Register callbacks
  onMessage(callback: (message: Message) => void): void {
    this.messageCallbacks.push(callback);
  }

  onHistory(callback: (messages: Message[]) => void): void {
    this.historyCallbacks.push(callback);
  }

  onTyping(callback: (isTyping: boolean) => void): void {
    this.typingCallbacks.push(callback);
  }

  onRead(callback: (messageId: string) => void): void {
    this.readCallbacks.push(callback);
  }

  onConnectionChange(callback: (isConnected: boolean) => void): void {
    this.connectionCallbacks.push(callback);
  }

  // Private helpers
  private notifyConnectionChange(isConnected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(isConnected));
  }

  private notifyTyping(isTyping: boolean): void {
    this.typingCallbacks.forEach(cb => cb(isTyping));
  }
}
