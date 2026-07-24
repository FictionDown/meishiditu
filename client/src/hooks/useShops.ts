import { useState, useEffect, useCallback } from 'react';
import { Shop, ShopFilters } from '../types';
import * as shopsApi from '../api/shops';

export function useShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<ShopFilters>({
    category: '',
    city: '',
    keyword: '',
  });

  const fetchShops = useCallback(async (f?: ShopFilters) => {
    setLoading(true);
    setError('');
    try {
      const result = await shopsApi.fetchShops(f || filters);
      setShops(result.shops);
      setCities(result.cities);
    } catch (err: any) {
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchShops(filters);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = useCallback((key: keyof ShopFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const addShop = useCallback((shop: Shop) => {
    setShops((prev) => [shop, ...prev]);
  }, []);

  const updateShopInList = useCallback((updated: Shop) => {
    setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const removeShop = useCallback((id: number) => {
    setShops((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    shops,
    cities,
    loading,
    error,
    filters,
    updateFilter,
    fetchShops,
    addShop,
    updateShopInList,
    removeShop,
  };
}
