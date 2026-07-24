import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { geocodeAddress } from '../services/geocodeService';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  const address = (req.query.address as string || '').trim();
  if (!address) {
    res.status(400).json({ ok: false, error: '地址不能为空' });
    return;
  }

  try {
    const result = await geocodeAddress(address);
    if (!result) {
      res.json({ ok: false, error: '未找到该地址的位置信息，请检查地址是否正确' });
      return;
    }
    res.json({ ok: true, lat: result.lat, lng: result.lng });
  } catch (err) {
    res.status(500).json({ ok: false, error: '位置查询服务异常，请稍后重试' });
  }
});

export default router;
