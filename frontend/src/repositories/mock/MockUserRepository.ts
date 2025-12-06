import type { IUserRepository } from '../types';
import type { User } from '../../types';
import { MockDataStore } from './mockData';

export class MockUserRepository implements IUserRepository {
  private store = MockDataStore.getInstance();

  async getUsers(): Promise<User[]> {
    await this.delay(300);
    return this.store.getAllUsers();
  }

  async getUserById(id: string): Promise<User | null> {
    await this.delay(100);
    return this.store.getUserById(id);
  }

  async getUserByNickname(email: string): Promise<User | null> {
    await this.delay(200);
    return this.store.getUserByNickname(email);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
