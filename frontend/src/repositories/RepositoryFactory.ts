import type { IAuthRepository, IUserRepository, IConversationRepository, IWebSocketService } from './types';

// Mock implementations
import { MockAuthRepository } from './mock/MockAuthRepository';
import { MockUserRepository } from './mock/MockUserRepository';
import { MockConversationRepository } from './mock/MockConversationRepository';
import { MockWebSocketService } from './mock/MockWebSocketService';

// Real API implementations
import { ApiAuthRepository } from './api/ApiAuthRepository';
import { ApiUserRepository } from './api/ApiUserRepository';
import { ApiConversationRepository } from './api/ApiConversationRepository';
import { ApiWebSocketService } from './api/ApiWebSocketService';

export type RepositoryMode = 'mock' | 'api';

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private mode: RepositoryMode;

  // Singleton instances
  private authRepository: IAuthRepository | null = null;
  private userRepository: IUserRepository | null = null;
  private conversationRepository: IConversationRepository | null = null;
  private webSocketService: IWebSocketService | null = null;

  private constructor() {
    // Read from environment variable
    const envMode = import.meta.env.VITE_REPOSITORY_MODE as RepositoryMode;
    this.mode = envMode === 'api' ? 'api' : 'mock';

    console.log(`[RepositoryFactory] Using ${this.mode.toUpperCase()} mode`);
  }

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  getMode(): RepositoryMode {
    return this.mode;
  }

  setMode(mode: RepositoryMode): void {
    if (this.mode !== mode) {
      console.log(`[RepositoryFactory] Switching from ${this.mode} to ${mode} mode`);
      this.mode = mode;
      // Clear instances to force recreation with new mode
      this.clearInstances();
    }
  }

  getAuthRepository(): IAuthRepository {
    if (!this.authRepository) {
      this.authRepository = this.mode === 'mock'
        ? new MockAuthRepository()
        : new ApiAuthRepository();
    }
    return this.authRepository;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = this.mode === 'mock'
        ? new MockUserRepository()
        : new ApiUserRepository();
    }
    return this.userRepository;
  }

  getConversationRepository(): IConversationRepository {
    if (!this.conversationRepository) {
      this.conversationRepository = this.mode === 'mock'
        ? new MockConversationRepository()
        : new ApiConversationRepository();
    }
    return this.conversationRepository;
  }

  getWebSocketService(): IWebSocketService {
    if (!this.webSocketService) {
      this.webSocketService = this.mode === 'mock'
        ? new MockWebSocketService()
        : new ApiWebSocketService();
    }
    return this.webSocketService;
  }

  private clearInstances(): void {
    // Disconnect WebSocket if exists
    if (this.webSocketService) {
      this.webSocketService.disconnect();
    }

    this.authRepository = null;
    this.userRepository = null;
    this.conversationRepository = null;
    this.webSocketService = null;
  }
}

// Convenience exports
export const repositoryFactory = RepositoryFactory.getInstance();
