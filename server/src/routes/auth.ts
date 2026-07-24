import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as authService from '../services/authService';
import { AuthRequest } from '../types';

const router = Router();

// POST /api/auth/register
router.post('/register', (req: AuthRequest, res: Response) => {
  try {
    const { phone, password, nickname } = req.body;

    // Validation
    if (!phone || !/^1\d{10}$/.test(phone)) {
      res.status(400).json({ error: '请输入正确的11位手机号' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: '密码至少6位' });
      return;
    }
    if (!nickname || !nickname.trim()) {
      res.status(400).json({ error: '请输入昵称' });
      return;
    }

    const result = authService.register(phone, password, nickname.trim());
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'PHONE_EXISTS') {
      res.status(409).json({ error: '该手机号已注册' });
      return;
    }
    console.error('Register error:', err);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// POST /api/auth/login
router.post('/login', (req: AuthRequest, res: Response) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      res.status(400).json({ error: '请输入手机号和密码' });
      return;
    }

    const result = authService.login(phone, password);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: '手机号或密码错误' });
      return;
    }
    console.error('Login error:', err);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// GET /api/auth/me — get current user info
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const user = authService.getUserById(req.userId!);
    if (!user) {
      res.status(401).json({ error: '用户不存在' });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
