import apiClient from './client';
import { UserCategory } from '../types';

export interface CategoriesResponse {
  customs: UserCategory[];
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const { data } = await apiClient.get('/categories');
  return data;
}

export async function createCategory(label: string): Promise<{ category: UserCategory }> {
  const { data } = await apiClient.post('/categories', { label });
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
