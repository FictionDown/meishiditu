import { all, run, get } from '../db/connection';
import { UserCategory, CreateCategoryInput } from '../types';
import { DEFAULT_CATEGORIES } from '../types';

const COLOR_POOL = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EF4444', '#84CC16', '#EC4899'];
const ICON_POOL = ['🍜', '🥘', '🍝', '🥟', '🧋', '🍩', '🍗', '🥗'];

export function getUserCategories(userId: number): UserCategory[] {
  return all<UserCategory>('SELECT * FROM categories WHERE user_id = ? ORDER BY created_at ASC', [userId]);
}

export function createCategory(userId: number, input: CreateCategoryInput): UserCategory {
  const existing = all<UserCategory>(
    'SELECT * FROM categories WHERE user_id = ? AND label = ?',
    [userId, input.label]
  );
  if (existing.length > 0) {
    throw new Error('DUPLICATE_LABEL');
  }

  const count = all<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM categories WHERE user_id = ?',
    [userId]
  );
  const idx = (count[0]?.cnt || 0) % COLOR_POOL.length;
  const key = `custom_${count[0]?.cnt || 0}`;

  run(
    'INSERT INTO categories (user_id, key, label, color, icon) VALUES (?, ?, ?, ?, ?)',
    [userId, key, input.label, COLOR_POOL[idx], ICON_POOL[idx % ICON_POOL.length]]
  );

  return getUserCategories(userId).find(c => c.key === key)!;
}

export function deleteCategory(userId: number, categoryId: number): void {
  const cat = get<UserCategory>('SELECT * FROM categories WHERE id = ? AND user_id = ?', [categoryId, userId]);
  if (!cat) {
    throw new Error('NOT_FOUND');
  }

  run('UPDATE shops SET category = ? WHERE user_id = ? AND category = ?', ['other', userId, cat.key]);
  run('DELETE FROM categories WHERE id = ? AND user_id = ?', [categoryId, userId]);
}

/**
 * Merge default categories with user's custom categories.
 * Returns a map of key → label for validation.
 */
export function getCategoryMap(userId: number): Record<string, string> {
  const customs = getUserCategories(userId);
  const map: Record<string, string> = { ...DEFAULT_CATEGORIES };
  for (const c of customs) {
    map[c.key] = c.label;
  }
  return map;
}
