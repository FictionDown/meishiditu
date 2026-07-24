import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error:', err);

  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: '文件太大，最大支持 5MB' });
    return;
  }

  if (err.message && err.message.includes('不支持的文件格式')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: '服务器内部错误' });
}
