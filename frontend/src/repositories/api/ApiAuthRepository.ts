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
      body: JSON.stringify({ email: nickname, password }),
    });

    if (!response.ok) {
      throw new Error('Falha ao fazer login');
    }

    const data = await response.json();

    // Store tokens in localStorage
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    // Return user object
    return data.user;
  }

  async logout(): Promise<void> {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return Promise.resolve();
  }
}
