import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRepositories } from '../contexts/RepositoryContext';
import { useChat } from '../hooks/useChat';
import type { Conversation } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatScreenProps {
  conversationId: string;
  onBack: () => void;
}

export function ChatScreen({ conversationId, onBack }: ChatScreenProps) {
  const { user } = useAuth();
  const { conversationRepository } = useRepositories();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { messages, sendMessage, isConnected, isTyping, sendTyping } = useChat({
    roomId: conversation?.roomId || null,
    userId: user?.id || null,
  });

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    if (!user) return;

    try {
      const data = await conversationRepository.getConversationById(conversationId);
      setConversation(data);
    } catch (err) {
      console.error('Erro ao carregar conversa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  if (isLoading || !conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3 border-b border-gray-200">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-semibold">
          {conversation.otherUser.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{conversation.otherUser.name}</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            {isTyping && <span className="ml-2 italic">digitando...</span>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} currentUserId={user?.id || ''} />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        onTyping={sendTyping}
      />
    </div>
  );
}
