import apiClient from '../api/client';

export interface AddressSuggestion {
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
}

/**
 * Search addresses using the server-side AMap Input Tips REST API.
 * Returns up to 5 suggestions with name, address, district, and coordinates.
 */
export async function searchAddress(keyword: string): Promise<AddressSuggestion[]> {
  if (!keyword.trim()) return [];

  try {
    const { data } = await apiClient.get<AddressSuggestion[]>('/address', {
      params: { keyword: keyword.trim() },
      timeout: 8000,
    });
    console.log('[AddressSearch] Found', data.length, 'suggestions for:', keyword);
    return data;
  } catch (err) {
    console.error('[AddressSearch] Error:', err);
    return [];
  }
}
