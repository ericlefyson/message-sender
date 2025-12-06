import type { IAuthRepository } from '../types';
import type { User } from '../../types';
import { MockDataStore } from './mockData';

export class MockAuthRepository implements IAuthRepository {
  private store = MockDataStore.getInstance();

  async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await this.delay(500);

    // For mock, we don't validate password - just accept any password
    // In real API, password would be validated
    // Find user by email for login
    const user = this.store.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    this.store.setCurrentUser(user);

    return user;
  }

  async register(name: string, nickname: string, email: string, password: string): Promise<User> {
    // Simulate API delay
    await this.delay(500);

    // Check if email already exists
    const existingEmail = this.store.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      throw new Error('Email já cadastrado');
    }

    // Check if nickname already exists
    const existingNickname = this.store.getUserByNickname(nickname);
    if (existingNickname) {
      throw new Error('Nickname já cadastrado');
    }

    // For mock, we don't validate password - just create the user
    const user = this.store.createUserWithName(name, nickname, email);
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
