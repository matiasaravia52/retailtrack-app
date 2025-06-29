'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input, { Select } from '@/components/Input';
import styles from './page.module.css';
import { batchService, CreateBatchData } from '@/services/inventoryService';
import { productService, Product } from '@/services/productService';

export default function Inventory() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para los productos
  const [products, setProducts] = useState<Product[]>([]);
  // Estado para el inventario calculado
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null);
  // Estado para el formulario de lote
  const [batchForm, setBatchForm] = useState<CreateBatchData>({
    productId: '',
    initialQuantity: 0,
    availableQuantity: 0,
    unitCost: 0
  });

  // Definir el tipo para nuestros items de inventario
  type InventoryItem = {
    id: string;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
    lastMovement: string;
  };
  
  // Cargar productos y calcular inventario al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Cargar productos
        const productsData = await productService.getAllProducts();
        
        // Verificar que productsData tenga la estructura esperada
        if (productsData && Array.isArray(productsData.items)) {
          setProducts(productsData.items);
          
          // Calcular inventario para cada producto
          const inventoryItems: InventoryItem[] = [];
          
          for (const product of productsData.items) {
          try {
            // Obtener lotes del producto
            const batches = await batchService.getBatchesByProduct(product.id);
            
            // Calcular stock total
            const totalStock = batches.reduce((sum, batch) => sum + batch.availableQuantity, 0);
            
            // Obtener fecha del último movimiento
            const lastMovementDate = batches.length > 0 ? 
              new Date(Math.max(...batches.map(b => new Date(b.createdAt || '').getTime()))) : 
              new Date();
            
            // Formatear fecha
            const lastMovement = lastMovementDate.toLocaleDateString('es-ES');
            
            inventoryItems.push({
              id: product.id,
              name: product.name,
              sku: product.id.substring(0, 6), // Placeholder para SKU
              stock: totalStock,
              minStock: 5, // Valor por defecto, debería venir del producto
              lastMovement
            });
          } catch (err) {
            console.error(`Error calculando inventario para ${product.name}:`, err);
          }
        }
        
        setInventory(inventoryItems);
        } else {
          console.error('El formato de datos de productos no es el esperado:', productsData);
          setError('Error en el formato de datos recibidos');
          setProducts([]);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error cargando datos');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Columnas para la tabla de inventario
  const columns = [
    { key: 'name', header: 'Producto' },
    { key: 'sku', header: 'SKU' },
    { 
      key: 'stock', 
      header: 'Stock Actual',
      render: (value: unknown, item: InventoryItem) => {
        const stockValue = typeof value === 'number' ? value : 0;
        return (
          <span className={stockValue < item.minStock ? styles.lowStock : styles.goodStock}>
            {stockValue}
          </span>
        );
      }
    },
    { key: 'minStock', header: 'Stock Mínimo' },
    { key: 'lastMovement', header: 'Último Movimiento' },
  ];

  // Función para manejar cambios en el formulario de lote
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBatchForm({
      ...batchForm,
      [name]: name === 'productId' ? value : Number(value)
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      // Validar que los campos numéricos sean mayores a 0
      if (batchForm.initialQuantity <= 0 || batchForm.unitCost <= 0) {
        alert('La cantidad inicial y el costo unitario deben ser mayores a 0');
        return;
      }
      
      // Asegurar que la cantidad disponible sea igual a la inicial al crear el lote
      const formData = {
        ...batchForm,
        availableQuantity: batchForm.initialQuantity
      };
      
      // Crear el lote
      await batchService.createBatch(formData);
      
      // Recargar los datos de inventario
      const productsData = await productService.getAllProducts();
      
      // Verificar que productsData tenga la estructura esperada
      if (productsData && Array.isArray(productsData.items)) {
        setProducts(productsData.items);
        
        // Recalcular inventario
        const inventoryItems: InventoryItem[] = [];
        
        for (const product of productsData.items) {
        try {
          const batches = await batchService.getBatchesByProduct(product.id);
          const totalStock = batches.reduce((sum, batch) => sum + batch.availableQuantity, 0);
          const lastMovementDate = batches.length > 0 ? 
            new Date(Math.max(...batches.map(b => new Date(b.createdAt || '').getTime()))) : 
            new Date();
          const lastMovement = lastMovementDate.toLocaleDateString('es-ES');
          
          inventoryItems.push({
            id: product.id,
            name: product.name,
            sku: product.id.substring(0, 6),
            stock: totalStock,
            minStock: 5,
            lastMovement
          });
        } catch (err) {
          console.error(`Error calculando inventario para ${product.name}:`, err);
        }
      }
      
      setInventory(inventoryItems);
      } else {
        console.error('El formato de datos de productos no es el esperado:', productsData);
        setError('Error en el formato de datos recibidos');
        setProducts([]);
      }
      
      // Cerrar formulario y resetear
      setShowForm(false);
      setBatchForm({
        productId: '',
        initialQuantity: 0,
        availableQuantity: 0,
        unitCost: 0
      });
      
      alert('Lote creado correctamente');
    } catch (err: any) {
      console.error('Error al crear lote:', err);
      alert(`Error al crear lote: ${err.message || 'Error desconocido'}`);
    }
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
        <Button onClick={() => setShowForm(true)}>Agregar Stock por Lote</Button>
      }
    >
      {showForm ? (
        <Card title="Agregar Stock por Lote" footer={
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
              value={batchForm.productId}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
            
            <Input 
              label="Cantidad Inicial" 
              id="initialQuantity" 
              name="initialQuantity" 
              type="number" 
              value={batchForm.initialQuantity.toString()} 
              onChange={handleInputChange} 
              required 
            />
            
            <Input 
              label="Costo Unitario" 
              id="unitCost" 
              name="unitCost" 
              type="number" 
              step="0.01"
              value={batchForm.unitCost.toString()} 
              onChange={handleInputChange} 
              required 
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

          {loading ? (
            <Card>
              <div className={styles.loading}>Cargando inventario...</div>
            </Card>
          ) : error ? (
            <Card>
              <div className={styles.error}>{error}</div>
            </Card>
          ) : (
            <Card>
              <Table 
                columns={columns} 
                data={filteredInventory} 
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
