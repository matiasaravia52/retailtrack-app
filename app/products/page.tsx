'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import ImageUpload from '@/components/ImageUpload';
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
    category: '',
    image: null as string | null,
    imageFile: null as File | null
  });

  // Datos iniciales de ejemplo para los productos
  const initialProducts: Product[] = [
    { id: '1', name: 'Laptop HP 15"', sku: 'LP-001', category: 'Electrónicos', price: 799.99, stock: 15, image: 'https://placehold.co/300x200?text=Laptop' },
    { id: '2', name: 'Monitor Dell 24"', sku: 'MN-002', category: 'Electrónicos', price: 249.99, stock: 8, image: 'https://placehold.co/300x200?text=Monitor' },
    { id: '3', name: 'Teclado Mecánico', sku: 'KB-003', category: 'Accesorios', price: 89.99, stock: 20, image: 'https://placehold.co/300x200?text=Teclado' },
    { id: '4', name: 'Mouse Inalámbrico', sku: 'MS-004', category: 'Accesorios', price: 29.99, stock: 25, image: 'https://placehold.co/300x200?text=Mouse' },
    { id: '5', name: 'Auriculares Bluetooth', sku: 'AU-005', category: 'Audio', price: 59.99, stock: 12, image: 'https://placehold.co/300x200?text=Auriculares' },
  ];
  
  // Estado para almacenar la lista de productos
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Definir el tipo para nuestros productos
  type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    image: string | null;
  };

  // Columnas para la tabla de productos
  const columns = [
    { 
      key: 'image', 
      header: 'Imagen',
      render: (value: unknown, item: any) => {
        if (typeof value === 'string') {
          return (
            <div className={styles.productImage}>
              <img src={value} alt={item.name} />
            </div>
          );
        }
        return null;
      }
    },
    { key: 'name', header: 'Nombre' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Categoría' },
    { 
      key: 'price', 
      header: 'Precio',
      render: (value: unknown) => {
        if (typeof value === 'number') {
          return `$${value.toFixed(2)}`;
        }
        return String(value);
      }
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
  
  // Función para manejar la carga de imágenes
  const handleImageChange = (file: File | null, preview: string | null) => {
    setProductForm({
      ...productForm,
      imageFile: file,
      image: preview
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    // Validar campos obligatorios
    if (!productForm.name || !productForm.sku || !productForm.price || !productForm.stock) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    // Crear un nuevo producto con los datos del formulario
    const newProduct: Product = {
      id: Date.now().toString(), // Generar un ID único basado en la fecha
      name: productForm.name,
      sku: productForm.sku,
      category: productForm.category,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      image: productForm.image
    };
    
    // Agregar el nuevo producto a la lista
    setProducts([...products, newProduct]);
    
    console.log('Producto guardado:', newProduct);
    
    // Limpiar el formulario y ocultarlo
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      sku: '',
      category: '',
      image: null,
      imageFile: null
    });
    setShowForm(false);
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
            
            <ImageUpload
              label="Imagen del producto"
              value={productForm.image}
              onChange={handleImageChange}
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
