import { Category } from '../types';

export interface CategoryInfo {
  label: string;
  color: string;
  icon: string;
  bgColor: string;
}

export const CATEGORIES: Record<Category, CategoryInfo> = {
  hotpot:   { label: '火锅', color: '#EF4444', icon: '🍲', bgColor: '#FEF2F2' },
  bbq:      { label: '烧烤', color: '#F97316', icon: '🍖', bgColor: '#FFF7ED' },
  snack:    { label: '小吃', color: '#EAB308', icon: '🍢', bgColor: '#FEFCE8' },
  dessert:  { label: '甜品', color: '#EC4899', icon: '🍰', bgColor: '#FDF2F8' },
  coffee:   { label: '咖啡', color: '#8B4513', icon: '☕', bgColor: '#FDF8F0' },
  other:    { label: '其他', color: '#6B7280', icon: '🍴', bgColor: '#F9FAFB' },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, val]) => ({
  value: key as Category,
  ...val,
}));
