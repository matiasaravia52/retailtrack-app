import { authService } from './authService';

// Interfaces para los datos de ventas
export interface SaleItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface SaleData {
  userId?: string;  // Añadido para identificar al usuario que realiza la venta
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
    const token = authService.getToken();
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
    const token = authService.getToken();
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
    const token = authService.getToken();
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
    const token = authService.getToken();
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
  } catch (err) {
    console.error('Error al cancelar venta:', err);
    return { success: false, error: 'Error de conexión' };
  }
};

// Exportar ventas a CSV
export const exportSalesToCSV = async (filters: SaleFilters = {}): Promise<void> => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No autorizado');
    }

    // Construir la URL con los parámetros de filtro
    let url = `${API_URL}/api/sales/export/csv`;
    const queryParams = [];
    
    if (filters.clientName) queryParams.push(`clientName=${encodeURIComponent(filters.clientName)}`);
    if (filters.status) queryParams.push(`status=${encodeURIComponent(filters.status)}`);
    if (filters.saleType) queryParams.push(`saleType=${encodeURIComponent(filters.saleType)}`);
    if (filters.startDate) queryParams.push(`startDate=${encodeURIComponent(filters.startDate)}`);
    if (filters.endDate) queryParams.push(`endDate=${encodeURIComponent(filters.endDate)}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    // Realizar la solicitud para descargar el CSV
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al exportar ventas');
    }

    // Obtener el contenido del CSV
    const csvContent = await response.text();
    
    // Crear un objeto Blob con el contenido CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Crear un enlace para descargar el archivo
    const url_download = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_download;
    link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Simular clic para iniciar la descarga
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_download);
  } catch (err) {
    console.error('Error al exportar ventas a CSV:', err);
    alert(`Error al exportar ventas: ${err instanceof Error ? err.message : 'Error desconocido'}`);
  }
};
