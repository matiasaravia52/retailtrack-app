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
import { categoryService, Category } from '@/services/categoryService';
import styles from './page.module.css';

export default function Products() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de producto
  const [productForm, setProductForm] = useState({
    id: null as string | null,
    name: '',
    description: '',
    categoryId: null as string | null,
    status: ProductStatus.ACTIVE,
    image: null as string | null,
    imageFile: null as File | null,
    retail_price: 0,
    wholesale_price: 0
  });
  
  // Estado para controlar si estamos editando o creando un producto
  const [isEditing, setIsEditing] = useState(false);

  // Estado para almacenar la lista de productos
  const [products, setProducts] = useState<ProductType[]>([]);
  // Estado para almacenar la lista de categorías
  const [categories, setCategories] = useState<Category[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para indicar carga de categorías
  const [loadingCategories, setLoadingCategories] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);
  // Estado para manejar errores de categorías
  const [categoryError, setCategoryError] = useState<string | null>(null);

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
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getAllCategories();
        setCategories(data);
        setCategoryError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryError('Error al cargar categorías. Inténtelo de nuevo más tarde.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
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
      key: 'categoryId', 
      header: 'Categoría',
      render: (value: unknown) => {
        const categoryId = value as string;
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Sin categoría';
      }
    },
    { 
      key: 'stock', 
      header: 'Stock',
      render: (value: unknown) => {
        // Asegurarse de que stock sea un número
        return typeof value === 'number' ? value : 0;
      }
    },
    { 
      key: 'retail_price', 
      header: 'Precio minorista',
      render: (value: unknown) => {
        // Convertir a número si es string o usar el valor si ya es número
        const price = typeof value === 'string' ? parseFloat(value) : 
                     typeof value === 'number' ? value : 0;
        return `$${price.toFixed(2)}`;
      }
    },
    { 
      key: 'wholesale_price', 
      header: 'Precio mayorista',
      render: (value: unknown) => {
        // Convertir a número si es string o usar el valor si ya es número
        const price = typeof value === 'string' ? parseFloat(value) : 
                     typeof value === 'number' ? value : 0;
        return `$${price.toFixed(2)}`;
      }
    },
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
    {
      key: 'actions',
      header: 'Acciones',
      render: (_: unknown, item: ProductType) => (
        <div className={styles.actions}>
          <button 
            className={styles.editButton}
            onClick={() => handleEditProduct(item)}
          >
            Editar
          </button>
          <button 
            className={styles.deleteButton}
            onClick={() => handleDeleteProduct(item.id)}
          >
            Eliminar
          </button>
        </div>
      )
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
    
    // Crear un nuevo producto o actualizar uno existente con los datos del formulario
    const productData = {
      name: productForm.name,
      description: productForm.description,
      status: productForm.status,
      categoryId: productForm.categoryId || undefined,
      image: productForm.image || undefined,
      retail_price: Number(productForm.retail_price) || 0,
      wholesale_price: Number(productForm.wholesale_price) || 0
    };
    
    try {
      setLoading(true);
      
      if (isEditing && productForm.id) {
        // Actualizar producto existente
        const updatedProduct = await productService.updateProduct(productForm.id, productData);
        // Actualizar la lista de productos
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );
        alert('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const createdProduct = await productService.createProduct(productData);
        // Actualizar la lista de productos
        setProducts(prevProducts => [...prevProducts, createdProduct]);
        alert('Producto creado correctamente');
      }
      
      // Cerrar el formulario y limpiar los campos
      setShowForm(false);
      setProductForm({
        id: null,
        name: '',
        description: '',
        categoryId: null,
        status: ProductStatus.ACTIVE,
        image: null,
        imageFile: null,
        retail_price: 0,
        wholesale_price: 0
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error al guardar el producto:', err);
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} el producto. Inténtelo de nuevo más tarde.`);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para editar un producto
  const handleEditProduct = (product: ProductType) => {
    // Llenar el formulario con los datos del producto
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId || null,
      status: product.status,
      image: product.image || null,
      imageFile: null,
      retail_price: product.retail_price,
      wholesale_price: product.wholesale_price
    });
    
    // Mostrar el formulario en modo edición
    setIsEditing(true);
    setShowForm(true);
  };
  
  // Función para eliminar un producto
  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este producto? Esta acción marcará el producto como inactivo.')) {
      try {
        setLoading(true);
        const result = await productService.deleteProduct(id);
        
        if (result.success) {
          // Actualizar la lista de productos
          setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
          alert(result.message);
        } else {
          // Mostrar mensaje de error
          alert(result.message);
        }
      } catch (err) {
        console.error('Error al eliminar el producto:', err);
        alert('Error al eliminar el producto. Inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
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
        <Card title={isEditing ? "Editar Producto" : "Nuevo Producto"} footer={
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
              <label htmlFor="categoryId">Categoría</label>
              <select
                id="categoryId"
                name="categoryId"
                value={productForm.categoryId || ''}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Seleccione una categoría</option>
                {loadingCategories ? (
                  <option value="" disabled>Cargando categorías...</option>
                ) : categoryError ? (
                  <option value="" disabled>Error al cargar categorías</option>
                ) : (
                  categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
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
            
            <Input 
              label="Precio minorista ($)" 
              id="retail_price" 
              name="retail_price" 
              type="number"
              step="0.01"
              value={productForm.retail_price.toString()} 
              onChange={(e) => setProductForm({
                ...productForm,
                retail_price: parseFloat(e.target.value) || 0
              })} 
            />
            
            <Input 
              label="Precio mayorista ($)" 
              id="wholesale_price" 
              name="wholesale_price" 
              type="number"
              step="0.01"
              value={productForm.wholesale_price.toString()} 
              onChange={(e) => setProductForm({
                ...productForm,
                wholesale_price: parseFloat(e.target.value) || 0
              })} 
            />
            
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
