'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from './page.module.css';

export default function Products() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de producto
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category: ''
  });

  // Datos de ejemplo para los productos
  const products = [
    { id: '1', name: 'Laptop HP 15"', sku: 'LP-001', category: 'Electrónicos', price: 799.99, stock: 15 },
    { id: '2', name: 'Monitor Dell 24"', sku: 'MN-002', category: 'Electrónicos', price: 249.99, stock: 8 },
    { id: '3', name: 'Teclado Mecánico', sku: 'KB-003', category: 'Accesorios', price: 89.99, stock: 20 },
    { id: '4', name: 'Mouse Inalámbrico', sku: 'MS-004', category: 'Accesorios', price: 29.99, stock: 25 },
    { id: '5', name: 'Auriculares Bluetooth', sku: 'AU-005', category: 'Audio', price: 59.99, stock: 12 },
  ];

  // Columnas para la tabla de productos
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Categoría' },
    { 
      key: 'price', 
      header: 'Precio',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { key: 'stock', header: 'Stock' },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductForm({
      ...productForm,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    console.log('Producto a guardar:', productForm);
    // Aquí iría la lógica para guardar el producto
    setShowForm(false);
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      sku: '',
      category: ''
    });
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Filtrar productos según el término de búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Productos" 
      actions={
        <Button onClick={() => setShowForm(true)}>Nuevo Producto</Button>
      }
    >
      {showForm ? (
        <Card title="Nuevo Producto" footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }>
          <form className={styles.productForm} onSubmit={handleFormSubmit}>
            <Input 
              label="Nombre" 
              id="name" 
              name="name" 
              value={productForm.name} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="SKU" 
              id="sku" 
              name="sku" 
              value={productForm.sku} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Precio" 
              id="price" 
              name="price" 
              type="number" 
              step="0.01" 
              value={productForm.price} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Stock" 
              id="stock" 
              name="stock" 
              type="number" 
              value={productForm.stock} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Categoría" 
              id="category" 
              name="category" 
              value={productForm.category} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Descripción" 
              id="description" 
              name="description" 
              value={productForm.description} 
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

          <Card>
            <Table 
              columns={columns} 
              data={filteredProducts} 
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
