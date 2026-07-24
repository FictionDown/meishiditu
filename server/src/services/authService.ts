import { run, get, getLastInsertId } from '../db/connection';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { User } from '../types';

export function register(phone: string, password: string, nickname: string): { token: string; user: { id: number; phone: string; nickname: string } } {
  // Check if phone already exists
  const existing = get<User>('SELECT id FROM users WHERE phone = ?', [phone]);
  if (existing) {
    throw new Error('PHONE_EXISTS');
  }

  const passwordHash = hashPassword(password);
  run(
    'INSERT INTO users (phone, password_hash, nickname) VALUES (?, ?, ?)',
    [phone, passwordHash, nickname]
  );

  // Query back to get the assigned ID
  const newUser = get<User>('SELECT * FROM users WHERE phone = ?', [phone]);
  const id = newUser!.id;

  const token = signToken(id);
  return {
    token,
    user: { id, phone, nickname },
  };
}

export function login(phone: string, password: string): { token: string; user: { id: number; phone: string; nickname: string } } {
  const user = get<User>('SELECT * FROM users WHERE phone = ?', [phone]);
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const valid = comparePassword(password, user.password_hash);
  if (!valid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = signToken(user.id);
  return {
    token,
    user: { id: user.id, phone: user.phone, nickname: user.nickname },
  };
}

export function getUserById(id: number): { id: number; phone: string; nickname: string } | null {
  const user = get<User>('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) return null;
  return { id: user.id, phone: user.phone, nickname: user.nickname };
}
