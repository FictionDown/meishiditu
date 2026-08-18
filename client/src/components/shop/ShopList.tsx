import { Shop } from '../../types';
import ShopCard from './ShopCard';

interface ShopListProps {
  shops: Shop[];
  selectedShopId: number | null;
  onShopSelect: (shop: Shop) => void;
  onToggleCheckIn: (id: number) => Promise<void>;
  loading: boolean;
  error?: string;
}

export default function ShopList({ shops, selectedShopId, onShopSelect, onToggleCheckIn, loading, error }: ShopListProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 p-3 animate-pulse">
            <div className="w-16 h-16 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-3xl mb-2">😵</div>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-primary-500 hover:text-primary-600"
        >
          点击重试
        </button>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-5xl mb-3">🍽️</div>
        <p className="text-gray-500 text-sm">还没有收藏店铺</p>
        <p className="text-gray-400 text-xs mt-1">点击上方「添加店铺」开始</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      <div className="text-xs text-gray-400 px-1 mb-1">
        共 {shops.length} 家店铺
      </div>
      {shops.map((shop) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          isSelected={shop.id === selectedShopId}
          onClick={() => onShopSelect(shop)}
          onToggleCheckIn={() => onToggleCheckIn(shop.id)}
        />
      ))}
    </div>
  );
}
