import jwt from 'jsonwebtoken';
import { config } from '../config';

interface TokenPayload {
  userId: number;
}

export function signToken(userId: number): string {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}
