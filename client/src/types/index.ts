export interface User {
  id: number;
  phone: string;
  nickname: string;
}

export interface Shop {
  id: number;
  user_id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: Category;
  meituan_url: string;
  notes: string;
  images: string[];
  is_shared: number;
  is_checked_in: number;
  share_id: string;
  created_at: string;
  updated_at: string;
}

export type Category = string;

export interface UserCategory {
  id: number;
  user_id: number;
  key: string;
  label: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface ShopFilters {
  category: string;
  city: string;
  keyword: string;
}

export interface ShopFormData {
  name: string;
  address: string;
  category: Category;
  meituan_url: string;
  notes: string;
  images: File[];
  existingImages: string[];
  lat?: number;
  lng?: number;
}
