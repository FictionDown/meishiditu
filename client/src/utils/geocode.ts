import apiClient from '../api/client';

export interface GeocodeOk {
  ok: true;
  lat: number;
  lng: number;
}

export interface GeocodeFail {
  ok: false;
  error: string;
}

export type GeocodeResult = GeocodeOk | GeocodeFail;

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    const { data } = await apiClient.get('/geocode', { params: { address } });
    return data;
  } catch (err: any) {
    const msg = err?.response?.data?.error || '位置查询失败，请稍后重试';
    return { ok: false, error: msg };
  }
}
