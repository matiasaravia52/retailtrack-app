'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import ImageUpload from '@/components/ImageUpload';
import { productService, Product as ProductType, ProductStatus } from '@/services/productService';
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
    categoryId: null as string | null,
    status: ProductStatus.ACTIVE,
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
    { 
      key: 'status', 
      header: 'Estado',
      render: (value: unknown) => {
        const status = value as ProductStatus;
        return (
          <span className={status === ProductStatus.ACTIVE ? styles.statusActive : styles.statusInactive}>
            {status === ProductStatus.ACTIVE ? 'Activo' : 'Inactivo'}
          </span>
        );
      }
    },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!productForm.name || !productForm.description) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    // Crear un nuevo producto con los datos del formulario
    const newProductData = {
      name: productForm.name,
      description: productForm.description,
      status: productForm.status,
      categoryId: productForm.categoryId || undefined,
      image: productForm.image || undefined
    };
    
    // Llamar al servicio para crear el producto
    try {
      setLoading(true);
      const createdProduct = await productService.createProduct(newProductData);
      // Actualizar la lista de productos
      setProducts(prevProducts => [...prevProducts, createdProduct]);
      console.log('Producto guardado:', createdProduct);
      setShowForm(false);
      setProductForm({
        name: '',
        description: '',
        categoryId: null,
        status: ProductStatus.ACTIVE,
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
            
            <Input 
              label="Descripción" 
              id="description" 
              name="description" 
              value={productForm.description} 
              onChange={handleInputChange} 
              required
            />
            
            <div className={styles.formGroup}>
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={productForm.status}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value={ProductStatus.ACTIVE}>Activo</option>
                <option value={ProductStatus.INACTIVE}>Inactivo</option>
              </select>
            </div>
            
            <ImageUpload
              label="Imagen del producto"
              value={productForm.image}
              onChange={handleImageChange}
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
            <div className={styles.loading}>Cargando productos...</div>
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
