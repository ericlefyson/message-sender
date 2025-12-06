import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message, WebSocketMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

interface UseWebSocketOptions {
  conversationId: string | null;
  userId: string | null;
}

export function useWebSocket({ conversationId, userId }: UseWebSocketOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  const connect = useCallback(() => {
    if (!userId || !conversationId) return;

    try {
      const ws = new WebSocket(`${WS_URL}?userId=${userId}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Join the conversation room
        ws.send(JSON.stringify({
          type: 'join',
          payload: { conversationId }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          switch (data.type) {
            case 'history':
              setMessages(data.payload.messages || []);
              break;

            case 'message':
              setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === data.payload.id)) {
                  return prev;
                }
                return [...prev, data.payload];
              });
              break;

            case 'typing':
              setIsTyping(data.payload.isTyping);
              if (data.payload.isTyping) {
                // Clear typing indicator after 3 seconds
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = window.setTimeout(() => {
                  setIsTyping(false);
                }, 3000);
              }
              break;

            case 'read':
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === data.payload.messageId
                    ? { ...msg, read: true }
                    : msg
                )
              );
              break;

            case 'error':
              console.error('WebSocket error:', data.payload);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'message',
      payload: {
        content,
        conversationId
      }
    }));
  }, [conversationId]);

  const markAsRead = useCallback((messageId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'read',
      payload: { messageId }
    }));
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'typing',
      payload: {
        conversationId,
        isTyping
      }
    }));
  }, [conversationId]);

  return {
    messages,
    sendMessage,
    markAsRead,
    sendTyping,
    isConnected,
    isTyping
  };
}
