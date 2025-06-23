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
  
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const customerService = {
  
  // Get all customers
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response = await axios.get(`${API_URL}/api/customers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  async getCustomerById(id: string): Promise<Customer> {
    try {
      const response = await axios.get(`${API_URL}/api/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new customer
  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    try {
      const response = await axios.post(`${API_URL}/api/customers`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  async updateCustomer(id: string, customerData: UpdateCustomerData): Promise<Customer> {
    try {
      const response = await axios.put(`${API_URL}/api/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete customer
  async deleteCustomer(id: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/api/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer with ID ${id}:`, error);
      throw error;
    }
  },

  // Search customers
  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const response = await axios.get(`${API_URL}/api/customers/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching customers with query "${query}":`, error);
      throw error;
    }
  }
};
