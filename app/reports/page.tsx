'use client';

import { useState, useEffect } from 'react';
import { reportService, NetProfitReportData } from '@/services/reportService';
import styles from './page.module.css';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Spinner from '@/components/Spinner/Spinner';
import DashboardLayout from '@/components/Layout';
import Card from '@/components/Card';
// Función para formatear moneda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value);
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<NetProfitReportData | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('custom');
  
  // Obtener la fecha actual
  const today = new Date();
  const currentDate = today.toISOString().split('T')[0];
  
  // Calcular fechas predefinidas
  const getLastMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };
  
  const getLast3MonthsDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split('T')[0];
  };
  
  const getLastYearDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  };
  
  const [filters, setFilters] = useState({
    startDate: getLastMonthDate(),
    endDate: currentDate
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setActiveFilter('custom');
  };
  
  const applyPredefinedFilter = (filterType: string) => {
    setActiveFilter(filterType);
    let newFilters = { startDate: '', endDate: '' };
    
    switch (filterType) {
      case 'lastMonth':
        newFilters = {
          startDate: getLastMonthDate(),
          endDate: currentDate
        };
        break;
      case 'last3Months':
        newFilters = {
          startDate: getLast3MonthsDate(),
          endDate: currentDate
        };
        break;
      case 'lastYear':
        newFilters = {
          startDate: getLastYearDate(),
          endDate: currentDate
        };
        break;
      default:
        return;
    }
    
    setFilters(newFilters);
    
    // Generar el reporte automáticamente al seleccionar un filtro predefinido
    setTimeout(() => {
      generateReportWithFilters(newFilters);
    }, 100);
  };
  
  const generateReportWithFilters = async (reportFilters: { startDate: string, endDate: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getNetProfitReport(reportFilters);
      
      if (result.success && result.data) {
        setReportData(result.data);
      } else {
        setError(result.error || 'Error al generar el reporte');
        setReportData(null);
      }
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setError('Error al generar el reporte');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    generateReportWithFilters(filters);
  };

  useEffect(() => {
    // Cargar datos iniciales al montar el componente
    // Iniciar con el filtro de último mes
    applyPredefinedFilter('lastMonth');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout title="Reportes">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Reportes de Ganancias</h1>
        </div>
      
      <Card className={styles.filtersCard}>
        <div className={styles.predefinedFilters}>
          <Button 
            type="button" 
            onClick={() => applyPredefinedFilter('lastMonth')} 
            variant={activeFilter === 'lastMonth' ? 'primary' : 'secondary'}
            className={styles.filterButton}
          >
            Último Mes
          </Button>
          <Button 
            type="button" 
            onClick={() => applyPredefinedFilter('last3Months')} 
            variant={activeFilter === 'last3Months' ? 'primary' : 'secondary'}
            className={styles.filterButton}
          >
            Últimos 3 Meses
          </Button>
          <Button 
            type="button" 
            onClick={() => applyPredefinedFilter('lastYear')} 
            variant={activeFilter === 'lastYear' ? 'primary' : 'secondary'}
            className={styles.filterButton}
          >
            Último Año
          </Button>
        </div>
        
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Input
              label="Fecha Inicio"
              type="date"
              name="startDate"
              id="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <Input
              label="Fecha Fin"
              type="date"
              name="endDate"
              id="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className={styles.filterActions}>
            <Button type="button" onClick={generateReport} disabled={loading} variant="primary">
              {loading ? <Spinner size="sm" /> : 'Generar Reporte'}
            </Button>
          </div>
        </div>
      </Card>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      {reportData && (
        <Card className={styles.reportContainer}>
          <h2>Reporte de Ganancias Netas</h2>
          
          <div className={styles.reportGrid}>
            <div className={styles.reportCard}>
              <h3>Ventas Totales</h3>
              <p className={styles.reportValue}>{reportData.totalSales}</p>
            </div>
            
            <div className={styles.reportCard}>
              <h3>Ingresos Totales</h3>
              <p className={styles.reportValue}>{formatCurrency(reportData.totalRevenue)}</p>
            </div>
            
            <div className={styles.reportCard}>
              <h3>Costo Total</h3>
              <p className={styles.reportValue}>{formatCurrency(reportData.totalCost)}</p>
            </div>
            
            <div className={styles.reportCard}>
              <h3>Descuentos</h3>
              <p className={styles.reportValue}>{formatCurrency(reportData.totalDiscount)}</p>
            </div>
            
            <div className={styles.reportCard}>
              <h3>Impuestos</h3>
              <p className={styles.reportValue}>{formatCurrency(reportData.totalTax)}</p>
            </div>
            
            <div className={styles.reportCard}>
              <h3>Ganancia Bruta</h3>
              <p className={styles.reportValue}>{formatCurrency(reportData.grossProfit)}</p>
            </div>
            
            <div className={`${styles.reportCard} ${styles.highlightCard}`}>
              <h3>Ganancia Neta</h3>
              <p className={styles.reportValue}>{formatCurrency(reportData.netProfit)}</p>
            </div>
            
            <div className={styles.reportCard}>
              <h3>Ganancia Neta (con impuestos)</h3>
              <p className={styles.reportValue}>{formatCurrency(reportData.netProfitWithTax)}</p>
            </div>
            
            <div className={styles.reportCard}>
              <h3>Margen de Ganancia</h3>
              <p className={styles.reportValue}>{reportData.profitMargin.toFixed(2)}%</p>
            </div>
          </div>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}
