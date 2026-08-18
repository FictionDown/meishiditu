import { useState, useCallback, useEffect } from 'react';
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
  onToggleCheckIn: (id: number) => Promise<void>;
  onClose: () => void;
}

export default function ShopDetailPanel({ shop, onEdit, onDelete, onToggleCheckIn, onClose }: ShopDetailPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const cat = CATEGORIES[shop.category] || CATEGORIES.other;

  const images = shop.images || [];
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;

  // Reset image index when shop changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setLightboxOpen(false);
  }, [shop.id]);

  const goToPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen, images.length]);

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
        {/* Image Carousel */}
        <div className="relative h-48 bg-gray-100 group">
          {hasImages ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={`${shop.name} - ${currentImageIndex + 1}`}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />
              {/* Image counter */}
              {hasMultipleImages && (
                <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </span>
              )}
              {/* Prev/Next arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity"
                  >
                    ‹
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity"
                  >
                    ›
                  </button>
                </>
              )}
              {/* Dot indicators */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentImageIndex
                          ? 'bg-white scale-110'
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
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
        {/* Check-in button */}
        <button
          onClick={() => onToggleCheckIn(shop.id)}
          className={`w-full text-sm py-2 rounded-lg font-medium transition ${
            shop.is_checked_in
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {shop.is_checked_in ? '✅ 已打卡（点击取消）' : '📍 打卡'}
        </button>

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

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center text-xl hover:bg-white/20 transition z-10"
          >
            ✕
          </button>

          {/* Image counter */}
          {hasMultipleImages && (
            <span className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-10">
              {currentImageIndex + 1} / {images.length}
            </span>
          )}

          {/* Prev button */}
          {hasMultipleImages && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPrev(e); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center text-2xl hover:bg-white/20 transition z-10"
            >
              ‹
            </button>
          )}

          {/* Full image */}
          <img
            src={images[currentImageIndex]}
            alt={`${shop.name} - ${currentImageIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {hasMultipleImages && (
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(e); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center text-2xl hover:bg-white/20 transition z-10"
            >
              ›
            </button>
          )}

          {/* Dot indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentImageIndex
                      ? 'bg-white scale-110'
                      : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
