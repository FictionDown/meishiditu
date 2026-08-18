import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { searchAddress } from '../services/autocompleteService';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  const keyword = (req.query.keyword as string || '').trim();
  if (!keyword) {
    res.json([]);
    return;
  }

  try {
    const suggestions = await searchAddress(keyword);
    res.json(suggestions);
  } catch (err) {
    console.error('Address autocomplete error:', err);
    res.json([]);
  }
});

export default router;
