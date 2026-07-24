import axios from 'axios';
import { config } from '../config';

interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Geocode an address string to lat/lng using AMap Geocoding REST API.
 * Note: AMap returns "lng,lat" format — we swap to {lat, lng}.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!config.amapKey) {
    console.warn('AMAP_KEY not configured, skipping geocoding');
    return null;
  }

  try {
    const { data } = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
      params: {
        key: config.amapKey,
        address,
        output: 'JSON',
      },
      timeout: 10000,
    });

    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const location = data.geocodes[0].location; // "116.397,39.908" (lng,lat)
      const [lng, lat] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    console.warn(`Geocoding failed for address: "${address}"`, data);
    return null;
  } catch (err) {
    console.error('Geocoding API error:', err);
    return null;
  }
}
