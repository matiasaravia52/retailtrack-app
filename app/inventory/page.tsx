'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input, { Select } from '@/components/Input';
import styles from './page.module.css';

export default function Inventory() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de movimiento de inventario
  const [movementForm, setMovementForm] = useState({
    productId: '',
    type: 'entrada',
    quantity: '',
    notes: ''
  });

  // Datos de ejemplo para el inventario
  const inventory = [
    { id: '1', name: 'Laptop HP 15"', sku: 'LP-001', stock: 15, minStock: 5, lastMovement: '15/04/2025' },
    { id: '2', name: 'Monitor Dell 24"', sku: 'MN-002', stock: 3, minStock: 5, lastMovement: '14/04/2025' },
    { id: '3', name: 'Teclado Mecánico', sku: 'KB-003', stock: 20, minStock: 10, lastMovement: '13/04/2025' },
    { id: '4', name: 'Mouse Inalámbrico', sku: 'MS-004', stock: 25, minStock: 10, lastMovement: '12/04/2025' },
    { id: '5', name: 'Auriculares Bluetooth', sku: 'AU-005', stock: 2, minStock: 5, lastMovement: '11/04/2025' },
  ];

  // Columnas para la tabla de inventario
  const columns = [
    { key: 'name', header: 'Producto' },
    { key: 'sku', header: 'SKU' },
    { 
      key: 'stock', 
      header: 'Stock Actual',
      render: (value: number, item: any) => (
        <span className={value < item.minStock ? styles.lowStock : styles.goodStock}>
          {value}
        </span>
      )
    },
    { key: 'minStock', header: 'Stock Mínimo' },
    { key: 'lastMovement', header: 'Último Movimiento' },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMovementForm({
      ...movementForm,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    console.log('Movimiento a registrar:', movementForm);
    // Aquí iría la lógica para registrar el movimiento
    setShowForm(false);
    setMovementForm({
      productId: '',
      type: 'entrada',
      quantity: '',
      notes: ''
    });
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Filtrar inventario según el término de búsqueda
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Inventario" 
      actions={
        <Button onClick={() => setShowForm(true)}>Registrar Movimiento</Button>
      }
    >
      {showForm ? (
        <Card title="Registrar Movimiento de Inventario" footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }>
          <form className={styles.movementForm} onSubmit={handleFormSubmit}>
            <Select
              label="Producto"
              id="productId"
              name="productId"
              value={movementForm.productId}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un producto</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku})
                </option>
              ))}
            </Select>
            
            <Select
              label="Tipo de Movimiento"
              id="type"
              name="type"
              value={movementForm.type}
              onChange={handleInputChange}
              required
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </Select>
            
            <Input 
              label="Cantidad" 
              id="quantity" 
              name="quantity" 
              type="number" 
              value={movementForm.quantity} 
              onChange={handleInputChange} 
              required 
            />
            
            <Input 
              label="Notas" 
              id="notes" 
              name="notes" 
              value={movementForm.notes} 
              onChange={handleInputChange} 
            />
          </form>
        </Card>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Buscar productos..." 
                className={styles.searchInput} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filters}>
            <select className={styles.filter} defaultValue="">
              <option value="">Todos los productos</option>
              <option value="low">Stock bajo</option>
              <option value="good">Stock normal</option>
            </select>
          </div>

          <Card>
            <Table 
              columns={columns} 
              data={filteredInventory} 
              keyExtractor={(item) => item.id} 
              onRowClick={(item) => console.log('Producto seleccionado:', item)}
              emptyMessage="No se encontraron productos"
            />
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
