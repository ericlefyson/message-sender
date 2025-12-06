import type { IUserRepository } from '../types';
import type { User } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiUserRepository implements IUserRepository {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/api/users/all`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar usuários');
    }

    return await response.json();
  }

  async getUserById(id: string): Promise<User | null> {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }

  async getUserByNickname(nickname: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/api/users/nickname/${encodeURIComponent(nickname)}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Falha ao buscar usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user by nickname:', error);
      return null;
    }
  }
}
