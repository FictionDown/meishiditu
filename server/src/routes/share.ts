import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as shareService from '../services/shareService';
import { AuthRequest } from '../types';

const router = Router();

// GET /api/share/:shareId — public: view shared shop
router.get('/:shareId', (req: AuthRequest, res: Response) => {
  try {
    const result = shareService.getSharedShop(req.params.shareId);
    if (!result) {
      res.status(404).json({ error: '分享链接不存在或已失效' });
      return;
    }
    res.json(result);
  } catch (err: any) {
    console.error('Get shared shop error:', err);
    res.status(500).json({ error: '获取分享内容失败' });
  }
});

// POST /api/share/:shareId/copy — auth required: copy to my collection
router.post('/:shareId/copy', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const shop = shareService.copyShopToUser(req.userId!, req.params.shareId);
    if (!shop) {
      res.status(404).json({ error: '分享链接不存在或已失效' });
      return;
    }
    res.status(201).json({ shop });
  } catch (err: any) {
    console.error('Copy shared shop error:', err);
    res.status(500).json({ error: '收藏失败' });
  }
});

export default router;
