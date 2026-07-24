import { useState } from 'react';
import { Shop } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { formatDate } from '../../utils/format';
import { NAVIGATE_URLS } from '../../utils/mapConfig';
import Button from '../common/Button';
import * as shareApi from '../../api/share';

interface ShopDetailPanelProps {
  shop: Shop;
  onEdit: (shop: Shop) => void;
  onDelete: (shopId: number) => void;
  onClose: () => void;
}

export default function ShopDetailPanel({ shop, onEdit, onDelete, onClose }: ShopDetailPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cat = CATEGORIES[shop.category] || CATEGORIES.other;

  const handleShare = async () => {
    setSharing(true);
    try {
      const shareUrl = `${window.location.origin}/share/${shop.share_id}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('分享链接已复制到剪贴板！');
    } catch {
      // Fallback
      const shareUrl = `${window.location.origin}/share/${shop.share_id}`;
      prompt('复制此链接分享：', shareUrl);
    } finally {
      setSharing(false);
    }
  };

  const handleNavigate = () => {
    const url = NAVIGATE_URLS.gaode(shop.lat, shop.lng, shop.name);
    window.open(url, '_blank');
  };

  const handleOpenMeituan = () => {
    if (shop.meituan_url) {
      window.open(shop.meituan_url, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">店铺详情</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image */}
        <div className="h-48 bg-gray-100">
          {shop.images?.[0] ? (
            <img src={shop.images[0]} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {cat.icon}
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Name + Category */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{shop.name}</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cat.bgColor, color: cat.color }}
              >
                {cat.icon} {cat.label}
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">📍</span>
            <p className="text-sm text-gray-700">{shop.address}</p>
          </div>

          {/* Meituan link */}
          {shop.meituan_url && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">🔗</span>
              <a
                href={shop.meituan_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-500 hover:text-primary-600 truncate"
              >
                查看美团页面 →
              </a>
            </div>
          )}

          {/* Notes */}
          {shop.notes && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">📝</span>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{shop.notes}</p>
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-gray-400">
            创建于 {formatDate(shop.created_at)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleNavigate} size="sm">
            🧭 导航
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenMeituan}
            disabled={!shop.meituan_url}
          >
            📱 美团
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" onClick={handleShare} loading={sharing}>
            📤 分享
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(shop)}>
            ✏️ 编辑
          </Button>
        </div>
        <div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-sm text-red-400 hover:text-red-600 py-1.5 transition"
            >
              删除此店铺
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { onDelete(shop.id); setShowDeleteConfirm(false); }}
                className="flex-1 text-sm bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 transition"
              >
                确认删除
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 text-sm border border-gray-300 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
