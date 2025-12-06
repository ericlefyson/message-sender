import type { IWebSocketService } from '../types';
import type { Message, WebSocketMessage } from '../../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export class ApiWebSocketService implements IWebSocketService {
  private ws: WebSocket | null = null;
  private conversationId: string | null = null;
  private reconnectTimeout: number | undefined;

  // Callbacks
  private messageCallbacks: Array<(message: Message) => void> = [];
  private historyCallbacks: Array<(messages: Message[]) => void> = [];
  private typingCallbacks: Array<(isTyping: boolean) => void> = [];
  private readCallbacks: Array<(messageId: string) => void> = [];
  private connectionCallbacks: Array<(isConnected: boolean) => void> = [];

  connect(userId: string, conversationId: string): void {
    this.conversationId = conversationId;

    try {
      this.ws = new WebSocket(`${WS_URL}?userId=${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.notifyConnectionChange(true);

        // Join the conversation room
        this.send({
          type: 'join',
          payload: { conversationId }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifyConnectionChange(false);

        // Auto-reconnect after 3 seconds
        this.reconnectTimeout = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          this.connect(userId, conversationId);
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(content: string): void {
    if (!this.isConnected()) {
      console.error('WebSocket is not connected');
      return;
    }

    this.send({
      type: 'message',
      payload: {
        content,
        conversationId: this.conversationId
      }
    });
  }

  sendTyping(isTyping: boolean): void {
    if (!this.isConnected()) return;

    this.send({
      type: 'typing',
      payload: {
        conversationId: this.conversationId,
        isTyping
      }
    });
  }

  markAsRead(messageId: string): void {
    if (!this.isConnected()) return;

    this.send({
      type: 'read',
      payload: { messageId }
    });
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
  private isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private send(data: WebSocketMessage): void {
    if (this.ws && this.isConnected()) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(data: WebSocketMessage): void {
    switch (data.type) {
      case 'history':
        this.historyCallbacks.forEach(cb => cb(data.payload.messages || []));
        break;

      case 'message':
        this.messageCallbacks.forEach(cb => cb(data.payload));
        break;

      case 'typing':
        this.typingCallbacks.forEach(cb => cb(data.payload.isTyping));
        break;

      case 'read':
        this.readCallbacks.forEach(cb => cb(data.payload.messageId));
        break;

      case 'error':
        console.error('WebSocket error:', data.payload);
        break;
    }
  }

  private notifyConnectionChange(isConnected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(isConnected));
  }
}
