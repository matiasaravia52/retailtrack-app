'use client';

import React from 'react';
import DashboardLayout from '@/components/Layout';
import Card from '@/components/Card';
import Table from '@/components/Table';
import styles from './page.module.css';

export default function Dashboard() {
  // Datos de ejemplo para las tarjetas del dashboard
  const dashboardCards = [
    { id: 1, label: 'Productos', value: '120' },
    { id: 2, label: 'Ventas del día', value: '15' },
    { id: 3, label: 'Ingresos del día', value: '$2,500' },
    { id: 4, label: 'Productos con bajo stock', value: '8' },
  ];

  // Datos de ejemplo para la tabla de actividad reciente
  const recentActivity = [
    { id: '1', type: 'Venta', description: 'Venta #1234', amount: '$500', date: '15/04/2025 10:30' },
    { id: '2', type: 'Ingreso', description: 'Ingreso de productos', amount: '10 unidades', date: '15/04/2025 09:15' },
    { id: '3', type: 'Venta', description: 'Venta #1233', amount: '$750', date: '14/04/2025 16:45' },
    { id: '4', type: 'Ajuste', description: 'Ajuste de inventario', amount: '-2 unidades', date: '14/04/2025 14:20' },
    { id: '5', type: 'Venta', description: 'Venta #1232', amount: '$320', date: '14/04/2025 11:10' },
  ];

  // Columnas para la tabla de actividad reciente
  const columns = [
    { key: 'type', header: 'Tipo' },
    { key: 'description', header: 'Descripción' },
    { key: 'amount', header: 'Cantidad' },
    { key: 'date', header: 'Fecha y Hora' },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className={styles.dashboard}>
        {dashboardCards.map((card) => (
          <Card key={card.id} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.value}>{card.value}</div>
              <div className={styles.label}>{card.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.recentActivity}>
        <Card title="Actividad Reciente">
          <Table
            columns={columns}
            data={recentActivity}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => console.log('Clicked:', item)}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
