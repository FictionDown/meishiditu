import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col">
      {/* Hero section with map background placeholder */}
      <div className="relative h-full flex flex-col">
        {/* Map placeholder — replaced with AMap in Phase 4 */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-red-50 to-amber-50">
          {/* Decorative dots representing map markers */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, #ef4444 2px, transparent 2px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🍜 美食地图
          </h1>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/app"
                className="px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
              >
                进入我的地图
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  登录
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium"
                >
                  免费注册
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            全国美食地图
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-lg text-center leading-relaxed">
            把你的美食收藏变成一张可分享的地图<br />
            收藏 · 导航 · 分享，一次搞定
          </p>
          <div className="flex items-center gap-4">
            {!user && (
              <Link
                to="/login?tab=register"
                className="px-8 py-3.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-semibold text-lg shadow-lg shadow-primary-200"
              >
                开始我的美食地图 →
              </Link>
            )}
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
            {[
              { icon: '📍', title: '地图收藏', desc: '在地图上标记你的美食据点' },
              { icon: '🧭', title: '一键导航', desc: '高德/百度地图直接导航到店' },
              { icon: '📤', title: '分享好友', desc: '生成专属链接分享你的美食清单' },
            ].map((f) => (
              <div key={f.title} className="bg-white/80 backdrop-blur rounded-xl p-5 text-center shadow-sm border border-gray-100">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
