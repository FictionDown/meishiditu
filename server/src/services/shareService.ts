import { v4 as uuidv4 } from 'uuid';
import { get, run } from '../db/connection';
import { Shop } from '../types';

export function getSharedShop(shareId: string): { shop: Shop; sharedBy: { nickname: string } } | null {
  const row = get<any>(
    `SELECT s.*, u.nickname as shared_by_nickname
     FROM shops s
     JOIN users u ON s.user_id = u.id
     WHERE s.share_id = ? AND s.is_shared = 1`,
    [shareId]
  );

  if (!row) return null;

  // Parse images
  try {
    row.images = JSON.parse(row.images);
  } catch {
    row.images = [];
  }

  const { shared_by_nickname, ...shop } = row;

  return {
    shop: shop as Shop,
    sharedBy: { nickname: shared_by_nickname },
  };
}

export function copyShopToUser(userId: number, shareId: string): Shop | null {
  const source = get<Shop>(
    'SELECT * FROM shops WHERE share_id = ? AND is_shared = 1',
    [shareId]
  );

  if (!source) return null;

  const newShareId = uuidv4();
  const now = new Date().toISOString();

  run(
    `INSERT INTO shops (user_id, name, address, lat, lng, category, meituan_url, notes, images, is_shared, share_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [
      userId,
      source.name,
      source.address,
      source.lat,
      source.lng,
      source.category,
      source.meituan_url,
      source.notes,
      source.images,
      newShareId,
      now,
      now,
    ]
  );

  // Query back to get the new shop using the unique share_id
  const newShop = get<Shop>('SELECT * FROM shops WHERE share_id = ?', [newShareId]);
  if (newShop) {
    try {
      newShop.images = JSON.parse(newShop.images as any);
    } catch {
      newShop.images = [] as any;
    }
  }
  return newShop!;
}
