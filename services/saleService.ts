import { getAuthToken } from '@/utils/auth';

// Interfaces para los datos de ventas
export interface SaleItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface SaleData {
  clientName: string;
  clientDocument?: string;
  clientPhone?: string;
  clientEmail?: string;
  items: SaleItemData[];
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  saleType?: string;
  documentNumber?: string;
  paymentMethod?: string;
}

export interface SaleFilters {
  clientName?: string;
  status?: string;
  saleType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discount: number;
  totalPrice: number;
  product?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id: string;
  date: string;
  userId: string;
  clientName: string;
  clientDocument: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes: string | null;
  status: string;
  saleType: string;
  documentNumber: string | null;
  paymentMethod: string;
  items?: SaleItem[];
  user?: any;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Crear una nueva venta
export const createSale = async (saleData: SaleData): Promise<{ success: boolean; data?: Sale; error?: string; insufficientStock?: any[] }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(saleData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'Error al crear la venta',
        insufficientStock: result.insufficientStock
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error en el servicio de creación de venta:', error);
    return { success: false, error: 'Error al conectar con el servidor' };
  }
};

// Obtener una venta por ID
export const getSaleById = async (id: string): Promise<{ success: boolean; data?: Sale; error?: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${API_URL}/api/sales/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Error al obtener la venta' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error en el servicio de obtención de venta:', error);
    return { success: false, error: 'Error al conectar con el servidor' };
  }
};

// Obtener todas las ventas con filtros
export const getSales = async (filters: SaleFilters = {}): Promise<{ success: boolean; data?: Sale[]; total?: number; error?: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'No autorizado' };
    }

    // Construir la URL con los filtros
    const queryParams = new URLSearchParams();
    
    if (filters.clientName) queryParams.append('clientName', filters.clientName);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.saleType) queryParams.append('saleType', filters.saleType);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());
    
    const url = `${API_URL}/api/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Error al obtener las ventas' };
    }

    return { 
      success: true, 
      data: result.data, 
      total: result.total 
    };
  } catch (error) {
    console.error('Error en el servicio de obtención de ventas:', error);
    return { success: false, error: 'Error al conectar con el servidor' };
  }
};

// Cancelar una venta
export const cancelSale = async (id: string): Promise<{ success: boolean; data?: Sale; error?: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${API_URL}/api/sales/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Error al cancelar la venta' };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error en el servicio de cancelación de venta:', error);
    return { success: false, error: 'Error al conectar con el servidor' };
  }
};
