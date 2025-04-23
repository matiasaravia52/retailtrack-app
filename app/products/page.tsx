'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import ImageUpload from '@/components/ImageUpload';
import { productService, Product as ProductType } from '@/services/productService';
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
    image: null as string | null,
    imageFile: null as File | null
  });

  // Estado para almacenar la lista de productos
  const [products, setProducts] = useState<ProductType[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar productos. Inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Columnas para la tabla de productos
  const columns = [
    { 
      key: 'image', 
      header: 'Imagen',
      render: (value: unknown, item: ProductType) => {
        if (typeof value === 'string') {
          return (
            <div className={styles.productImage}>
              <Image 
                src={value} 
                alt={item.name} 
                width={60} 
                height={60} 
                style={{ objectFit: 'contain' }}
              />
            </div>
          );
        }
        return null;
      }
    },
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripción' },
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
  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (!productForm.name || !productForm.description ) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    // Crear un nuevo producto con los datos del formulario
    const newProduct: ProductType = {
      id: Date.now().toString(), // Generar un ID único basado en la fecha
      name: productForm.name,
      description: productForm.description,
      image: productForm.image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Llamar al servicio para crear el producto
    try {
      await productService.createProduct(newProduct);
      // Actualizar la lista de productos
      setProducts(prevProducts => [...prevProducts, newProduct]);
      console.log('Producto guardado:', newProduct);
      setShowForm(false);
      setProductForm({
        name: '',
        description: '',
        image: null,
        imageFile: null
      });
    } catch (err) {
      console.error('Error creating product:', err);
      alert('Error al crear el producto. Inténtelo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Filtrar productos según el término de búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
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


          {loading ? (
            <div className={styles.loading}>Cargando usuarios...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>No se encontraron productos</div>
          ) : (
            <Card>
              <Table 
                columns={columns} 
                data={filteredProducts} 
                keyExtractor={(item) => item.id} 
              onRowClick={(item) => console.log('Producto seleccionado:', item)}
              emptyMessage="No se encontraron productos"
            />
          </Card>
        )}
      </>
    )}
    </DashboardLayout>
  );
}
