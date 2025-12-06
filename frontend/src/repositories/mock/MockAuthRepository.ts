import type { IAuthRepository } from '../types';
import type { User } from '../../types';
import { MockDataStore } from './mockData';

export class MockAuthRepository implements IAuthRepository {
  private store = MockDataStore.getInstance();

  async login(nickname: string, password: string): Promise<User> {
    // Simulate API delay
    await this.delay(500);

    // For mock, we don't validate password - just accept any password
    // In real API, password would be validated
    const user = this.store.createOrGetUser(nickname);
    this.store.setCurrentUser(user);

    return user;
  }

  async logout(): Promise<void> {
    await this.delay(200);
    this.store.clearCurrentUser();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
