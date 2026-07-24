import { v4 as uuidv4 } from 'uuid';
import { run, get, all } from '../db/connection';
import { geocodeAddress } from './geocodeService';
import { Shop, CreateShopInput, UpdateShopInput, ShopFilters } from '../types';

export function getAllShops(userId: number, filters?: ShopFilters): { shops: Shop[]; total: number; cities: string[] } {
  let sql = 'SELECT * FROM shops WHERE user_id = ?';
  const params: any[] = [userId];

  if (filters?.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters?.city) {
    sql += ' AND address LIKE ?';
    params.push(`%${filters.city}%`);
  }
  if (filters?.keyword) {
    sql += ' AND (name LIKE ? OR address LIKE ? OR notes LIKE ?)';
    const kw = `%${filters.keyword}%`;
    params.push(kw, kw, kw);
  }

  sql += ' ORDER BY updated_at DESC';

  const shops = all<Shop>(sql, params);
  const total = shops.length;

  // Extract distinct cities from addresses
  const citiesSet = new Set<string>();
  const allUserShops = all<Shop>('SELECT address FROM shops WHERE user_id = ?', [userId]);
  allUserShops.forEach((s) => {
    const city = extractCityFromAddress(s.address);
    if (city) citiesSet.add(city);
  });

  return {
    shops: shops.map(formatShop),
    total,
    cities: Array.from(citiesSet).sort(),
  };
}

export function getShopById(userId: number, shopId: number): Shop | undefined {
  const shop = get<Shop>('SELECT * FROM shops WHERE id = ? AND user_id = ?', [shopId, userId]);
  return shop ? formatShop(shop) : undefined;
}

export async function createShop(userId: number, input: CreateShopInput): Promise<Shop> {
  let lat: number, lng: number;

  // Use client-provided coordinates if available, otherwise server-side geocode
  if (input.lat !== undefined && input.lng !== undefined) {
    lat = input.lat;
    lng = input.lng;
  } else {
    const geoResult = await geocodeAddress(input.address);
    lat = geoResult?.lat ?? 0;
    lng = geoResult?.lng ?? 0;
  }

  const shareId = uuidv4();
  const images = JSON.stringify(input.images || []);
  const now = new Date().toISOString();

  run(
    `INSERT INTO shops (user_id, name, address, lat, lng, category, meituan_url, notes, images, share_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.name,
      input.address,
      lat,
      lng,
      input.category || 'other',
      input.meituan_url || '',
      input.notes || '',
      images,
      shareId,
      now,
      now,
    ]
  );

  // Query back to get the assigned ID using the unique share_id
  const newShop = get<Shop>('SELECT * FROM shops WHERE share_id = ?', [shareId]);
  return formatShop(newShop!);
}

export async function updateShop(userId: number, shopId: number, input: UpdateShopInput): Promise<Shop> {
  const existing = get<Shop>('SELECT * FROM shops WHERE id = ? AND user_id = ?', [shopId, userId]);
  if (!existing) {
    throw new Error('NOT_FOUND');
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name);
  }
  if (input.address !== undefined) {
    updates.push('address = ?');
    params.push(input.address);
  }
  // Use client-provided lat/lng if available
  if (input.lat !== undefined && input.lng !== undefined) {
    updates.push('lat = ?');
    params.push(input.lat);
    updates.push('lng = ?');
    params.push(input.lng);
  } else if (input.address !== undefined && input.address !== existing.address) {
    // Re-geocode if address changed and no client coordinates
    const geoResult = await geocodeAddress(input.address);
    if (geoResult) {
      updates.push('lat = ?');
      params.push(geoResult.lat);
      updates.push('lng = ?');
      params.push(geoResult.lng);
    }
  }
  if (input.category !== undefined) {
    updates.push('category = ?');
    params.push(input.category);
  }
  if (input.meituan_url !== undefined) {
    updates.push('meituan_url = ?');
    params.push(input.meituan_url);
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?');
    params.push(input.notes);
  }
  if (input.images !== undefined) {
    updates.push('images = ?');
    params.push(JSON.stringify(input.images));
  }
  if (input.is_shared !== undefined) {
    updates.push('is_shared = ?');
    params.push(input.is_shared);
  }

  if (updates.length === 0) {
    return formatShop(existing);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(shopId, userId);

  run(`UPDATE shops SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);

  const updated = get<Shop>('SELECT * FROM shops WHERE id = ?', [shopId]);
  return formatShop(updated!);
}

export function deleteShop(userId: number, shopId: number): void {
  const existing = get<Shop>('SELECT * FROM shops WHERE id = ? AND user_id = ?', [shopId, userId]);
  if (!existing) {
    throw new Error('NOT_FOUND');
  }
  run('DELETE FROM shops WHERE id = ? AND user_id = ?', [shopId, userId]);
}

// Helper: extract city from address
function extractCityFromAddress(address: string): string {
  // Match Chinese city patterns
  const patterns = [
    /(.+?市)/,
    /(.+?地区)/,
    /(.+?州)/,
    /(.+?盟)/,
  ];
  for (const p of patterns) {
    const match = address.match(p);
    if (match) return match[1];
  }
  return '';
}

// Helper: parse JSON images string to array
function formatShop(shop: Shop): Shop {
  try {
    shop.images = JSON.parse(shop.images as any);
  } catch {
    shop.images = [] as any;
  }
  return shop;
}
