import axios from 'axios';

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
  
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  image: string | null;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  image?: string | null;
}

export const productService = {
  
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  // Create new product
  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const response = await axios.post(`${API_URL}/api/products`, productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update product
  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    try {
      const response = await axios.put(`${API_URL}/api/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  // Delete product
  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  
  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/api/products/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
};
