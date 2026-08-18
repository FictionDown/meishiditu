import apiClient from './client';
import { Shop, ShopFilters } from '../types';

export interface ShopListResponse {
  shops: Shop[];
  total: number;
  cities: string[];
}

export async function fetchShops(filters?: Partial<ShopFilters>): Promise<ShopListResponse> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.city) params.set('city', filters.city);
  if (filters?.keyword) params.set('keyword', filters.keyword);
  const { data } = await apiClient.get(`/shops?${params.toString()}`);
  return data;
}

export async function createShop(shopData: {
  name: string;
  address: string;
  category: string;
  meituan_url?: string;
  notes?: string;
  images?: string[];
  lat?: number;
  lng?: number;
}): Promise<{ shop: Shop }> {
  const { data } = await apiClient.post('/shops', shopData);
  return data;
}

export async function updateShop(id: number, shopData: {
  name?: string;
  address?: string;
  category?: string;
  meituan_url?: string;
  notes?: string;
  images?: string[];
  is_shared?: number;
  lat?: number;
  lng?: number;
}): Promise<{ shop: Shop }> {
  const { data } = await apiClient.put(`/shops/${id}`, shopData);
  return data;
}

export async function toggleCheckIn(id: number): Promise<{ shop: Shop }> {
  const { data } = await apiClient.patch(`/shops/${id}/checkin`);
  return data;
}

export async function deleteShop(id: number): Promise<void> {
  await apiClient.delete(`/shops/${id}`);
}
