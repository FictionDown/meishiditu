import { Category } from '../types';

export interface CategoryInfo {
  label: string;
  color: string;
  icon: string;
  bgColor: string;
}

export const DEFAULT_CATEGORIES: Record<string, CategoryInfo> = {
  hotpot:   { label: '火锅', color: '#EF4444', icon: '🍲', bgColor: '#FEF2F2' },
  bbq:      { label: '烧烤', color: '#F97316', icon: '🍖', bgColor: '#FFF7ED' },
  snack:    { label: '小吃', color: '#EAB308', icon: '🍢', bgColor: '#FEFCE8' },
  dessert:  { label: '甜品', color: '#EC4899', icon: '🍰', bgColor: '#FDF2F8' },
  coffee:   { label: '咖啡', color: '#8B4513', icon: '☕', bgColor: '#FDF8F0' },
  other:    { label: '其他', color: '#6B7280', icon: '🍴', bgColor: '#F9FAFB' },
};

// Mutable — initialized with defaults, extended by rebuildCategories()
export let CATEGORIES: Record<string, CategoryInfo> = { ...DEFAULT_CATEGORIES };
export let CATEGORY_OPTIONS: Array<{ value: string } & CategoryInfo> =
  Object.entries(CATEGORIES).map(([key, val]) => ({ value: key, ...val }));

export function rebuildCategories(userCategories: Array<{ key: string; label: string; color: string; icon: string }>): void {
  CATEGORIES = { ...DEFAULT_CATEGORIES };
  for (const c of userCategories) {
    CATEGORIES[c.key] = {
      label: c.label,
      color: c.color,
      icon: c.icon,
      bgColor: c.color + '1A',
    };
  }
  CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, val]) => ({ value: key, ...val }));
}
