import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ImageUpload from '../common/ImageUpload';
import CategoryManager from '../category/CategoryManager';
import { Shop, Category, ShopFormData } from '../../types';
import { CATEGORY_OPTIONS } from '../../utils/categories';
import * as uploadApi from '../../api/upload';
import { geocodeAddress } from '../../utils/geocode';
import { searchAddress, AddressSuggestion } from '../../utils/addressSearch';

interface AddEditShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShopFormData) => Promise<void>;
  initialData?: Shop | null;
}

export default function AddEditShopModal({ isOpen, onClose, onSave, initialData }: AddEditShopModalProps) {
  const isEdit = !!initialData;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [meituanUrl, setMeituanUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<{ lat: number; lng: number } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const handleAddressChange = useCallback((value: string) => {
    setAddress(value);
    setSelectedGeo(null); // reset pre-selected coords when user edits
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const results = await searchAddress(value.trim());
      setSuggestions(results);
      if (results.length > 0 && addressInputRef.current) {
        const rect = addressInputRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          left: rect.left,
          top: rect.bottom + 4,
          width: rect.width,
          zIndex: 9999,
        });
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);
  }, []);

  const selectSuggestion = (s: AddressSuggestion) => {
    setAddress(s.name + (s.address ? ' ' + s.address : ''));
    setSelectedGeo({ lat: s.lat, lng: s.lng });
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setAddress(initialData.address);
        setCategory(initialData.category);
        setMeituanUrl(initialData.meituan_url || '');
        setNotes(initialData.notes || '');
        setExistingImages(initialData.images || []);
        setImages([]);
      } else {
        setName('');
        setAddress('');
        setCategory('other');
        setMeituanUrl('');
        setNotes('');
        setImages([]);
        setExistingImages([]);
      }
      setError('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedGeo(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('请输入店铺名称'); return; }
    if (!address.trim()) { setError('请输入详细地址'); return; }

    setLoading(true);
    try {
      // Use pre-selected coords if user picked from address suggestions
      let geo: { lat: number; lng: number } | null = selectedGeo;
      if (!geo) {
        const result = await geocodeAddress(address.trim());
        if (!result.ok) {
          const proceed = window.confirm(
            `无法定位该店铺的详细位置。\n\n原因：${result.error}\n\n是否仍然添加该店铺？（店铺将不会在地图上显示位置）`
          );
          if (!proceed) {
            setLoading(false);
            return;
          }
        } else {
          geo = result;
        }
      }

      // Upload new images first
      const uploadedUrls: string[] = [];
      for (const file of images) {
        try {
          const { url } = await uploadApi.uploadImage(file);
          uploadedUrls.push(url);
        } catch {
          setError('图片上传失败，请重试');
          setLoading(false);
          return;
        }
      }

      const allImages = [...existingImages, ...uploadedUrls];

      await onSave({
        name: name.trim(),
        address: address.trim(),
        category,
        meituan_url: meituanUrl.trim(),
        notes: notes.trim(),
        images,
        existingImages: allImages,
        ...(geo ? { lat: geo.lat, lng: geo.lng } : {}),
      });

      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || '保存失败，请重试';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '编辑店铺' : '添加店铺'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            店铺名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：海底捞火锅"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            maxLength={100}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            详细地址 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={addressInputRef}
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0 && addressInputRef.current) {
                const rect = addressInputRef.current.getBoundingClientRect();
                setDropdownStyle({
                  position: 'fixed',
                  left: rect.left,
                  top: rect.bottom + 4,
                  width: rect.width,
                  zIndex: 9999,
                });
                setShowSuggestions(true);
              }}}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="输入地址搜索，如：北京市朝阳区建国路88号"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              maxLength={200}
            />
            {selectedGeo && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500">✓ 已定位</span>
            )}
            {showSuggestions && suggestions.length > 0 &&
              createPortal(
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto" style={dropdownStyle}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">{s.name}</div>
                      {s.address && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{s.district}{s.address}</div>
                      )}
                    </button>
                  ))}
                </div>,
                document.body
              )
            }
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition border ${
                  category === opt.value
                    ? 'border-current shadow-sm'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                style={{
                  color: category === opt.value ? opt.color : undefined,
                  backgroundColor: category === opt.value ? opt.bgColor : undefined,
                  borderColor: category === opt.value ? opt.color : undefined,
                }}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowCategoryManager(true)}
            className="mt-1 text-xs text-primary-500 hover:text-primary-600 transition"
          >
            + 管理分类
          </button>
        </div>

        {/* Meituan URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">美团链接（可选）</label>
          <input
            type="url"
            value={meituanUrl}
            onChange={(e) => setMeituanUrl(e.target.value)}
            placeholder="https://meituan.com/..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注（推荐菜、评价等）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="如：推荐番茄锅底，人均100元"
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-none"
            maxLength={500}
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">店铺图片</label>
          <ImageUpload
            images={images}
            existingImages={existingImages}
            onImagesChange={(newImgs, existing) => {
              setImages(newImgs);
              setExistingImages(existing);
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? '保存修改' : '添加店铺'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
        </div>
      </form>
    </Modal>

    <CategoryManager
      isOpen={showCategoryManager}
      onClose={() => setShowCategoryManager(false)}
    />
    </>
  );
}
