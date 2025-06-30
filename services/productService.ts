import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://retailtrack-api-production.up.railway.app';

axios.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}
  
export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId?: string | null;
  status: ProductStatus;
  image?: string | null; // Añadimos imagen aunque no esté en el modelo de la API para mantener compatibilidad
  createdAt?: string;
  updatedAt?: string;
  stock: number;
  retail_price: number;
  wholesale_price: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  categoryId?: string;
  status?: ProductStatus;
  image?: string | null; // Para mantener compatibilidad con el frontend actual
  stock?: number;
  retail_price?: number;
  wholesale_price?: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  categoryId?: string;
  status?: ProductStatus;
  image?: string | null; // Para mantener compatibilidad con el frontend actual
  stock?: number;
  retail_price?: number;
  wholesale_price?: number;
}

export interface ProductFilters {
  status?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; message: string }>;
  successItems: Array<{ name: string; id: string }>;
}

export const productService = {
  
  // Get all products
  async getAllProducts(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
    try {
      const token = authService.getToken();
      
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      
      const response = await axios.get(`${API_URL}/api/products${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  // Create new product
  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/api/products`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update product
  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/api/products/${id}`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  // Delete product
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        return { success: false, message: 'No autorizado' };
      }
      
      const response = await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return { success: true, message: 'Producto eliminado correctamente' };
    } catch (error) {
      console.error('Error deleting product:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Error al eliminar el producto';
        return { success: false, message: errorMessage };
      }
      
      return { success: false, message: 'Error al conectar con el servidor' };
    }
  },
  
  // Import products from CSV
  async importProductsFromCsv(file: File): Promise<ImportResult> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autorizado');
      }
      
      console.log('Preparando archivo para envío:', file.name, file.type, file.size);
      
      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file, file.name); // Asegurarnos de incluir el nombre del archivo
      
      // Verificar que el FormData se creó correctamente
      console.log('FormData creado, contiene:', Array.from(formData.entries()).map(entry => {
        if (entry[1] instanceof File) {
          return `${entry[0]}: File(${(entry[1] as File).name}, ${(entry[1] as File).size} bytes)`;
        }
        return `${entry[0]}: ${entry[1]}`;
      }));
      
      // Configurar la solicitud con los headers correctos
      // IMPORTANTE: No establecer Content-Type manualmente, axios lo hará automáticamente con el boundary correcto
      const response = await axios.post(`${API_URL}/api/import/products`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Dejar que axios configure el Content-Type automáticamente
        }
      });
      
      console.log('Respuesta del servidor:', response.status, response.data);

      return response.data.data;
    } catch (error) {
      console.error('Error importing products:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error de respuesta:', error.response.status, error.response.data);
        const errorMessage = error.response.data?.message || 'Error al importar productos';
        throw new Error(errorMessage);
      }
      
      throw new Error('Error al conectar con el servidor');
    }
  },
  
  // Download CSV template
  async downloadCsvTemplate(): Promise<void> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autorizado');
      }
      
      const response = await axios.get(`${API_URL}/api/import/products/template`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear un enlace para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_productos.csv');
      document.body.appendChild(link);
      
      // Simular clic para iniciar la descarga
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || 'Error al descargar la plantilla';
        throw new Error(errorMessage);
      }
      
      throw new Error('Error al conectar con el servidor');
    }
  },
  
  // Search products
  async searchProducts(query: string, filters?: ProductFilters): Promise<PaginatedResult<Product>> {
    try {
      const token = authService.getToken();
      
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      queryParams.append('query', query);
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
      }
      
      const response = await axios.get(`${API_URL}/api/products/search?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
};
