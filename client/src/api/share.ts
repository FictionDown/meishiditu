import apiClient from './client';
import { Shop } from '../types';

export interface ShareResponse {
  shop: Shop;
  sharedBy: {
    nickname: string;
  };
}

export async function getSharedShop(shareId: string): Promise<ShareResponse> {
  const { data } = await apiClient.get(`/share/${shareId}`);
  return data;
}

export async function copySharedShop(shareId: string): Promise<{ shop: Shop }> {
  const { data } = await apiClient.post(`/share/${shareId}/copy`);
  return data;
}
