import { useEffect, useState, useCallback } from 'react';
import { useRepositories } from '../contexts/RepositoryContext';
import type { Message } from '../types';

interface UseChatOptions {
  conversationId: string | null;
  userId: string | null;
}

export function useChat({ conversationId, userId }: UseChatOptions) {
  const { webSocketService } = useRepositories();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!userId || !conversationId) return;

    // Register callbacks
    webSocketService.onConnectionChange(setIsConnected);

    webSocketService.onHistory((msgs) => {
      setMessages(msgs);
    });

    webSocketService.onMessage((msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === msg.id)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    webSocketService.onTyping(setIsTyping);

    webSocketService.onRead((messageId) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, read: true }
            : msg
        )
      );
    });

    // Connect
    webSocketService.connect(userId, conversationId);

    // Cleanup
    return () => {
      webSocketService.disconnect();
    };
  }, [conversationId, userId, webSocketService]);

  const sendMessage = useCallback((content: string) => {
    webSocketService.sendMessage(content);
  }, [webSocketService]);

  const markAsRead = useCallback((messageId: string) => {
    webSocketService.markAsRead(messageId);
  }, [webSocketService]);

  const sendTyping = useCallback((isTyping: boolean) => {
    webSocketService.sendTyping(isTyping);
  }, [webSocketService]);

  return {
    messages,
    sendMessage,
    markAsRead,
    sendTyping,
    isConnected,
    isTyping
  };
}
