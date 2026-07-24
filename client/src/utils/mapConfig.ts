// AMap configuration
export const MAP_CONFIG = {
  // Geographic center of China
  center: [104.066, 30.572] as [number, number],
  defaultZoom: 5,
  cityZoom: 13,
  maxZoom: 18,
  minZoom: 3,
};

// Marker size configuration
export const MARKER_SIZE = {
  normal: 36,
  selected: 44,
};

export const NAVIGATE_URLS = {
  gaode: (lat: number, lng: number, name: string) =>
    `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=car&coordinate=gaode`,
  baidu: (lat: number, lng: number, name: string) =>
    `https://api.map.baidu.com/direction?destination=latlng:${lat},${lng}|name:${encodeURIComponent(name)}&coord_type=gcj02&mode=driving&output=html`,
};
