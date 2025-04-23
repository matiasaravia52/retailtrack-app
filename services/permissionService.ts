import axios from 'axios';
import { Permission } from '@/types/auth';
import { authService } from './authService';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://retailtrack-api-production.up.railway.app';

// Permission service
export const permissionService = {
  // Get all permissions
  getPermissions: async (): Promise<Permission[]> => {
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
      
      const response = await axios.get<Permission[]>(`${API_URL}/api/permissions`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching permissions:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error('Unexpected error fetching permissions:', error);
      }
      throw error;
    }
  },

  // Get permission by ID
  getPermissionById: async (id: string): Promise<Permission> => {
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
      
      const response = await axios.get<Permission>(`${API_URL}/api/permissions/${id}`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching permission with ID ${id}:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error fetching permission with ID ${id}:`, error);
      }
      throw error;
    }
  }
};
