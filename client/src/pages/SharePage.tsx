import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import MapContainer from '../components/map/MapContainer';
import Button from '../components/common/Button';
import { CATEGORIES } from '../utils/categories';
import { NAVIGATE_URLS } from '../utils/mapConfig';
import * as shareApi from '../api/share';

export default function SharePage() {
  const { shareId } = useParams<{ shareId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [shop, setShop] = useState<Shop | null>(null);
  const [sharedBy, setSharedBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    setLoading(true);
    shareApi.getSharedShop(shareId)
      .then((data) => {
        setShop(data.shop);
        setSharedBy(data.sharedBy.nickname);
      })
      .catch((err) => {
        setError(err.response?.data?.error || '分享链接不存在或已失效');
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  const handleCopy = async () => {
    if (!user) {
      navigate(`/login?redirect=/share/${shareId}`);
      return;
    }
    setCopying(true);
    try {
      await shareApi.copySharedShop(shareId!);
      showToast('已复制到我的收藏');
      navigate('/app');
    } catch {
      showToast('收藏失败', 'error');
    } finally {
      setCopying(false);
    }
  };

  const cat = shop ? (CATEGORIES[shop.category] || CATEGORIES.other) : CATEGORIES.other;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <p className="text-gray-500 text-lg">{error || '分享不存在'}</p>
          <Link to="/" className="text-primary-500 hover:text-primary-600 text-sm mt-4 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-gray-800">🍜 美食地图</Link>
          <span className="text-sm text-gray-400">| {sharedBy} 的分享</span>
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <Link to="/login" className="text-sm text-primary-500 hover:text-primary-600">
              登录
            </Link>
          )}
        </div>
      </header>

      {/* Content: map + detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            shops={[shop]}
            selectedShopId={shop.id}
            onShopSelect={() => {}}
            onMapClick={() => {}}
            interactive={false}
            center={[shop.lng, shop.lat]}
            zoom={15}
          />
        </div>

        {/* Detail sidebar */}
        <div className="w-96 shrink-0 border-l border-gray-200 flex flex-col bg-white">
          {/* Image */}
          <div className="h-48 bg-gray-100">
            {shop.images?.[0] ? (
              <img src={shop.images[0]} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">{cat.icon}</div>
            )}
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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
              <p className="text-xs text-gray-400">分享自 {sharedBy}</p>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">📍</span>
              <p className="text-sm text-gray-700">{shop.address}</p>
            </div>

            {shop.notes && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">📝</span>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{shop.notes}</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <Button
              onClick={() => window.open(NAVIGATE_URLS.gaode(shop.lat, shop.lng, shop.name), '_blank')}
              className="w-full"
            >
              🧭 导航到店
            </Button>
            {shop.meituan_url && (
              <Button
                variant="secondary"
                onClick={() => window.open(shop.meituan_url, '_blank')}
                className="w-full"
              >
                📱 打开美团
              </Button>
            )}
            <Button
              variant={user ? 'primary' : 'secondary'}
              onClick={handleCopy}
              loading={copying}
              className="w-full"
            >
              {user ? '📋 复制到我的收藏' : '📋 登录并收藏'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
