import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { directusAPI } from '../services/api';
import type { AuthUser, LoginCredentials, RegisterData } from '../types';
import { notifications } from '@mantine/notifications';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (directusAPI.isAuthenticated()) {
        const cachedUser = directusAPI.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);
        } else {
          // Fetch fresh user data
          const userData = await directusAPI.getCurrentUser();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear any invalid tokens
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      await directusAPI.login(credentials);
      const userData = await directusAPI.getCurrentUser();
      setUser(userData);
      
      notifications.show({
        title: 'Success',
        message: 'Welcome back!',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Login failed:', error);
      notifications.show({
        title: 'Login Failed',
        message: error.response?.data?.errors?.[0]?.message || 'Invalid credentials',
        color: 'red',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      await directusAPI.register(userData);
      const currentUser = await directusAPI.getCurrentUser();
      setUser(currentUser);
      
      notifications.show({
        title: 'Success',
        message: 'Account created successfully!',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      notifications.show({
        title: 'Registration Failed',
        message: error.response?.data?.errors?.[0]?.message || 'Registration failed',
        color: 'red',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await directusAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      notifications.show({
        title: 'Logged out',
        message: 'You have been logged out successfully',
        color: 'blue',
      });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
