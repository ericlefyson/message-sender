import { useState, type FormEvent } from 'react';
import { useRepositories } from '../contexts/RepositoryContext';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [nickname, setNickname] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const { userRepository, conversationRepository } = useRepositories();
  const { user: currentUser } = useAuth();

  if (!isOpen) return null;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError('Por favor, digite um nickname');
      return;
    }

    setIsSearching(true);
    setError('');
    setFoundUser(null);

    try {
      const user = await userRepository.getUserByNickname(nickname.trim());

      if (!user) {
        setError('Usuário não encontrado');
      } else if (user.id === currentUser?.id) {
        setError('Você não pode adicionar a si mesmo');
      } else {
        setFoundUser(user);
      }
    } catch (err) {
      setError('Erro ao buscar usuário');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddConversation = async () => {
    if (!foundUser) return;

    setIsAdding(true);
    setError('');

    try {
      await conversationRepository.createConversation(foundUser.id);
      onUserAdded();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conversa');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setNickname('');
    setFoundUser(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Adicionar nova conversa
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isSearching || isAdding}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nickname
            </label>
            <div className="flex gap-2">
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="usuario123"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isSearching || isAdding}
                autoFocus
              />
              <button
                type="submit"
                disabled={isSearching || isAdding}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {foundUser && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="font-medium text-gray-800">{foundUser.name}</p>
                <p className="text-sm text-gray-500">@{foundUser.nickname}</p>
              </div>
              <button
                type="button"
                onClick={handleAddConversation}
                disabled={isAdding}
                className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition disabled:bg-green-300 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Adicionando...' : 'Adicionar conversa'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
