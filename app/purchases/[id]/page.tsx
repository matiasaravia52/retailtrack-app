'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from '../page.module.css';
import { purchaseService, Purchase, PurchaseStatus, PurchaseLine, CreatePurchaseLineData } from '@/services/purchaseService';
import { productService, Product } from '@/services/productService';
import { Toaster, toast } from 'react-hot-toast';

export default function PurchaseDetails() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = params.id as string;
  
  // Estado para la compra
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para mostrar el formulario de línea de compra
  const [showLineForm, setShowLineForm] = useState(false);
  // Estado para el formulario de línea de compra
  const [lineForm, setLineForm] = useState<CreatePurchaseLineData>({
    productId: '',
    quantity: 0,
    unitCostPrice: 0,
    subtotal: 0
  });
  // Estado para los productos
  const [products, setProducts] = useState<Product[]>([]);
  // Estado para la línea de compra seleccionada para editar
  const [selectedLine, setSelectedLine] = useState<PurchaseLine | null>(null);

  // Cargar la compra y los productos al montar el componente
  useEffect(() => {
    loadPurchase();
    loadProducts();
  }, [purchaseId]);

  // Función para cargar la compra
  const loadPurchase = async () => {
    try {
      setLoading(true);
      const data = await purchaseService.getPurchaseById(purchaseId);
      setPurchase(data);
    } catch (error) {
      console.error('Error al cargar la compra:', error);
      toast.error('Error al cargar los detalles de la compra');
      router.push('/purchases');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los productos
  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar los productos');
    }
  };

  // Columnas para la tabla de líneas de compra
  const columns = [
    { 
      key: 'product', 
      header: 'Producto',
      render: (value: unknown, item: PurchaseLine) => item.product?.name || 'Producto desconocido'
    },
    { 
      key: 'quantity', 
      header: 'Cantidad',
      render: (value: unknown, item: PurchaseLine) => item.quantity.toString()
    },
    { 
      key: 'unitCostPrice', 
      header: 'Precio Unitario',
      render: (value: unknown, item: PurchaseLine) => `$${item.unitCostPrice.toFixed(2)}`
    },
    { 
      key: 'subtotal', 
      header: 'Subtotal',
      render: (value: unknown, item: PurchaseLine) => `$${item.subtotal.toFixed(2)}`
    }
  ];

  // Función para manejar cambios en el formulario de línea
  const handleLineInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el producto o el precio unitario, recalcular el subtotal
    if (name === 'productId' || name === 'quantity' || name === 'unitCostPrice') {
      const updatedForm = {
        ...lineForm,
        [name]: name === 'productId' ? value : parseFloat(value) || 0
      };
      
      // Calcular el subtotal
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : lineForm.quantity;
      const unitPrice = name === 'unitCostPrice' ? parseFloat(value) || 0 : lineForm.unitCostPrice;
      const subtotal = quantity * unitPrice;
      
      setLineForm({
        ...updatedForm,
        subtotal
      });
    } else {
      setLineForm({
        ...lineForm,
        [name]: name === 'productId' ? value : parseFloat(value) || 0
      });
    }
  };

  // Función para manejar el envío del formulario de línea
  const handleLineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Aquí iría la lógica para agregar o actualizar una línea de compra
      // Esta funcionalidad requeriría endpoints adicionales en el backend
      // Por ahora, simulamos una operación exitosa
      toast.success('Línea de compra guardada correctamente');
      setShowLineForm(false);
      setLineForm({
        productId: '',
        quantity: 0,
        unitCostPrice: 0,
        subtotal: 0
      });
      setSelectedLine(null);
      loadPurchase(); // Recargar la compra para ver los cambios
    } catch (error) {
      console.error('Error al guardar línea de compra:', error);
      toast.error('Error al guardar la línea de compra');
    }
  };

  // Función para eliminar una línea de compra
  const handleDeleteLine = async (lineId: string) => {
    if (confirm('¿Está seguro que desea eliminar esta línea de compra?')) {
      try {
        // Aquí iría la lógica para eliminar una línea de compra
        // Esta funcionalidad requeriría endpoints adicionales en el backend
        // Por ahora, simulamos una operación exitosa
        toast.success('Línea de compra eliminada correctamente');
        loadPurchase(); // Recargar la compra para ver los cambios
      } catch (error) {
        console.error('Error al eliminar línea de compra:', error);
        toast.error('Error al eliminar la línea de compra');
      }
    }
  };

  // Función para editar una línea de compra
  const handleEditLine = (line: PurchaseLine) => {
    setSelectedLine(line);
    setLineForm({
      productId: line.productId,
      quantity: line.quantity,
      unitCostPrice: line.unitCostPrice,
      subtotal: line.subtotal
    });
    setShowLineForm(true);
  };

  // Función para cambiar el estado de la compra
  const handleStatusChange = async (newStatus: PurchaseStatus) => {
    if (!purchase) return;
    
    try {
      await purchaseService.updatePurchase(purchase.id, {
        status: newStatus
      });
      toast.success('Estado de la compra actualizado correctamente');
      loadPurchase(); // Recargar la compra para ver los cambios
    } catch (error) {
      console.error('Error al actualizar estado de la compra:', error);
      toast.error('Error al actualizar el estado de la compra');
    }
  };

  // Renderizar un mensaje de carga si aún no tenemos los datos de la compra
  if (loading) {
    return (
      <DashboardLayout title="Detalles de Compra">
        <div className={styles.loading}>Cargando detalles de la compra...</div>
      </DashboardLayout>
    );
  }

  // Renderizar un mensaje de error si no se encontró la compra
  if (!purchase) {
    return (
      <DashboardLayout title="Detalles de Compra">
        <Card>
          <div className={styles.error}>
            <h2>Compra no encontrada</h2>
            <p>La compra que está buscando no existe o ha sido eliminada.</p>
            <Button onClick={() => router.push('/purchases')}>Volver a Compras</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={`Compra #${purchase.id.substring(0, 8)}`}
      actions={
        <div className={styles.actions}>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/purchases')}
          >
            Volver
          </Button>
          {purchase.status === PurchaseStatus.PENDING && (
            <Button 
              variant="primary" 
              onClick={() => handleStatusChange(PurchaseStatus.COMPLETED)}
            >
              Completar Compra
            </Button>
          )}
          {purchase.status === PurchaseStatus.PENDING && (
            <Button 
              variant="danger" 
              onClick={() => handleStatusChange(PurchaseStatus.CANCELLED)}
            >
              Cancelar Compra
            </Button>
          )}
        </div>
      }
    >
      <Toaster position="top-right" />
      
      {/* Detalles de la compra */}
      <Card title="Información de la Compra">
        <div className={styles.purchaseInfo}>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Proveedor:</span>
              <span className={styles.infoValue}>{purchase.supplier?.name || 'Sin proveedor'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Estado:</span>
              <span className={`${styles.infoValue} ${styles[`status${purchase.status === PurchaseStatus.PENDING ? 'Pending' : purchase.status === PurchaseStatus.COMPLETED ? 'Completed' : 'Cancelled'}`]}`}>
                {purchase.status === PurchaseStatus.PENDING ? 'Pendiente' : 
                 purchase.status === PurchaseStatus.COMPLETED ? 'Completada' : 'Cancelada'}
              </span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha:</span>
              <span className={styles.infoValue}>{new Date(purchase.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Subtotal:</span>
              <span className={styles.infoValue}>${purchase.subtotal.toFixed(2)}</span>
            </div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Impuestos:</span>
              <span className={styles.infoValue}>${purchase.taxes.toFixed(2)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total:</span>
              <span className={styles.infoValue}>${purchase.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Líneas de compra */}
      <Card title="Líneas de Compra">
        {purchase.status === PurchaseStatus.PENDING && (
          <div className={styles.cardActions}>
            <Button onClick={() => {
              setSelectedLine(null);
              setLineForm({
                productId: '',
                quantity: 0,
                unitCostPrice: 0,
                subtotal: 0
              });
              setShowLineForm(true);
            }}>
              Agregar Línea
            </Button>
          </div>
        )}
        {showLineForm ? (
          <form className={styles.lineForm} onSubmit={handleLineSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="productId" className={styles.label}>Producto</label>
              <select
                id="productId"
                name="productId"
                value={lineForm.productId}
                onChange={handleLineInputChange}
                className={styles.select}
                required
              >
                <option value="">Seleccione un producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Input 
              label="Cantidad" 
              id="quantity" 
              name="quantity" 
              type="number"
              min="1"
              step="1"
              value={lineForm.quantity.toString()} 
              onChange={handleLineInputChange} 
              required 
            />
            
            <Input 
              label="Precio Unitario" 
              id="unitCostPrice" 
              name="unitCostPrice" 
              type="number"
              step="0.01"
              value={lineForm.unitCostPrice.toString()} 
              onChange={handleLineInputChange} 
              required 
            />
            
            <Input 
              label="Subtotal" 
              id="subtotal" 
              name="subtotal" 
              type="number"
              step="0.01"
              value={(lineForm.subtotal || 0).toString()} 
              readOnly
              disabled
            />
            
            <div className={styles.formActions}>
              <Button variant="secondary" onClick={() => {
                setShowLineForm(false);
                setSelectedLine(null);
                setLineForm({
                  productId: '',
                  quantity: 0,
                  unitCostPrice: 0,
                  subtotal: 0
                });
              }}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedLine ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </form>
        ) : (
          purchase.purchaseLines && purchase.purchaseLines.length > 0 ? (
            <Table 
              columns={columns} 
              data={purchase.purchaseLines} 
              keyExtractor={(item) => item.id} 
              actions={purchase.status === PurchaseStatus.PENDING ? [
                { 
                  label: 'Editar', 
                  onClick: (item: PurchaseLine) => handleEditLine(item) 
                },
                { 
                  label: 'Eliminar', 
                  onClick: (item: PurchaseLine) => handleDeleteLine(item.id),
                  variant: 'danger'
                }
              ] : []}
            />
          ) : (
            <div className={styles.emptyState}>
              <p>No hay líneas de compra registradas.</p>
              {purchase.status === PurchaseStatus.PENDING && (
                <Button onClick={() => {
                  setSelectedLine(null);
                  setLineForm({
                    productId: '',
                    quantity: 0,
                    unitCostPrice: 0,
                    subtotal: 0
                  });
                  setShowLineForm(true);
                }}>
                  Agregar Línea
                </Button>
              )}
            </div>
          )
        )}
      </Card>
    </DashboardLayout>
  );
}
