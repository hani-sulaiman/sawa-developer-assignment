import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserResponse, LoginInput, RegisterInput } from '../../shared/schemas';
import api from '@/services/api';
import { notifyInfo } from '@/services/notify';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: UserResponse; token: string }>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'medbook_token';
const USER_KEY = 'medbook_user';
const UNAUTHORIZED_EVENT = 'medbook:unauthorized';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // SPA-safe auth invalidation (e.g. 401 from API)
  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      notifyInfo('Your session expired. Please sign in again.', 'Session expired');
      navigate('/login', { replace: true });
    };

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized as EventListener);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized as EventListener);
  }, [navigate]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verify token is still valid
          try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
              setUser(response.data.data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
            } else {
              // Token is invalid, clear auth state
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              setToken(null);
              setUser(null);
            }
          } catch {
            // Token verification failed, clear auth state
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Login failed');
    }

    const { token: newToken, user: newUser } = response.data.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    
    return { user: newUser, token: newToken };
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await api.post('/auth/register', input);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Registration failed');
    }

    const { token: newToken, user: newUser } = response.data.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
