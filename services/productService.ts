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
}

export interface CreateProductData {
  name: string;
  description: string;
  categoryId?: string;
  status?: ProductStatus;
  image?: string | null; // Para mantener compatibilidad con el frontend actual
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  categoryId?: string;
  status?: ProductStatus;
  image?: string | null; // Para mantener compatibilidad con el frontend actual
}

export const productService = {
  
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/api/products`, {
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
  async deleteProduct(id: string): Promise<void> {
    try {
      const token = authService.getToken();
      await axios.delete(`${API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // La API devuelve 204 sin contenido
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  
  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/api/products/search?query=${encodeURIComponent(query)}`, {
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
