import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://retailtrack-api-production.up.railway.app';

export interface Batch {
  id: string;
  productId: string;
  initialQuantity: number;
  availableQuantity: number;
  unitCost: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBatchData {
  productId: string;
  initialQuantity: number;
  availableQuantity: number;
  unitCost: number;
}

export interface UpdateBatchData {
  productId?: string;
  initialQuantity?: number;
  availableQuantity?: number;
  unitCost?: number;
}

export interface ProductInventory {
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  batches: Batch[];
}

export const batchService = {
  // Obtener todos los lotes
  async getAllBatches(): Promise<Batch[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/api/batches`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Obtener un lote por su ID
  async getBatchById(id: string): Promise<Batch> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/api/batches/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching batch ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo lote (esto automáticamente crea un movimiento de stock de entrada)
  async createBatch(batchData: CreateBatchData): Promise<Batch> {
    try {
      const token = authService.getToken();
      const response = await axios.post(`${API_URL}/api/batches`, batchData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  // Actualizar un lote existente
  async updateBatch(id: string, batchData: UpdateBatchData): Promise<Batch> {
    try {
      const token = authService.getToken();
      const response = await axios.put(`${API_URL}/api/batches/${id}`, batchData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating batch ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un lote
  async deleteBatch(id: string): Promise<void> {
    try {
      const token = authService.getToken();
      await axios.delete(`${API_URL}/api/batches/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting batch ${id}:`, error);
      throw error;
    }
  },

  // Buscar lotes
  async searchBatches(query: string): Promise<Batch[]> {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/api/batches/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching batches:', error);
      throw error;
    }
  },

  // Obtener lotes por producto
  async getBatchesByProduct(productId: string): Promise<Batch[]> {
    try {
      const token = authService.getToken();
      const allBatches = await this.getAllBatches();
      return allBatches.filter(batch => batch.productId === productId);
    } catch (error) {
      console.error(`Error fetching batches for product ${productId}:`, error);
      throw error;
    }
  },

  // Calcular el inventario actual por producto
  async calculateProductInventory(productId: string): Promise<ProductInventory | null> {
    try {
      const batches = await this.getBatchesByProduct(productId);
      if (batches.length === 0) return null;
      
      // Aquí necesitaríamos obtener la información del producto
      // Esto es un placeholder, deberías usar el productService para obtener el nombre y SKU reales
      return {
        productId,
        productName: "Producto", // Reemplazar con nombre real
        sku: "SKU", // Reemplazar con SKU real
        totalStock: batches.reduce((sum, batch) => sum + batch.availableQuantity, 0),
        batches
      };
    } catch (error) {
      console.error(`Error calculating inventory for product ${productId}:`, error);
      throw error;
    }
  }
};
