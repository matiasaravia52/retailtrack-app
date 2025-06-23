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
  
export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

export const categoryService = {
  
  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await axios.get(`${API_URL}/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new category
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    try {
      const response = await axios.post(`${API_URL}/api/categories`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id: string, categoryData: UpdateCategoryData): Promise<Category> {
    try {
      const response = await axios.put(`${API_URL}/api/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      throw error;
    }
  },

  // Search categories
  async searchCategories(query: string): Promise<Category[]> {
    try {
      const response = await axios.get(`${API_URL}/api/categories/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching categories with query "${query}":`, error);
      throw error;
    }
  }
};
