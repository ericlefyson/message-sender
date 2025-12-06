import type { IUserRepository } from '../types';
import type { User } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiUserRepository implements IUserRepository {
  private userId: string | null = null;

  setCurrentUserId(userId: string) {
    this.userId = userId;
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${this.userId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar usuários');
    }

    return await response.json();
  }

  async getUserById(id: string): Promise<User | null> {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.userId}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  async getUserByNickname(nickname: string): Promise<User | null> {
    const response = await fetch(`${API_URL}/api/users/nickname/${encodeURIComponent(nickname)}`, {
      headers: {
        'Authorization': `Bearer ${this.userId}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }
}
