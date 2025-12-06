import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRepositories } from '../contexts/RepositoryContext';
import type { Conversation } from '../types';
import { ConversationItem } from './ConversationItem';
import { AddUserModal } from './AddUserModal';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  activeConversationId: string | null;
}

export function ConversationList({ onSelectConversation, activeConversationId }: ConversationListProps) {
  const { user, logout } = useAuth();
  const { conversationRepository } = useRepositories();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    // Refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const conversationsData = await conversationRepository.getConversations();
      setConversations(conversationsData);
    } catch (err) {
      setError('Erro ao carregar conversas');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAdded = () => {
    loadData(); // Refresh the conversation list
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
          <h1 className="text-xl font-bold text-gray-800">Message Sender</h1>
          <p className="text-sm text-gray-600">{user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Conversations List */}
        {conversations.length > 0 ? (
          <div className="bg-white">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => onSelectConversation(conversation.id)}
                isActive={activeConversationId === conversation.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Nenhuma conversa ainda</p>
              <p className="text-sm">Clique em "Adicionar" para começar uma nova conversa</p>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
