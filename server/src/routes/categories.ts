import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as categoryService from '../services/categoryService';
import { AuthRequest } from '../types';

const router = Router();
router.use(authMiddleware);

// GET /api/categories — return defaults + user's custom categories
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const customs = categoryService.getUserCategories(req.userId!);
    res.json({ customs });
  } catch (err: any) {
    res.status(500).json({ error: '获取分类失败' });
  }
});

// POST /api/categories — create a custom category
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { label } = req.body;
    if (!label || !label.trim()) {
      res.status(400).json({ error: '分类名称不能为空' });
      return;
    }
    const category = categoryService.createCategory(req.userId!, { label: label.trim() });
    res.status(201).json({ category });
  } catch (err: any) {
    if (err.message === 'DUPLICATE_LABEL') {
      res.status(400).json({ error: '该分类名称已存在' });
      return;
    }
    res.status(500).json({ error: '创建分类失败' });
  }
});

// DELETE /api/categories/:id — delete a custom category (reverts shops to 'other')
router.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    categoryService.deleteCategory(req.userId!, categoryId);
    res.json({ message: '删除成功' });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      res.status(404).json({ error: '分类不存在' });
      return;
    }
    res.status(500).json({ error: '删除分类失败' });
  }
});

export default router;
