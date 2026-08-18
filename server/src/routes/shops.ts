import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as shopService from '../services/shopService';
import * as categoryService from '../services/categoryService';
import { AuthRequest } from '../types';

const router = Router();

// All shop routes require authentication
router.use(authMiddleware);

// GET /api/shops — list shops with optional filters
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const { category, city, keyword } = req.query;
    const result = shopService.getAllShops(req.userId!, {
      category: category as string || undefined,
      city: city as string || undefined,
      keyword: keyword as string || undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: '获取店铺列表失败' });
  }
});

// GET /api/shops/:id — get single shop
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const shop = shopService.getShopById(req.userId!, parseInt(req.params.id));
    if (!shop) {
      res.status(404).json({ error: '店铺不存在' });
      return;
    }
    res.json({ shop });
  } catch (err: any) {
    res.status(500).json({ error: '获取店铺详情失败' });
  }
});

// POST /api/shops — create shop
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, category, meituan_url, notes, images } = req.body;

    // Validation
    if (!name || !name.trim()) {
      res.status(400).json({ error: '店铺名称不能为空' });
      return;
    }
    if (!address || !address.trim()) {
      res.status(400).json({ error: '店铺地址不能为空' });
      return;
    }
    const validCategories = categoryService.getCategoryMap(req.userId!);
    if (category && !validCategories[category]) {
      res.status(400).json({ error: '无效的分类' });
      return;
    }

    const shop = await shopService.createShop(req.userId!, {
      name: name.trim(),
      address: address.trim(),
      category: category || 'other',
      meituan_url: meituan_url || '',
      notes: notes || '',
      images: images || [],
    });

    res.status(201).json({ shop });
  } catch (err: any) {
    console.error('Create shop error:', err);
    res.status(500).json({ error: '添加店铺失败' });
  }
});

// PUT /api/shops/:id — update shop
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const shopId = parseInt(req.params.id);
    const { name, address, category, meituan_url, notes, images, is_shared } = req.body;

    const validCategories = categoryService.getCategoryMap(req.userId!);
    if (category && !validCategories[category]) {
      res.status(400).json({ error: '无效的分类' });
      return;
    }

    const shop = await shopService.updateShop(req.userId!, shopId, {
      name,
      address,
      category,
      meituan_url,
      notes,
      images,
      is_shared,
    });

    res.json({ shop });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: '店铺不存在' });
      return;
    }
    console.error('Update shop error:', err);
    res.status(500).json({ error: '更新店铺失败' });
  }
});

// PATCH /api/shops/:id/checkin — toggle check-in status
router.patch('/:id/checkin', (req: AuthRequest, res: Response) => {
  try {
    const shopId = parseInt(req.params.id);
    const shop = shopService.toggleCheckIn(req.userId!, shopId);
    res.json({ shop });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: '店铺不存在' });
      return;
    }
    console.error('Toggle checkin error:', err);
    res.status(500).json({ error: '打卡操作失败' });
  }
});

// DELETE /api/shops/:id — delete shop
router.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const shopId = parseInt(req.params.id);
    shopService.deleteShop(req.userId!, shopId);
    res.json({ message: '删除成功' });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: '店铺不存在' });
      return;
    }
    console.error('Delete shop error:', err);
    res.status(500).json({ error: '删除店铺失败' });
  }
});

export default router;
