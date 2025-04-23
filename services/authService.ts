import axios, { AxiosResponse, AxiosError } from 'axios';
import { User, AuthResponse, LoginCredentials, Permission, Role } from '@/types/auth';

// API base URL
// Usar explícitamente la URL local para desarrollo
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://retailtrack-api-production.up.railway.app';

// Auth service
export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/login`, credentials);
      
      // Store token and user in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.message);
        if (error.response?.status === 401) {
          throw new Error('Credenciales inválidas. Por favor, verifique su email y contraseña.');
        }
      } else {
        console.error('Unexpected login error:', error);
      }
      throw error;
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Validate token
  validateToken: async (): Promise<User> => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Configure headers with token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get<{user: User}>(`${API_URL}/api/validate`, config);
      
      // Update user data in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Token validation error:', error.message);
        if (error.response?.status === 401) {
          // Token inválido o expirado
          console.error('Invalid or expired token');
        }
      } else {
        console.error('Unexpected token validation error:', error);
      }
      // If token is invalid, logout user
      authService.logout();
      throw error;
    }
  },

  // Obtener los roles del usuario
  getUserRoles: (): Role[] => {
    const user = authService.getCurrentUser();
    return user?.roles || [];
  },

  // Obtener los permisos del usuario
  getUserPermissions: async (): Promise<Permission[]> => {
    try {
      // Verificar si ya tenemos los permisos en localStorage
      const permissionsStr = localStorage.getItem('permissions');
      if (permissionsStr) {
        return JSON.parse(permissionsStr);
      }
      
      // Si no, obtenerlos del servidor
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Configure headers with token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get<Permission[]>(`${API_URL}/api/permissions`, config);
      
      // Guardar permisos en localStorage
      if (response.data) {
        localStorage.setItem('permissions', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching user permissions:', error.message);
        if (error.response?.status === 401) {
          // Si el token es inválido, cerrar sesión
          authService.logout();
        }
      } else {
        console.error('Unexpected error fetching user permissions:', error);
      }
      return [];
    }
  },

  // Verificar si el usuario tiene un permiso específico
  hasPermission: async (permissionName: string): Promise<boolean> => {
    try {
      const permissions = await authService.getUserPermissions();
      return permissions.some(p => p.name === permissionName);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },

  // Verificar si el usuario tiene un rol específico
  hasRole: (roleName: string): boolean => {
    const roles = authService.getUserRoles();
    return roles.some(r => r.name === roleName);
  }
};
