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
  
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export const supplierService = {
  
  // Get all suppliers
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const response = await axios.get(`${API_URL}/api/suppliers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  // Get supplier by ID
  async getSupplierById(id: string): Promise<Supplier> {
    try {
      const response = await axios.get(`${API_URL}/api/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplier with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new supplier
  async createSupplier(supplierData: CreateSupplierData): Promise<Supplier> {
    try {
      const response = await axios.post(`${API_URL}/api/suppliers`, supplierData);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  // Update supplier
  async updateSupplier(id: string, supplierData: UpdateSupplierData): Promise<Supplier> {
    try {
      const response = await axios.put(`${API_URL}/api/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      console.error(`Error updating supplier with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete supplier
  async deleteSupplier(id: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/api/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting supplier with ID ${id}:`, error);
      throw error;
    }
  },

  // Search suppliers
  async searchSuppliers(query: string): Promise<Supplier[]> {
    try {
      const response = await axios.get(`${API_URL}/api/suppliers/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching suppliers with query "${query}":`, error);
      throw error;
    }
  }
};
