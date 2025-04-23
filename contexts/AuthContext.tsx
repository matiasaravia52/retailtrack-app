'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { User, LoginCredentials, Permission } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permissionName: string) => Promise<boolean>;
  hasRole: (roleName: string) => boolean;
  permissions: Permission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Validate token and get user data
          const userData = await authService.validateToken();
          setUser(userData);
          
          // Cargar permisos del usuario
          const userPermissions = await authService.getUserPermissions();
          setPermissions(userPermissions);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Token is invalid, redirect to login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [router]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setUser(response.user);
      
      // Cargar permisos del usuario después del login
      const userPermissions = await authService.getUserPermissions();
      setPermissions(userPermissions);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setPermissions([]);
    router.push('/login');
  };
  
  // Verificar si el usuario tiene un permiso específico
  const hasPermission = async (permissionName: string): Promise<boolean> => {
    return await authService.hasPermission(permissionName);
  };
  
  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleName: string): boolean => {
    return authService.hasRole(roleName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
        hasRole,
        permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
