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
      // Backend expects JWT token in query string, not userId
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found for WebSocket connection');
        return;
      }

      this.ws = new WebSocket(`${WS_URL}?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        // Wait for authentication confirmation before notifying
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          // Handle authentication confirmation
          if (data.type === 'authenticated') {
            console.log('WebSocket authenticated:', data.payload);
            this.notifyConnectionChange(true);

            // Now join the room (backend uses roomId, not conversationId)
            this.send({
              type: 'join',
              payload: {
                userId: data.payload.userId,
                roomId: conversationId
              }
            });
          } else {
            this.handleMessage(data);
          }
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

    // Backend expects roomId, not conversationId
    this.send({
      type: 'message',
      payload: {
        content,
        roomId: this.conversationId
      }
    });
  }

  sendTyping(isTyping: boolean): void {
    // Backend doesn't support typing events yet
    // This is a no-op for now
    if (!this.isConnected()) return;
    console.warn('Typing indicators not yet supported by backend');
  }

  markAsRead(messageId: string): void {
    // Backend doesn't support read receipts yet
    // This is a no-op for now
    if (!this.isConnected()) return;
    console.warn('Read receipts not yet supported by backend');
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
        // Backend sends array directly, not wrapped in messages
        const historyMessages = Array.isArray(data.payload) ? data.payload : [];
        // Transform backend format to frontend format
        const transformedHistory = historyMessages.map((msg: any) => this.transformMessage(msg));
        this.historyCallbacks.forEach(cb => cb(transformedHistory));
        break;

      case 'message':
        // Transform backend message format
        const transformedMsg = this.transformMessage(data.payload);
        this.messageCallbacks.forEach(cb => cb(transformedMsg));
        break;

      case 'join':
        console.log('User joined:', data.payload);
        break;

      case 'leave':
        console.log('User left:', data.payload);
        break;

      case 'error':
        console.error('WebSocket error:', data.payload);
        break;

      default:
        console.warn('Unknown WebSocket message type:', data.type);
    }
  }

  private transformMessage(msg: any): Message {
    return {
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
    };
  }

  private notifyConnectionChange(isConnected: boolean): void {
    this.connectionCallbacks.forEach(cb => cb(isConnected));
  }
}
