'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthResponse, AuthState, LoginCredentials, User } from '@/types/auth';
import { authService } from '@/services/authService';
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize auth state from local storage on mount
  useEffect(() => {
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.error('Error restoring auth state', e);
      clearStoredAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const data = await authService.loginUser(credentials);
      
      const authToken = (data as any).token || (data as any).accessToken;
      
      const userProfile: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
        token: authToken,
        refreshToken: (data as any).refreshToken,
      };

      setStoredAuth(authToken, userProfile);
      setToken(authToken);
      setUser(userProfile);

      return data;
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (!token) return;
      const updatedProfile = await authService.getCurrentUser();
      setUser(updatedProfile);
      if (token) setStoredAuth(token, updatedProfile);
    } catch {
      // If token is invalid, log out
      logout();
    }
  }, [token, logout]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
