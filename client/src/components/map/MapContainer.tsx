import { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Shop } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { MAP_CONFIG } from '../../utils/mapConfig';

interface MapContainerProps {
  shops: Shop[];
  selectedShopId: number | null;
  onShopSelect: (shop: Shop) => void;
  onMapClick: () => void;
  interactive?: boolean;
  center?: [number, number];
  zoom?: number;
}

export default function MapContainer({
  shops,
  selectedShopId,
  onShopSelect,
  onMapClick,
  interactive = true,
  center,
  zoom,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const amapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Initialize map
  useEffect(() => {
    let cancelled = false;
    const amapKey = import.meta.env.VITE_AMAP_KEY;

    AMapLoader.load({
      key: amapKey,
      version: '2.0',
      plugins: ['AMap.Geocoder', 'AMap.AutoComplete', 'AMap.PlaceSearch'],
    })
      .then((AMap: any) => {
        if (cancelled || !mapContainerRef.current) return;

        (window as any).AMap = AMap;
        amapRef.current = AMap;

        const map = new AMap.Map(mapContainerRef.current, {
          zoom: zoom || MAP_CONFIG.defaultZoom,
          center: center || MAP_CONFIG.center,
          viewMode: '2D',
          resizeEnable: true,
        });
        mapRef.current = map;

        if (interactive) {
          map.on('click', () => onMapClick());
        }

        console.log('[Map] Initialized successfully');
        setMapLoaded(true);
      })
      .catch((err: any) => {
        console.error('[Map] Load failed:', err);
        setLoadError('地图加载失败，请检查网络或API密钥');
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync markers — clear all and rebuild each time
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !amapRef.current) return;

    const AMap = amapRef.current;
    const map = mapRef.current;

    // Remove old markers
    markersRef.current.forEach((m) => map.remove(m));
    markersRef.current = [];

    console.log(`[Map] Syncing ${shops.length} shops, keys:`, shops.map(s => ({ id: s.id, lat: s.lat, lng: s.lng })));

    shops.forEach((shop) => {
      // Require valid non-zero coordinates
      if (!shop.lat || !shop.lng) {
        console.log(`[Map] Skip "${shop.name}" — no coords (lat:${shop.lat}, lng:${shop.lng})`);
        return;
      }

      const cat = CATEGORIES[shop.category] || CATEGORIES.other;
      const isSelected = shop.id === selectedShopId;
      const isCheckedIn = shop.is_checked_in;
      const size = isSelected ? 44 : 36;
      const borderColor = isCheckedIn ? '#22c55e' : 'white';

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="
          width:${size}px;height:${size}px;
          background:${cat.color};
          border:3px solid ${borderColor};
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
          font-size:${isSelected ? '22px' : '18px'};
          cursor:pointer;
          position:relative;
        ">${cat.icon}${
          isCheckedIn ? '<span style="position:absolute;bottom:-2px;right:-2px;font-size:10px;">✅</span>' : ''
        }</div>
      `;

      const marker = new AMap.Marker({
        position: [shop.lng, shop.lat],
        content: markerContent.firstElementChild as HTMLElement,
        offset: new AMap.Pixel(-size / 2, -size / 2),
        zIndex: isSelected ? 100 : 50,
      });

      marker.on('click', () => onShopSelect(shop));
      map.add(marker);
      markersRef.current.push(marker);

      console.log(`[Map] Added marker: "${shop.name}" at [${shop.lng}, ${shop.lat}]`);
    });
  }, [shops, selectedShopId, mapLoaded, onShopSelect]);

  // Pan to selected shop
  useEffect(() => {
    if (!mapRef.current || !selectedShopId) return;
    const shop = shops.find((s) => s.id === selectedShopId);
    if (shop?.lat && shop?.lng) {
      mapRef.current.setZoomAndCenter(15, [shop.lng, shop.lat]);
    }
  }, [selectedShopId, shops]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p>{loadError}</p>
          <p className="text-sm mt-1">请在 .env 文件中设置 VITE_AMAP_KEY</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: '300px' }}
    />
  );
}
