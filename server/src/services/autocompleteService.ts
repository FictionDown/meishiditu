import axios from 'axios';
import { config } from '../config';

export interface AutocompleteSuggestion {
  name: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
}

/**
 * Search address suggestions using AMap Input Tips REST API.
 * Returns up to 5 suggestions with name, address, district, and coordinates.
 */
export async function searchAddress(keyword: string): Promise<AutocompleteSuggestion[]> {
  if (!config.amapKey) {
    console.warn('AMAP_KEY not configured, skipping autocomplete');
    return [];
  }

  try {
    const { data } = await axios.get('https://restapi.amap.com/v3/assistant/inputtips', {
      params: {
        key: config.amapKey,
        keywords: keyword,
        city: '',
        citylimit: false,
        output: 'JSON',
        datatype: 'all',
      },
      timeout: 8000,
    });

    if (data.status === '1' && data.tips && data.tips.length > 0) {
      const suggestions: AutocompleteSuggestion[] = [];
      const seen = new Set<string>();

      for (const tip of data.tips) {
        // Skip tips without location or name
        if (!tip.location || !tip.name || tip.location === '0,0') continue;
        const dedupeKey = tip.name + (tip.district || '');
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const [lng, lat] = tip.location.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) continue;

        suggestions.push({
          name: tip.name,
          address: tip.district ? tip.district + (tip.address || '') : (tip.address || ''),
          district: tip.district || '',
          lat,
          lng,
        });

        if (suggestions.length >= 5) break;
      }

      return suggestions;
    }

    return [];
  } catch (err) {
    console.error('Autocomplete API error:', err);
    return [];
  }
}
