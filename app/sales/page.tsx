'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from './page.module.css';

export default function Sales() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para los productos en la venta actual
  const [saleItems, setSaleItems] = useState<Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }>>([]);
  // Estado para el nuevo producto a agregar
  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: '1'
  });

  // Datos de ejemplo para las ventas
  const sales = [
    { id: '1', date: '15/04/2025 10:30', customer: 'Cliente General', total: 500, items: 3, status: 'Completada' },
    { id: '2', date: '14/04/2025 16:45', customer: 'Cliente General', total: 750, items: 2, status: 'Completada' },
    { id: '3', date: '14/04/2025 11:10', customer: 'Cliente General', total: 320, items: 1, status: 'Completada' },
    { id: '4', date: '13/04/2025 15:20', customer: 'Cliente General', total: 1200, items: 4, status: 'Completada' },
    { id: '5', date: '12/04/2025 09:45', customer: 'Cliente General', total: 180, items: 2, status: 'Completada' },
  ];

  // Datos de ejemplo para los productos
  const products = [
    { id: '1', name: 'Laptop HP 15"', price: 799.99, stock: 15 },
    { id: '2', name: 'Monitor Dell 24"', price: 249.99, stock: 8 },
    { id: '3', name: 'Teclado Mecánico', price: 89.99, stock: 20 },
    { id: '4', name: 'Mouse Inalámbrico', price: 29.99, stock: 25 },
    { id: '5', name: 'Auriculares Bluetooth', price: 59.99, stock: 12 },
  ];

  // Columnas para la tabla de ventas
  const columns = [
    { key: 'date', header: 'Fecha' },
    { key: 'customer', header: 'Cliente' },
    { 
      key: 'total', 
      header: 'Total',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { key: 'items', header: 'Productos' },
    { key: 'status', header: 'Estado' },
  ];

  // Función para agregar un producto a la venta
  const addProductToSale = () => {
    if (!newItem.productId || !newItem.quantity || parseInt(newItem.quantity) <= 0) {
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    if (!product) return;

    const quantity = parseInt(newItem.quantity);
    const total = product.price * quantity;

    // Verificar si el producto ya está en la lista
    const existingItemIndex = saleItems.findIndex(item => item.productId === newItem.productId);
    
    if (existingItemIndex >= 0) {
      // Actualizar la cantidad y total del producto existente
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
      setSaleItems(updatedItems);
    } else {
      // Agregar nuevo producto
      setSaleItems([
        ...saleItems,
        {
          id: Date.now().toString(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          total
        }
      ]);
    }

    // Limpiar el formulario
    setNewItem({
      productId: '',
      quantity: '1'
    });
  };

  // Función para eliminar un producto de la venta
  const removeProductFromSale = (id: string) => {
    setSaleItems(saleItems.filter(item => item.id !== id));
  };

  // Calcular el total de la venta
  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  // Función para manejar cambios en el formulario de nuevo producto
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario de venta
  const handleSaleSubmit = () => {
    if (saleItems.length === 0) {
      alert('Debe agregar al menos un producto a la venta');
      return;
    }
    
    console.log('Venta a registrar:', {
      items: saleItems,
      total: calculateTotal(),
      date: new Date().toISOString()
    });
    
    // Aquí iría la lógica para registrar la venta
    setShowForm(false);
    setSaleItems([]);
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaleSubmit();
  };

  // Filtrar ventas según el término de búsqueda
  const filteredSales = sales.filter(sale => 
    sale.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Ventas" 
      actions={
        <Button onClick={() => setShowForm(true)}>Nueva Venta</Button>
      }
    >
      {showForm ? (
        <Card title="Nueva Venta" footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSaleSubmit}>Registrar Venta</Button>
          </>
        }>
          <form className={styles.saleForm} onSubmit={handleFormSubmit}>
            <div>
              <h3>Productos</h3>
              
              {saleItems.length > 0 && (
                <div className={styles.productList}>
                  <div className={`${styles.productItem} ${styles.productHeader}`}>
                    <div>Producto</div>
                    <div>Precio</div>
                    <div>Cantidad</div>
                    <div>Total</div>
                    <div></div>
                  </div>
                  
                  {saleItems.map(item => (
                    <div key={item.id} className={styles.productItem}>
                      <div>{item.name}</div>
                      <div>${item.price.toFixed(2)}</div>
                      <div>{item.quantity}</div>
                      <div>${item.total.toFixed(2)}</div>
                      <button 
                        type="button" 
                        className={styles.removeButton}
                        onClick={() => removeProductFromSale(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={styles.addProductSection}>
                <select 
                  name="productId" 
                  value={newItem.productId} 
                  onChange={handleNewItemChange}
                  className={styles.filter}
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price.toFixed(2)}
                    </option>
                  ))}
                </select>
                
                <input 
                  type="number" 
                  name="quantity" 
                  value={newItem.quantity} 
                  onChange={handleNewItemChange}
                  min="1"
                  className={styles.searchInput}
                  placeholder="Cantidad"
                />
                
                <Button type="button" onClick={addProductToSale}>
                  Agregar
                </Button>
              </div>
              
              <div className={styles.totalSection}>
                <div className={styles.totalLabel}>Total:</div>
                <div className={styles.totalAmount}>${calculateTotal().toFixed(2)}</div>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Buscar ventas..." 
                className={styles.searchInput} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filters}>
            <select className={styles.filter} defaultValue="">
              <option value="">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>

          <Card>
            <Table 
              columns={columns} 
              data={filteredSales} 
              keyExtractor={(item) => item.id} 
              onRowClick={(item) => console.log('Venta seleccionada:', item)}
              emptyMessage="No se encontraron ventas"
            />
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
