import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

interface AppHeaderProps {
  onAddShop: () => void;
}

export default function AppHeader({ onAddShop }: AppHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-xl font-bold text-gray-800 flex items-center gap-1.5">
          <span>🍜</span>
          <span className="hidden sm:inline">美食地图</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onAddShop} size="sm">
          + 添加店铺
        </Button>
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
          <span className="text-sm text-gray-600 hidden sm:inline">{user?.nickname}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-gray-600 transition"
            title="退出登录"
          >
            退出
          </button>
        </div>
      </div>
    </header>
  );
}
