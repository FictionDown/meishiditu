import apiClient from './client';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', { phone, password });
  return data;
}

export async function register(phone: string, password: string, nickname: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', { phone, password, nickname });
  return data;
}

export async function getMe(): Promise<{ user: User }> {
  const { data } = await apiClient.get('/auth/me');
  return data;
}
