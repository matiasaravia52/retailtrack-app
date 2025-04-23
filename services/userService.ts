import axios, { AxiosResponse, AxiosError } from 'axios';
import { authService } from './authService';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://retailtrack-api-production.up.railway.app';

// Configurar axios para manejar errores de red
axios.interceptors.response.use(
  <T,>(response: AxiosResponse<T>) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return Promise.reject(error);
  }
);

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'employee';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'employee';
}

// User service
export const userService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // La ruta correcta es /api/users según la configuración en app.ts y routes/users.ts
      const response = await axios.get<User[]>(`${API_URL}/api/users`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching users:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error('Unexpected error fetching users:', error);
      }
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // La ruta correcta es /api/users/:id según la configuración en routes/users.ts
      const response = await axios.get<User>(`${API_URL}/api/users/${id}`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching user ${id}:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error fetching user ${id}:`, error);
      }
      throw error;
    }
  },

  // Create new user
  createUser: async (userData: CreateUserData): Promise<User> => {
    try {
      console.log('Creating user with data:', JSON.stringify(userData));
      
      // Intentar crear el usuario sin token primero, ya que las rutas de usuario no tienen middleware de autenticación
      try {
        const response = await axios.post<User>(`${API_URL}/api/users`, userData);
        console.log('User created successfully:', response.data);
        return response.data;
      } catch (initialError) {
        console.log('Initial attempt failed, trying with authentication token...');
        
        // Si falla, intentar con token de autenticación
        const token = authService.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Configurar headers con el token
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        console.log('Sending authenticated request to create user...');
        const response = await axios.post<User>(`${API_URL}/api/users`, userData, config);
        console.log('User created successfully with auth token:', response.data);
        return response.data;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating user:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        if (error.request) {
          console.error('Request data:', error.request);
        }
        console.error('Error config:', error.config);
      } else {
        console.error('Unexpected error creating user:', error);
      }
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.put<User>(`${API_URL}/api/users/${id}`, userData, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error updating user ${id}:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error updating user ${id}:`, error);
      }
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ message: string }> => {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.delete<{ message: string }>(`${API_URL}/api/users/${id}`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error deleting user ${id}:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error deleting user ${id}:`, error);
      }
      throw error;
    }
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get<User[]>(`${API_URL}/api/users/search?query=${encodeURIComponent(query)}`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error searching users with query "${query}":`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error searching users with query "${query}":`, error);
      }
      throw error;
    }
  },

  // Update last login
  updateLastLogin: async (id: string): Promise<{ message: string }> => {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.put<{ message: string }>(`${API_URL}/api/users/${id}/last-login`, {}, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error updating last login for user ${id}:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error updating last login for user ${id}:`, error);
      }
      throw error;
    }
  }
};
