import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
}

export interface User {
  id: number;
  phone: string;
  password_hash: string;
  nickname: string;
  created_at: string;
}

export interface Shop {
  id: number;
  user_id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  meituan_url: string;
  notes: string;
  images: string; // JSON array
  is_shared: number; // 0 or 1
  share_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopFilters {
  category?: string;
  city?: string;
  keyword?: string;
}

export interface CreateShopInput {
  name: string;
  address: string;
  category: string;
  meituan_url?: string;
  notes?: string;
  images?: string[];
  lat?: number;
  lng?: number;
}

export interface UpdateShopInput {
  name?: string;
  address?: string;
  category?: string;
  meituan_url?: string;
  notes?: string;
  images?: string[];
  is_shared?: number;
  lat?: number;
  lng?: number;
}

export type Category = 'hotpot' | 'bbq' | 'snack' | 'dessert' | 'coffee' | 'other';

export const CATEGORIES: Record<Category, string> = {
  hotpot: '火锅',
  bbq: '烧烤',
  snack: '小吃',
  dessert: '甜品',
  coffee: '咖啡',
  other: '其他',
};
