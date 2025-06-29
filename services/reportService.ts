import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface NetProfitReportData {
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  totalDiscount: number;
  totalTax: number;
  grossProfit: number;
  netProfit: number;
  netProfitWithTax: number;
  profitMargin: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
}

export const reportService = {
  /**
   * Obtiene el reporte de ganancias netas en un rango de fechas
   */
  async getNetProfitReport(filters: ReportFilters): Promise<{ success: boolean; data?: NetProfitReportData; error?: string }> {
    try {
      const token = authService.getToken();
      if (!token) {
        return { success: false, error: 'No autorizado' };
      }

      // Construir los parámetros de consulta
      const params = new URLSearchParams();
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await axios.get(`${API_URL}/api/reports/net-profit?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener reporte de ganancias:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener reporte de ganancias' 
      };
    }
  }
};
