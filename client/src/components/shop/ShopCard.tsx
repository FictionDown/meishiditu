import { Shop } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { truncateText, extractCity } from '../../utils/format';

interface ShopCardProps {
  shop: Shop;
  isSelected: boolean;
  onClick: () => void;
}

export default function ShopCard({ shop, isSelected, onClick }: ShopCardProps) {
  // Defensive: ensure shop has all required fields
  if (!shop) return null;

  const categoryKey = shop.category || 'other';
  const cat = CATEGORIES[categoryKey] || CATEGORIES.other;
  const firstImage = Array.isArray(shop.images) ? shop.images[0] : undefined;
  const city = extractCity(shop.address || '');

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition border ${
        isSelected
          ? 'bg-primary-50 border-primary-200 shadow-sm'
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
        {firstImage ? (
          <img src={firstImage} alt={shop.name || ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {cat.icon}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-medium text-gray-900 text-sm truncate">{shop.name || '未命名'}</h4>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: cat.bgColor, color: cat.color }}
          >
            {cat.icon}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {city ? <span className="text-gray-400 mr-1">{city}</span> : null}
          {truncateText(shop.address || '', 20)}
        </p>
        {shop.notes && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{truncateText(shop.notes, 25)}</p>
        )}
      </div>
    </div>
  );
}
