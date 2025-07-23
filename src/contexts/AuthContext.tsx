'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isRedirecting: boolean;
  error: string | null;
  loginAsDemoUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  setRedirecting: (redirecting: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRedirecting = (redirecting: boolean) => {
    setIsRedirecting(redirecting);
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have an auth token on the client side first
      const hasAuthToken = document.cookie.includes('auth_token=');
      
      if (!hasAuthToken) {
        // No token, user is not authenticated
        setUser(null);
        return;
      }

      // Only make server verification call if we have a token
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ app_name: 'airecipes' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Failed to check authentication status.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          app_name: 'airecipes',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          throw new Error('Login failed');
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoUser = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'demo123',
          app_name: 'airecipes',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          throw new Error('Demo login failed');
        }
      } else {
        throw new Error('Demo login failed');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Failed to login as demo user');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Add focus event listener to re-check auth status when tab becomes active
  useEffect(() => {
    const handleFocus = () => {
      // Only re-check if we're not currently loading
      if (!isLoading) {
        checkAuthStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isLoading]);

  const value: AuthContextType = {
    user,
    isLoading,
    isRedirecting,
    error,
    login,
    loginAsDemoUser,
    logout,
    checkAuthStatus,
    setRedirecting,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 