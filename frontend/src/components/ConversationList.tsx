import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Conversation, User } from '../types';
import { ConversationItem } from './ConversationItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  activeConversationId: string | null;
}

export function ConversationList({ onSelectConversation, activeConversationId }: ConversationListProps) {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      let conversationsData: Conversation[] = [];

      // Load conversations
      const conversationsRes = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (conversationsRes.ok) {
        conversationsData = await conversationsRes.json();
        setConversations(conversationsData);
      }

      // Load available users
      const usersRes = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Filter out users we already have conversations with
        const conversationUserIds = conversationsData.map((c: Conversation) => c.otherUser.id);
        const available = usersData.filter((u: User) => !conversationUserIds.includes(u.id));
        setAvailableUsers(available);
      }
    } catch (err) {
      setError('Erro ao carregar conversas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ otherUserId }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar conversa');
      }

      const conversation = await response.json();
      onSelectConversation(conversation.id);
      loadData(); // Refresh the lists
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
      setError('Erro ao criar conversa');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Chat App</h1>
          <p className="text-sm text-gray-600">{user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          Sair
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Existing Conversations */}
        {conversations.length > 0 && (
          <div className="bg-white mb-2">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700">Suas Conversas</h2>
            </div>
            <div>
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  onClick={() => onSelectConversation(conversation.id)}
                  isActive={activeConversationId === conversation.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Users */}
        {availableUsers.length > 0 && (
          <div className="bg-white">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700">Iniciar Nova Conversa</h2>
            </div>
            <div>
              {availableUsers.map((availableUser) => (
                <div
                  key={availableUser.id}
                  onClick={() => handleStartConversation(availableUser.id)}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-400 text-white rounded-full flex items-center justify-center text-xl font-semibold">
                    {availableUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{availableUser.name}</h3>
                    <p className="text-sm text-gray-500">Clique para conversar</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {conversations.length === 0 && availableUsers.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Nenhuma conversa ainda</p>
              <p className="text-sm">Aguarde novos usuários se conectarem</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
