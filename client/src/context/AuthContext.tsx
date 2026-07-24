import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
  });

  // Validate token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState({ user: null, token: null, loading: false });
      return;
    }
    authApi.getMe()
      .then(({ user }) => {
        setState({ user, token, loading: false });
      })
      .catch(() => {
        localStorage.removeItem('token');
        setState({ user: null, token: null, loading: false });
      });
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const { token, user } = await authApi.login(phone, password);
    localStorage.setItem('token', token);
    setState({ user, token, loading: false });
  }, []);

  const register = useCallback(async (phone: string, password: string, nickname: string) => {
    const { token, user } = await authApi.register(phone, password, nickname);
    localStorage.setItem('token', token);
    setState({ user, token, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
