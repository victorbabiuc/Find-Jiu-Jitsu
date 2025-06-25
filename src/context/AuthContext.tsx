import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage.service';
import { apiService } from '../services/api.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // MVP: Bypass authentication - set loading to false immediately
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // MVP: No loading state needed

  useEffect(() => {
    // MVP: Skip loading user data - no authentication required
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // MVP: Keep method for future re-integration
    try {
      const { user, token } = await apiService.login(email, password);
      setUser(user);
      await storageService.setItem('user', user);
      await storageService.setItem('token', token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User>) => {
    // MVP: Keep method for future re-integration
    try {
      const { user, token } = await apiService.register(userData);
      setUser(user);
      await storageService.setItem('user', user);
      await storageService.setItem('token', token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // MVP: Keep method for future re-integration
    setUser(null);
    await storageService.removeItem('user');
    await storageService.removeItem('token');
  };

  const updateUser = async (updates: Partial<User>) => {
    // MVP: Keep method for future re-integration
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await storageService.setItem('user', updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};