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

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface PurchaseLine {
  id: string;
  purchaseId: string;
  productId: string;
  batchId: string;
  quantity: number;
  unitCostPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
  };
}

export interface Purchase {
  id: string;
  supplierId: string;
  subtotal: number;
  taxes: number;
  total: number;
  status: PurchaseStatus;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    name: string;
  };
  purchaseLines?: PurchaseLine[];
}

export interface CreatePurchaseLineData {
  productId: string;
  batchId?: string;
  quantity: number;
  unitCostPrice: number;
  subtotal?: number;
}

export interface CreatePurchaseData {
  supplierId: string;
  subtotal?: number;
  taxes?: number;
  total?: number;
  status?: PurchaseStatus;
  purchaseLines?: CreatePurchaseLineData[];
}

export interface UpdatePurchaseData {
  supplierId?: string;
  subtotal?: number;
  taxes?: number;
  total?: number;
  status?: PurchaseStatus;
}

export const purchaseService = {
  
  // Get all purchases
  async getAllPurchases(): Promise<Purchase[]> {
    try {
      const response = await axios.get(`${API_URL}/api/purchases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  },

  // Get purchase by ID
  async getPurchaseById(id: string): Promise<Purchase> {
    try {
      const response = await axios.get(`${API_URL}/api/purchases/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new purchase
  async createPurchase(purchaseData: CreatePurchaseData): Promise<Purchase> {
    try {
      const response = await axios.post(`${API_URL}/api/purchases`, purchaseData);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  },

  // Update purchase
  async updatePurchase(id: string, purchaseData: UpdatePurchaseData): Promise<Purchase> {
    try {
      const response = await axios.put(`${API_URL}/api/purchases/${id}`, purchaseData);
      return response.data;
    } catch (error) {
      console.error(`Error updating purchase with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete purchase
  async deletePurchase(id: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/api/purchases/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting purchase with ID ${id}:`, error);
      throw error;
    }
  },

  // Search purchases
  async searchPurchases(query: string): Promise<Purchase[]> {
    try {
      const response = await axios.get(`${API_URL}/api/purchases/search?query=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching purchases with query "${query}":`, error);
      throw error;
    }
  },

  // Get purchases by supplier
  async getPurchasesBySupplier(supplierId: string): Promise<Purchase[]> {
    try {
      const response = await axios.get(`${API_URL}/api/purchases/supplier/${supplierId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchases for supplier ${supplierId}:`, error);
      throw error;
    }
  }
};
