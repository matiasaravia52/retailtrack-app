'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input, { Select } from '@/components/Input';
import styles from './page.module.css';
import { createSale, getSales, cancelSale, Sale, SaleData, SaleItemData } from '@/services/saleService';
import { productService } from '@/services/productService';
import { formatDate } from '../../utils/dateUtils';

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
  // Estado para las ventas cargadas desde el backend
  const [sales, setSales] = useState<Sale[]>([]);
  // Estado para los productos cargados desde el backend
  const [products, setProducts] = useState<any[]>([]);
  // Estado para el filtro de fecha
  const [dateFilter, setDateFilter] = useState('');
  // Estado para indicar carga
  const [loading, setLoading] = useState(false);
  // Estado para manejar errores
  const [error, setError] = useState('');
  // Estado para manejar errores de stock insuficiente
  const [insufficientStock, setInsufficientStock] = useState<any[]>([]);
  // Estado para datos del cliente
  const [clientData, setClientData] = useState({
    clientName: 'Cliente General',
    clientDocument: '',
    clientPhone: '',
    clientEmail: ''
  });

  // Cargar ventas y productos al montar el componente
  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  // Función para cargar ventas desde el backend
  const loadSales = async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      const result = await getSales(filters);
      if (result.success && result.data) {
        setSales(result.data);
      } else {
        setError(result.error || 'Error al cargar las ventas');
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar productos desde el backend
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla de ventas
  const columns = [
    { 
      key: 'date', 
      header: 'Fecha',
      render: (value: unknown) => {
        if (typeof value === 'string') {
          return formatDate(value);
        }
        return String(value);
      }
    },
    { 
      key: 'clientName', 
      header: 'Cliente' 
    },
    { 
      key: 'totalAmount', 
      header: 'Total',
      render: (value: unknown) => {
        if (typeof value === 'number') {
          return `$${value.toFixed(2)}`;
        }
        return String(value);
      }
    },
    { 
      key: 'items', 
      header: 'Productos',
      render: (value: unknown, row: any) => {
        // Si tenemos los items cargados, mostramos la cantidad de items
        if (row.items && Array.isArray(row.items)) {
          return row.items.length;
        }
        // Si no, mostramos un valor por defecto
        return '---';
      }
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (value: unknown) => {
        if (typeof value === 'string') {
          switch (value) {
            case 'completed':
              return 'Completada';
            case 'pending':
              return 'Pendiente';
            case 'cancelled':
              return 'Cancelada';
            default:
              return String(value);
          }
        }
        return String(value);
      }
    },
  ];

  // Función para agregar un producto a la venta
  const addProductToSale = () => {
    if (!newItem.productId || !newItem.quantity || parseInt(newItem.quantity) <= 0) {
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    if (!product) return;

    const quantity = parseInt(newItem.quantity);
    // Usar el precio de retail del producto
    const price = product.retail_price || product.price || 0;
    const total = price * quantity;

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
          price: price,
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
    
    // Limpiar errores de stock insuficiente
    setInsufficientStock([]);
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
  const handleSaleSubmit = async () => {
    if (saleItems.length === 0) {
      alert('Debe agregar al menos un producto a la venta');
      return;
    }
    
    // Preparar los datos de la venta para enviar al backend
    const saleData: SaleData = {
      clientName: clientData.clientName,
      clientDocument: clientData.clientDocument || undefined,
      clientPhone: clientData.clientPhone || undefined,
      clientEmail: clientData.clientEmail || undefined,
      items: saleItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: 0 // Por defecto sin descuento
      })),
      taxAmount: 0, // Por defecto sin impuestos
      discountAmount: 0, // Por defecto sin descuento general
      paymentMethod: 'efectivo' // Por defecto efectivo
    };
    
    try {
      setLoading(true);
      setError('');
      setInsufficientStock([]);
      
      const result = await createSale(saleData);
      
      if (result.success && result.data) {
        // Venta registrada exitosamente
        setShowForm(false);
        setSaleItems([]);
        // Recargar la lista de ventas
        loadSales();
        // Resetear datos del cliente
        setClientData({
          clientName: 'Cliente General',
          clientDocument: '',
          clientPhone: '',
          clientEmail: ''
        });
        alert('Venta registrada exitosamente');
      } else {
        // Manejar errores
        if (result.insufficientStock && result.insufficientStock.length > 0) {
          setInsufficientStock(result.insufficientStock);
          alert('Stock insuficiente para algunos productos');
        } else {
          setError(result.error || 'Error al registrar la venta');
          alert(result.error || 'Error al registrar la venta');
        }
      }
    } catch (err) {
      console.error('Error al registrar venta:', err);
      setError('Error al conectar con el servidor');
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaleSubmit();
  };

  // Manejar cambio en el filtro de fecha
  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateFilter(value);
    
    // Aplicar filtros según la fecha seleccionada
    let filters: any = {};
    
    if (value === 'today') {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      filters = { startDate, endDate };
    } else if (value === 'week') {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const startDate = new Date(new Date().setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      filters = { startDate: startDate.toISOString() };
    } else if (value === 'month') {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      filters = { startDate: startDate.toISOString() };
    }
    
    // Si hay un término de búsqueda, añadirlo al filtro
    if (searchTerm) {
      filters.clientName = searchTerm;
    }
    
    // Cargar ventas con los filtros aplicados
    loadSales(filters);
  };
  
  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Si el usuario borra el término de búsqueda, recargar todas las ventas
    if (!value) {
      loadSales(dateFilter ? { dateFilter } : {});
    }
  };
  
  // Función para buscar ventas
  const searchSales = () => {
    const filters: any = {};
    
    if (searchTerm) {
      filters.clientName = searchTerm;
    }
    
    // Aplicar filtro de fecha si está seleccionado
    if (dateFilter === 'today') {
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      filters.startDate = startDate;
      filters.endDate = endDate;
    } else if (dateFilter === 'week') {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const startDate = new Date(new Date().setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      filters.startDate = startDate.toISOString();
    } else if (dateFilter === 'month') {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      filters.startDate = startDate.toISOString();
    }
    
    loadSales(filters);
  };

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
                      {product.name} - ${product.retail_price ? product.retail_price.toFixed(2) : '0.00'}
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
        <div className={styles.salesList}>
          <div className={styles.filters}>
            <Input 
              label="Buscar"
              type="text" 
              placeholder="Buscar ventas..." 
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
            >
              <option value="">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </Select>
            <Button onClick={searchSales}>Buscar</Button>
            <Button onClick={() => setShowForm(true)}>Nueva Venta</Button>
          </div>
          
          {loading ? (
            <div className={styles.loading}>Cargando ventas...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <Table 
              columns={columns} 
              data={sales} 
              actions={[
                { 
                  label: 'Ver', 
                  onClick: (item) => console.log('Ver venta:', item) 
                },
                { 
                  label: 'Cancelar', 
                  onClick: async (item) => {
                    if (window.confirm('¿Está seguro de cancelar esta venta?')) {
                      try {
                        setLoading(true);
                        const result = await cancelSale(item.id);
                        if (result.success) {
                          alert('Venta cancelada exitosamente');
                          loadSales();
                        } else {
                          alert(result.error || 'Error al cancelar la venta');
                        }
                      } catch (err) {
                        console.error('Error al cancelar venta:', err);
                        alert('Error al conectar con el servidor');
                      } finally {
                        setLoading(false);
                      }
                    }
                  },
                  variant: 'danger'
                }
              ]}
              keyExtractor={(item) => item.id} 
              onRowClick={(item) => console.log('Venta seleccionada:', item)}
              emptyMessage="No se encontraron ventas"
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
