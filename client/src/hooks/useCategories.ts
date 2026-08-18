import { useState, useEffect, useCallback } from 'react';
import { UserCategory } from '../types';
import { rebuildCategories } from '../utils/categories';
import * as categoriesApi from '../api/categories';

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<UserCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.fetchCategories();
      setCustomCategories(data.customs);
      rebuildCategories(data.customs);
    } catch {
      // defaults still work even if fetch fails
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const addCategory = useCallback(async (label: string) => {
    const { category } = await categoriesApi.createCategory(label);
    const updated = [...customCategories, category];
    setCustomCategories(updated);
    rebuildCategories(updated);
  }, [customCategories]);

  const removeCategory = useCallback(async (id: number) => {
    await categoriesApi.deleteCategory(id);
    const updated = customCategories.filter(c => c.id !== id);
    setCustomCategories(updated);
    rebuildCategories(updated);
  }, [customCategories]);

  return { customCategories, loading, addCategory, removeCategory, refresh: fetch };
}
