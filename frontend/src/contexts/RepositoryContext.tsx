import { createContext, useContext, type ReactNode } from 'react';
import type { IAuthRepository, IUserRepository, IConversationRepository, IWebSocketService } from '../repositories/types';
import { repositoryFactory } from '../repositories/RepositoryFactory';

interface RepositoryContextType {
  authRepository: IAuthRepository;
  userRepository: IUserRepository;
  conversationRepository: IConversationRepository;
  webSocketService: IWebSocketService;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const value: RepositoryContextType = {
    authRepository: repositoryFactory.getAuthRepository(),
    userRepository: repositoryFactory.getUserRepository(),
    conversationRepository: repositoryFactory.getConversationRepository(),
    webSocketService: repositoryFactory.getWebSocketService(),
  };

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepositories must be used within a RepositoryProvider');
  }
  return context;
}
