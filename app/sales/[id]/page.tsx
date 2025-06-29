'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { getSaleById, Sale } from '@/services/saleService';
import { formatDate } from '@/utils/dateUtils';
import styles from './page.module.css';

export default function SaleDetail() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSaleDetail = async () => {
      if (!params || !params.id) {
        setError('ID de venta no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getSaleById(params.id as string);
        if (result.success && result.data) {
          setSale(result.data);
        } else {
          setError(result.error || 'Error al cargar los detalles de la venta');
        }
      } catch (err) {
        console.error('Error al cargar detalles de venta:', err);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetail();
  }, [params?.id]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout
      title="Detalle de Venta"
      actions={
        <Button onClick={() => router.back()}>Volver</Button>
      }
    >
      {loading ? (
        <div className={styles.loading}>Cargando detalles de la venta...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : sale ? (
        <div className={styles.saleDetail}>
          <Card title="Información de la Venta">
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Fecha:</span>
                <span className={styles.infoValue}>{formatDate(sale.date)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cliente:</span>
                <span className={styles.infoValue}>{sale.clientName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Documento:</span>
                <span className={styles.infoValue}>{sale.clientDocument || 'No especificado'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Teléfono:</span>
                <span className={styles.infoValue}>{sale.clientPhone || 'No especificado'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{sale.clientEmail || 'No especificado'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Estado:</span>
                <span className={styles.infoValue}>{getStatusText(sale.status)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tipo de venta:</span>
                <span className={styles.infoValue}>{sale.saleType || 'Estándar'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Método de pago:</span>
                <span className={styles.infoValue}>{sale.paymentMethod || 'No especificado'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Número de documento:</span>
                <span className={styles.infoValue}>{sale.documentNumber || 'No especificado'}</span>
              </div>
            </div>
          </Card>

          <Card title="Productos">
            {sale.items && sale.items.length > 0 ? (
              <div className={styles.productList}>
                <div className={`${styles.productItem} ${styles.productHeader}`}>
                  <div>Producto</div>
                  <div>Precio Unitario</div>
                  <div>Cantidad</div>
                  <div>Descuento</div>
                  <div>Total</div>
                </div>
                
                {sale.items.map(item => (
                  <div key={item.id} className={styles.productItem}>
                    <div>{item.product ? item.product.name : `Producto ID: ${item.productId}`}</div>
                    <div>${item.unitPrice.toFixed(2)}</div>
                    <div>{item.quantity}</div>
                    <div>${item.discount.toFixed(2)}</div>
                    <div>${item.totalPrice.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyMessage}>No hay productos en esta venta</div>
            )}
          </Card>

          <Card title="Resumen">
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Subtotal:</span>
                <span className={styles.summaryValue}>${sale.subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Impuestos:</span>
                <span className={styles.summaryValue}>${sale.taxAmount.toFixed(2)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Descuento:</span>
                <span className={styles.summaryValue}>${sale.discountAmount.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryItem} ${styles.total}`}>
                <span className={styles.summaryLabel}>Total:</span>
                <span className={styles.summaryValue}>${sale.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            {sale.notes && (
              <div className={styles.notes}>
                <h4>Notas:</h4>
                <p>{sale.notes}</p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className={styles.error}>No se encontró la venta</div>
      )}
    </DashboardLayout>
  );
}
