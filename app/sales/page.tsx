'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input, { Select } from '@/components/Input';
import styles from './page.module.css';
import { createSale, getSales, cancelSale, Sale, SaleData, SaleItemData } from '@/services/saleService';
import { authService } from '@/services/authService';
import { productService } from '@/services/productService';
import { customerService, Customer } from '@/services/customerService';
import { formatDate } from '../../utils/dateUtils';

export default function Sales() {
  const router = useRouter();
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
  
  // Estado para la búsqueda de productos
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  // Estado para las ventas cargadas desde el backend
  const [sales, setSales] = useState<Sale[]>([]);
  // Estado para los productos cargados desde el backend
  const [products, setProducts] = useState<any[]>([]);
  // Estados para filtros
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
  
  // Estado para el cliente seleccionado
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Estado para la búsqueda de clientes
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Cargar ventas y productos al montar el componente
  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);
  
  // Cargar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (customerSearchTerm.length >= 2) {
      searchCustomers(customerSearchTerm);
    } else if (customerSearchTerm === '') {
      setCustomers([]);
    }
  }, [customerSearchTerm]);
  
  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (productSearchTerm.length >= 2) {
      searchProductsByName(productSearchTerm);
    } else if (productSearchTerm === '') {
      setFilteredProducts([]);
      setShowProductDropdown(false);
    }
  }, [productSearchTerm]);

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
      if (productsData && Array.isArray(productsData.items)) {
        setProducts(productsData.items);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para buscar clientes
  const searchCustomers = async (query: string) => {
    try {
      const result = await customerService.searchCustomers(query);
      if (result && Array.isArray(result)) {
        // Filtrar solo clientes activos
        const activeCustomers = result.filter((customer: Customer) => customer.status === 'active');
        setCustomers(activeCustomers);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Error al buscar clientes:', err);
      setCustomers([]);
    }
  };
  
  // Función para seleccionar un cliente
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setClientData({
      clientName: customer.name,
      clientDocument: customer.type || '',
      clientPhone: customer.phone || '',
      clientEmail: customer.email || ''
    });
    setShowCustomerDropdown(false);
    setCustomerSearchTerm(customer.name);
  };
  
  // Función para manejar cambios en la búsqueda de clientes
  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerSearchTerm(value);
    setShowCustomerDropdown(true);
    
    // Si el campo está vacío, resetear los datos del cliente
    if (!value) {
      setSelectedCustomer(null);
      setClientData({
        clientName: 'Cliente General',
        clientDocument: '',
        clientPhone: '',
        clientEmail: ''
      });
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

    // Buscar el producto en los productos filtrados primero, luego en todos los productos
    const product = filteredProducts.find(p => p.id === newItem.productId) || 
                   products.find(p => p.id === newItem.productId);
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
  
  // Función para buscar productos por nombre
  const searchProductsByName = async (query: string) => {
    try {
      if (query.length >= 2) {
        const result = await productService.searchProducts(query);
        if (result && result.items && Array.isArray(result.items)) {
          // Filtrar solo productos activos con stock disponible
          const activeProducts = result.items.filter(product => 
            product.status === 'active' && product.stock > 0
          );
          setFilteredProducts(activeProducts);
          setShowProductDropdown(true);
        } else {
          setFilteredProducts([]);
        }
      } else {
        setFilteredProducts([]);
        setShowProductDropdown(false);
      }
    } catch (err) {
      console.error('Error al buscar productos:', err);
      setFilteredProducts([]);
    }
  };
  
  // Función para seleccionar un producto
  const handleSelectProduct = (product: any) => {
    setNewItem({
      ...newItem,
      productId: product.id
    });
    setProductSearchTerm(product.name);
    setShowProductDropdown(false);
  };
  
  // Función para manejar cambios en la búsqueda de productos
  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearchTerm(value);
    if (value.length >= 2) {
      setShowProductDropdown(true);
    } else {
      setShowProductDropdown(false);
    }
  };

  // Función para manejar el envío del formulario de venta
  const handleSaleSubmit = async () => {
    if (saleItems.length === 0) {
      alert('Debe agregar al menos un producto a la venta');
      return;
    }
    
    // Preparar los datos de la venta para enviar al backend
    const currentUser = authService.getCurrentUser();
    const saleData: SaleData = {
      userId: currentUser?.id, // Añadir el ID del usuario actual
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
        setSelectedCustomer(null);
        setCustomerSearchTerm('');
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

  // Manejar cambio en el filtro de fecha predefinido
  const handleDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateFilter(value);
    
    // Limpiar fechas personalizadas si se selecciona un filtro predefinido
    if (value) {
      setStartDate('');
      setEndDate('');
    }
    
    // Aplicar filtros según la fecha seleccionada
    let filters: any = {};
    
    if (value === 'today') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      filters = { startDate: todayStart.toISOString(), endDate: todayEnd.toISOString() };
    } else if (value === 'week') {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0);
      filters = { startDate: weekStart.toISOString() };
    } else if (value === 'month') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
      filters = { startDate: monthStart.toISOString() };
    }
    
    // Aplicar otros filtros si existen
    if (searchTerm) filters.clientName = searchTerm;
    if (statusFilter) filters.status = statusFilter;
    if (clientFilter) filters.clientName = clientFilter;
    
    // Cargar ventas con los filtros aplicados
    loadSales(filters);
  };
  
  // Manejar cambio en el filtro de estado
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setStatusFilter(value);
  };
  
  // Manejar cambio en el filtro de cliente
  const handleClientFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientFilter(value);
  };
  
  // Manejar cambio en la fecha de inicio
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    // Limpiar filtro predefinido si se selecciona una fecha personalizada
    if (value) setDateFilter('');
  };
  
  // Manejar cambio en la fecha de fin
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    // Limpiar filtro predefinido si se selecciona una fecha personalizada
    if (value) setDateFilter('');
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
  
  // Función para buscar ventas con todos los filtros aplicados
  const searchSales = () => {
    const filters: any = {};
    
    // Aplicar filtro de cliente por término de búsqueda o filtro específico
    if (clientFilter) {
      filters.clientName = clientFilter;
    } else if (searchTerm) {
      filters.clientName = searchTerm;
    }
    
    // Aplicar filtro de estado
    if (statusFilter) {
      filters.status = statusFilter;
    }
    
    // Aplicar filtros de fecha
    if (dateFilter === 'today') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      filters.startDate = todayStart.toISOString();
      filters.endDate = todayEnd.toISOString();
    } else if (dateFilter === 'week') {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0);
      filters.startDate = weekStart.toISOString();
    } else if (dateFilter === 'month') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
      filters.startDate = monthStart.toISOString();
    } else if (startDate || endDate) {
      // Usar fechas personalizadas si están definidas
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filters.startDate = start.toISOString();
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filters.endDate = end.toISOString();
      }
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
              <h3>Datos del Cliente</h3>
              <div className={styles.customerSection}>
                <div className={styles.customerSearch}>
                  <Input
                    label="Buscar Cliente"
                    type="text"
                    value={customerSearchTerm}
                    onChange={handleCustomerSearchChange}
                    placeholder="Nombre del cliente..."
                  />
                  {showCustomerDropdown && customers.length > 0 && (
                    <div className={styles.customerDropdown}>
                      {customers.map(customer => (
                        <div 
                          key={customer.id} 
                          className={styles.customerOption}
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div className={styles.customerName}>{customer.name}</div>
                          <div className={styles.customerDetails}>
                            {customer.email && <span>{customer.email}</span>}
                            {customer.phone && <span> • {customer.phone}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedCustomer && (
                  <div className={styles.selectedCustomer}>
                    <div className={styles.customerInfo}>
                      <strong>{selectedCustomer.name}</strong>
                      <div>
                        {selectedCustomer.type && <span>Tipo: {selectedCustomer.type}</span>}
                        {selectedCustomer.email && <span> • Email: {selectedCustomer.email}</span>}
                        {selectedCustomer.phone && <span> • Tel: {selectedCustomer.phone}</span>}
                        {selectedCustomer.address && <span> • Dir: {selectedCustomer.address}</span>}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className={styles.removeButton}
                      onClick={() => {
                        setSelectedCustomer(null);
                        setClientData({
                          clientName: 'Cliente General',
                          clientDocument: '',
                          clientPhone: '',
                          clientEmail: ''
                        });
                        setCustomerSearchTerm('');
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              <h3>Productos</h3>
              
              <div className={styles.addProductSection}>
                <div className={styles.productSearch}>
                  <Input
                    label="Buscar Producto"
                    type="text"
                    value={productSearchTerm}
                    onChange={handleProductSearchChange}
                    placeholder="Nombre del producto..."
                  />
                  {showProductDropdown && filteredProducts.length > 0 && (
                    <div className={styles.productDropdown}>
                      {filteredProducts.map(product => (
                        <div 
                          key={product.id} 
                          className={styles.productOption}
                          onClick={() => handleSelectProduct(product)}
                        >
                          <div className={styles.productOptionName}>{product.name}</div>
                          <div className={styles.productOptionDetails}>
                            <span>${product.retail_price ? (typeof product.retail_price === 'string' ? parseFloat(product.retail_price).toFixed(2) : product.retail_price.toFixed(2)) : '0.00'}</span>
                            <span> • Stock: {product.stock}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={styles.quantityField}>
                  <Input
                    label="Cantidad"
                    type="number" 
                    name="quantity" 
                    value={newItem.quantity} 
                    onChange={handleNewItemChange}
                    min="1"
                    placeholder="Cantidad"
                  />
                </div>
                
                <div className={styles.addButtonContainer}>
                  <Button 
                    type="button" 
                    onClick={addProductToSale}
                    disabled={!newItem.productId || !newItem.quantity || parseInt(newItem.quantity) <= 0}
                    className={styles.addButton}
                  >
                    Agregar
                  </Button>
                </div>
              </div>
              
              <h4 className={styles.productsListTitle}>Productos agregados</h4>
              
              {saleItems.length > 0 ? (
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
                      <div>${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}</div>
                      <div>{item.quantity}</div>
                      <div>${typeof item.total === 'string' ? parseFloat(item.total).toFixed(2) : item.total.toFixed(2)}</div>
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
              ) : (
                <div className={styles.emptyProductList}>No hay productos agregados</div>
              )}
              
              <div className={styles.totalSection}>
                <div className={styles.totalLabel}>Total:</div>
                <div className={styles.totalAmount}>${calculateTotal().toFixed(2)}</div>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        <div className={styles.salesList}>
          <Card>
            <h3 className={styles.filterTitle}>Filtros de Ventas</h3>
            <div className={styles.filtersContainer}>
              <div className={styles.filterGroup}>
                <Input 
                  label="Cliente"
                  type="text" 
                  placeholder="Nombre del cliente..." 
                  value={clientFilter}
                  onChange={handleClientFilterChange}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <Select
                  label="Estado"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="pending">Pendiente</option>
                </Select>
              </div>
              
              <div className={styles.filterGroup}>
                <Select
                  label="Período"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                >
                  <option value="">Seleccionar período</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </Select>
              </div>
              
              <div className={styles.filterGroup}>
                <Input 
                  label="Desde"
                  type="date" 
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <Input 
                  label="Hasta"
                  type="date" 
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
              
              <div className={styles.filterActions}>
                <Button onClick={searchSales}>Aplicar Filtros</Button>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('');
                    setStatusFilter('');
                    setClientFilter('');
                    setStartDate('');
                    setEndDate('');
                    loadSales({});
                  }}
                  variant="secondary"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </Card>
          
          <div className={styles.salesListHeader}>
            <h2>Lista de Ventas</h2>
            <div className={styles.searchContainer}>
              <Input 
                label=""
                type="text" 
                placeholder="Búsqueda rápida..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <Button onClick={() => setShowForm(true)}>Nueva Venta</Button>
            </div>
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
                  onClick: (item) => router.push(`/sales/${item.id}`) 
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
