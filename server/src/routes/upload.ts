import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/upload — upload an image
router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.message && err.message.includes('不支持的文件格式')) {
        res.status(400).json({ error: '不支持的文件格式，只允许 JPG/PNG/WebP/GIF' });
        return;
      }
      res.status(400).json({ error: '文件上传失败' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: '请选择文件' });
      return;
    }

    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

export default router;
