import axios, { AxiosResponse, AxiosError } from 'axios';
import { Role, Permission } from '@/types/auth';
import { authService } from './authService';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://retailtrack-api-production.up.railway.app';

// Role service
export const roleService = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
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
      
      // La ruta correcta es /api/roles según la configuración en app.ts
      const response = await axios.get<Role[]>(`${API_URL}/api/roles`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching roles:', error.message);
      } else {
        console.error('Unexpected error fetching roles:', error);
      }
      throw error;
    }
  },

  // Get role by ID
  getRoleById: async (id: string): Promise<Role> => {
    try {
      console.log(`Fetching role with ID: ${id}`);
      
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Asegurarse de que el ID sea válido
      if (!id) {
        throw new Error('Role ID is required');
      }
      
      console.log(`Making request to: ${API_URL}/api/roles/${id}`);
      const response = await axios.get<Role>(`${API_URL}/api/roles/${id}`, config);
      console.log('Role data received:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching role with ID ${id}:`, error.message);
      } else {
        console.error(`Unexpected error fetching role with ID ${id}:`, error);
      }
      throw error;
    }
  },

  // Get permissions for a role
  getRolePermissions: async (roleId: string): Promise<Permission[]> => {
    try {
      console.log(`Fetching permissions for role ID: ${roleId}`);
      
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Asegurarse de que el ID sea válido
      if (!roleId) {
        throw new Error('Role ID is required');
      }
      
      console.log(`Making request to: ${API_URL}/api/roles/${roleId}/permissions`);
      const response = await axios.get<Permission[]>(`${API_URL}/api/roles/${roleId}/permissions`, config);
      console.log('Permissions data received:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error fetching permissions for role ${roleId}:`, error.message);
      } else {
        console.error(`Unexpected error fetching permissions for role ${roleId}:`, error);
      }
      throw error;
    }
  },

  // Assign role to user
  assignRoleToUser: async (userId: string, roleId: string): Promise<{message: string}> => {
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
      
      // Enviar un array de roleIds como espera el backend
      const response = await axios.post<{message: string}>(`${API_URL}/api/users/${userId}/roles`, { roleIds: [roleId] }, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error assigning role ${roleId} to user ${userId}:`, error.message);
        // Mostrar más detalles del error para depuración
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error assigning role ${roleId} to user ${userId}:`, error);
      }
      throw error;
    }
  },

  // Remove role from user
  removeRoleFromUser: async (userId: string, roleId: string): Promise<{message: string}> => {
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
      
      const response = await axios.delete<{message: string}>(`${API_URL}/api/users/${userId}/roles/${roleId}`, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error removing role ${roleId} from user ${userId}:`, error.message);
      } else {
        console.error(`Unexpected error removing role ${roleId} from user ${userId}:`, error);
      }
      throw error;
    }
  },

  // Assign permissions to role
  assignPermissionsToRole: async (roleId: string, permissionIds: number[]): Promise<void> => {
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
      
      await axios.put(
        `${API_URL}/api/roles/${roleId}/permissions`, 
        { permissionIds }, 
        config
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error assigning permissions to role ${roleId}:`, error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error(`Unexpected error assigning permissions to role ${roleId}:`, error);
      }
      throw error;
    }
  },
  
  // Create new role
  createRole: async (roleData: { name: string; description?: string }): Promise<Role> => {
    try {
      console.log('Creating new role:', roleData);
      
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Configurar headers con el token
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Validar que el nombre del rol no esté vacío
      if (!roleData.name || !roleData.name.trim()) {
        throw new Error('Role name is required');
      }
      
      console.log(`Making request to: ${API_URL}/api/roles`);
      const response = await axios.post<Role>(`${API_URL}/api/roles`, roleData, config);
      console.log('Role created successfully:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error creating role:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      } else {
        console.error('Unexpected error creating role:', error);
      }
      throw error;
    }
  }
};
