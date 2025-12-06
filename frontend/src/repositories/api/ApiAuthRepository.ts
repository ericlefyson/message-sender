import type { IAuthRepository } from '../types';
import type { User } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiAuthRepository implements IAuthRepository {
  async login(nickname: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, nickname, password }),
    });

    if (!response.ok) {
      throw new Error('Falha ao fazer login');
    }

    return await response.json();
  }

  async logout(): Promise<void> {
    // In a real app, you might call a logout endpoint
    // For now, just clear client-side state
    return Promise.resolve();
  }
}
