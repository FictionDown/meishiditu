import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useShops } from '../hooks/useShops';
import { useToast } from '../components/common/Toast';
import ProtectedRoute from '../components/common/ProtectedRoute';
import ErrorBoundary from '../components/common/ErrorBoundary';
import AppHeader from '../components/layout/AppHeader';
import MapContainer from '../components/map/MapContainer';
import ShopList from '../components/shop/ShopList';
import ShopDetailPanel from '../components/shop/ShopDetailPanel';
import AddEditShopModal from '../components/shop/AddEditShopModal';
import SearchBar from '../components/search/SearchBar';
import CategoryFilter from '../components/search/CategoryFilter';
import CityFilter from '../components/search/CityFilter';
import { Shop, ShopFormData } from '../types';
import * as shopsApi from '../api/shops';

export default function MainPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <MainPageContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}

function MainPageContent() {
  const {
    shops,
    cities,
    loading,
    error,
    filters,
    updateFilter,
    addShop,
    updateShopInList,
    removeShop,
  } = useShops();

  const { showToast } = useToast();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleShopSelect = useCallback((shop: Shop) => {
    setSelectedShop(shop);
    setDetailVisible(true);
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedShop(null);
    setDetailVisible(false);
  }, []);

  const handleAddShop = async (data: ShopFormData) => {
    try {
      const { shop } = await shopsApi.createShop({
        name: data.name,
        address: data.address,
        category: data.category,
        meituan_url: data.meituan_url,
        notes: data.notes,
        images: data.existingImages,
        lat: data.lat,
        lng: data.lng,
      });
      addShop(shop);
      setSelectedShop(shop);
      setDetailVisible(true);
      showToast('店铺添加成功');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || '添加失败，请重试';
      showToast(msg, 'error');
      throw err; // re-throw so modal shows the error too
    }
  };

  const handleEditShop = async (data: ShopFormData) => {
    try {
      if (!editingShop) return;
      const { shop } = await shopsApi.updateShop(editingShop.id, {
        name: data.name,
        address: data.address,
        category: data.category,
        meituan_url: data.meituan_url,
        notes: data.notes,
        images: data.existingImages,
        lat: data.lat,
        lng: data.lng,
      });
      updateShopInList(shop);
      setSelectedShop(shop);
      showToast('店铺修改成功');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || '修改失败，请重试';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleDeleteShop = async (shopId: number) => {
    try {
      await shopsApi.deleteShop(shopId);
      removeShop(shopId);
      setSelectedShop(null);
      setDetailVisible(false);
      showToast('店铺已删除');
    } catch (err: any) {
      showToast('删除失败', 'error');
    }
  };

  const openEditModal = useCallback((shop: Shop) => {
    setEditingShop(shop);
    setIsAddModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingShop(null);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Top header */}
      <AppHeader onAddShop={() => setIsAddModalOpen(true)} />

      {/* Main three-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
          {/* Filters */}
          <div className="p-3 space-y-3 border-b border-gray-200">
            <SearchBar
              value={filters.keyword}
              onChange={(v) => updateFilter('keyword', v)}
            />
            <CategoryFilter
              value={filters.category}
              onChange={(v) => updateFilter('category', v)}
            />
            {cities.length > 0 && (
              <CityFilter
                value={filters.city}
                onChange={(v) => updateFilter('city', v)}
                cities={cities}
              />
            )}
          </div>

          {/* Shop list */}
          <div className="flex-1 overflow-y-auto">
            <ShopList
              shops={shops}
              selectedShopId={selectedShop?.id || null}
              onShopSelect={handleShopSelect}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Center map */}
        <div className="flex-1 relative">
          <MapContainer
            shops={shops}
            selectedShopId={selectedShop?.id || null}
            onShopSelect={handleShopSelect}
            onMapClick={handleMapClick}
          />
        </div>

        {/* Right detail panel */}
        {detailVisible && selectedShop && (
          <div className="w-96 shrink-0 border-l border-gray-200">
            <ShopDetailPanel
              shop={selectedShop}
              onEdit={openEditModal}
              onDelete={handleDeleteShop}
              onClose={() => { setDetailVisible(false); setSelectedShop(null); }}
            />
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <AddEditShopModal
        isOpen={isAddModalOpen}
        onClose={closeModal}
        onSave={editingShop ? handleEditShop : handleAddShop}
        initialData={editingShop}
      />
    </div>
  );
}
