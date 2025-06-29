'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import ImageUpload from '@/components/ImageUpload';
import { productService, Product as ProductType, ProductStatus, ProductFilters, PaginatedResult } from '@/services/productService';
import { categoryService, Category } from '@/services/categoryService';
import styles from './page.module.css';

export default function Products() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para los filtros
  const [filters, setFilters] = useState<ProductFilters>({
    status: undefined,
    categoryId: undefined,
    sortBy: 'updatedAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 10
  });
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

  // Estado para almacenar la lista de productos y la información de paginación
  const [productData, setProductData] = useState<PaginatedResult<ProductType>>({ 
    items: [], 
    total: 0, 
    page: 1, 
    limit: 10, 
    totalPages: 0 
  });
  
  // Acceso rápido a la lista de productos
  const products = productData.items;
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

  // Cargar productos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts(filters);
        setProductData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar productos. Inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);
  
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
          <Button 
            variant="secondary" 
            onClick={() => handleEdit(item)}
          >
            Editar
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDelete(item.id)}
          >
            Eliminar
          </Button>
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
        setProductData(prevData => ({
          ...prevData,
          items: prevData.items.map((p: ProductType) => p.id === updatedProduct.id ? updatedProduct : p)
        }));
        alert('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        const createdProduct = await productService.createProduct(productData);
        // Actualizar la lista de productos
        setProductData(prevData => ({
          ...prevData,
          items: [...prevData.items, createdProduct],
          total: prevData.total + 1
        }));
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
  const handleEdit = (product: ProductType) => {
    // Actualizar el formulario con los datos del producto seleccionado
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || null,
      status: product.status as ProductStatus,
      image: product.image || null,
      imageFile: null,
      retail_price: product.retail_price || 0,
      wholesale_price: product.wholesale_price || 0
    });
    
    // Indicar que estamos en modo edición
    setIsEditing(true);
    // Mostrar el formulario
    setShowForm(true);
  };
  
  // Función para eliminar un producto
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        setLoading(true);
        const result = await productService.deleteProduct(id);
        
        // Actualizar la lista de productos después de eliminar
        setProductData(prevData => ({
          ...prevData,
          items: prevData.items.filter(p => p.id !== id),
          total: prevData.total - 1
        }));
        
        if (result && result.message) {
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

  // Manejar cambios en los filtros
  const handleFilterChange = (name: string, value: string | number) => {
    // Resetear la página a 1 cuando se cambia cualquier filtro excepto la página
    if (name !== 'page' && name !== 'limit') {
      setFilters(prev => ({
        ...prev,
        [name]: value === '' ? undefined : value,
        page: 1 // Resetear a la primera página
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value === '' ? undefined : value
      }));
    }
  };
  
  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= productData.totalPages) {
      handleFilterChange('page', newPage);
    }
  };
  
  // Manejar cambio en el límite de elementos por página
  const handleLimitChange = (newLimit: number) => {
    handleFilterChange('limit', newLimit);
  };

  // Manejar cambios en el ordenamiento
  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Manejar búsqueda
  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      // Si no hay término de búsqueda, cargar todos los productos con los filtros actuales
      try {
        setLoading(true);
        const data = await productService.getAllProducts(filters);
        setProductData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error al cargar productos. Inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    } else {
      // Si hay término de búsqueda, realizar búsqueda con los filtros actuales
      try {
        setLoading(true);
        const data = await productService.searchProducts(searchTerm, filters);
        setProductData(data);
        setError(null);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Error al buscar productos. Inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filtrar productos según el término de búsqueda (para búsqueda local)
  const filteredProducts = products;

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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                type="button" 
                onClick={handleSearch} 
                variant="primary"
                className={styles.searchButton}
              >
                Buscar
              </Button>
            </div>
            
            <div className={styles.filtersContainer}>
              <div className={styles.filterGroup}>
                <label htmlFor="statusFilter">Estado:</label>
                <select
                  id="statusFilter"
                  className={styles.select}
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value={ProductStatus.ACTIVE}>Activos</option>
                  <option value={ProductStatus.INACTIVE}>Inactivos</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="categoryFilter">Categoría:</label>
                <select
                  id="categoryFilter"
                  className={styles.select}
                  value={filters.categoryId || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                >
                  <option value="">Todas</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="sortByFilter">Ordenar por:</label>
                <select
                  id="sortByFilter"
                  className={styles.select}
                  value={filters.sortBy || 'updatedAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="name">Nombre</option>
                  <option value="createdAt">Fecha de creación</option>
                  <option value="updatedAt">Fecha de actualización</option>
                  <option value="retail_price">Precio minorista</option>
                  <option value="wholesale_price">Precio mayorista</option>
                  <option value="stock">Stock</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="sortOrderFilter">Orden:</label>
                <select
                  id="sortOrderFilter"
                  className={styles.select}
                  value={filters.sortOrder || 'DESC'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
                >
                  <option value="ASC">Ascendente</option>
                  <option value="DESC">Descendente</option>
                </select>
              </div>
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
              
              <div className={styles.pagination}>
                <div className={styles.paginationInfo}>
                  Mostrando {products.length} de {productData.total} productos | 
                  Página {productData.page} de {productData.totalPages}
                </div>
                
                <div className={styles.paginationControls}>
                  <div className={styles.limitSelector}>
                    <label htmlFor="limitSelector">Mostrar:</label>
                    <select
                      id="limitSelector"
                      className={styles.select}
                      value={filters.limit || 10}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                  
                  <div className={styles.pageButtons}>
                    <button 
                      className={styles.pageButton} 
                      onClick={() => handlePageChange(1)}
                      disabled={productData.page === 1}
                    >
                      &laquo;
                    </button>
                    <button 
                      className={styles.pageButton} 
                      onClick={() => handlePageChange(productData.page - 1)}
                      disabled={productData.page === 1}
                    >
                      &lt;
                    </button>
                    
                    {/* Mostrar números de página */}
                    {Array.from({ length: Math.min(5, productData.totalPages) }, (_, i) => {
                      // Calcular qué números de página mostrar
                      let pageNum;
                      if (productData.totalPages <= 5) {
                        // Si hay 5 o menos páginas, mostrar todas
                        pageNum = i + 1;
                      } else if (productData.page <= 3) {
                        // Si estamos en las primeras páginas
                        pageNum = i + 1;
                      } else if (productData.page >= productData.totalPages - 2) {
                        // Si estamos en las últimas páginas
                        pageNum = productData.totalPages - 4 + i;
                      } else {
                        // Si estamos en el medio
                        pageNum = productData.page - 2 + i;
                      }
                      
                      return (
                        <button 
                          key={pageNum}
                          className={`${styles.pageButton} ${pageNum === productData.page ? styles.activePage : ''}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      className={styles.pageButton} 
                      onClick={() => handlePageChange(productData.page + 1)}
                      disabled={productData.page === productData.totalPages}
                    >
                      &gt;
                    </button>
                    <button 
                      className={styles.pageButton} 
                      onClick={() => handlePageChange(productData.totalPages)}
                      disabled={productData.page === productData.totalPages}
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}
      </>
    )}
    </DashboardLayout>
  );
}
