import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useCategories } from '../../hooks/useCategories';
import { DEFAULT_CATEGORIES, CATEGORIES } from '../../utils/categories';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { customCategories, loading, addCategory, removeCategory } = useCategories();
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label) { setError('分类名称不能为空'); return; }
    setError('');
    setAdding(true);
    try {
      await addCategory(label);
      setNewLabel('');
    } catch (err: any) {
      const msg = err.response?.data?.error || '添加失败';
      setError(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeCategory(id);
      setDeleteId(null);
    } catch {
      setError('删除失败');
    }
  };

  const customKeys = new Set(customCategories.map(c => c.key));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="管理分类" size="md">
      <div className="space-y-4">
        {/* Add new */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => { setNewLabel(e.target.value); setError(''); }}
            placeholder="输入分类名称，如：川菜"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} loading={adding} size="sm">
            添加
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        {/* Default categories */}
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2">默认分类</p>
          <div className="space-y-1">
            {Object.entries(DEFAULT_CATEGORIES).map(([key, info]) => (
              <div
                key={key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm"
              >
                <span>{info.icon}</span>
                <span className="text-gray-700">{info.label}</span>
                <span className="ml-auto text-xs text-gray-400">内置</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom categories */}
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2">自定义分类</p>
          {customCategories.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">暂无自定义分类</p>
          ) : (
            <div className="space-y-1">
              {customCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm"
                >
                  <span>{cat.icon}</span>
                  <span className="text-gray-700">{cat.label}</span>
                  {deleteId === cat.id ? (
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-xs text-gray-400">确认删除？</span>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-xs text-red-500 hover:text-red-700 px-1"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-1"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="ml-auto text-xs text-red-400 hover:text-red-600 transition"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
