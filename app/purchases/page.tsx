'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from './page.module.css';
import { purchaseService, Purchase, CreatePurchaseData, PurchaseStatus, CreatePurchaseLineData } from '@/services/purchaseService';
import { supplierService, Supplier } from '@/services/supplierService';
import { Toaster, toast } from 'react-hot-toast';

export default function Purchases() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de compra
  const [purchaseForm, setPurchaseForm] = useState<CreatePurchaseData>({
    supplierId: '',
    subtotal: 0,
    taxes: 0,
    total: 0,
    status: PurchaseStatus.PENDING,
    purchaseLines: []
  });
  // Estado para las compras
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  // Estado para los proveedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para la compra seleccionada para editar
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Cargar compras y proveedores al montar el componente
  useEffect(() => {
    loadPurchases();
    loadSuppliers();
  }, []);

  // Función para cargar las compras
  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await purchaseService.getAllPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('Error al cargar compras:', error);
      toast.error('Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar los proveedores
  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('Error al cargar los proveedores');
    }
  };

  // Columnas para la tabla de compras
  const columns = [
    { 
      key: 'supplier', 
      header: 'Proveedor',
      render: (value: unknown, item: Purchase) => item.supplier?.name || 'Sin proveedor'
    },
    { 
      key: 'subtotal', 
      header: 'Subtotal', 
      render: (value: unknown, item: Purchase) => `$${(item.subtotal || 0).toFixed(2)}` 
    },
    { 
      key: 'taxes', 
      header: 'Impuestos', 
      render: (value: unknown, item: Purchase) => `$${(item.taxes || 0).toFixed(2)}` 
    },
    { 
      key: 'total', 
      header: 'Total', 
      render: (value: unknown, item: Purchase) => `$${(item.total || 0).toFixed(2)}` 
    },
    { 
      key: 'status', 
      header: 'Estado',
      render: (value: unknown, item: Purchase) => {
        const status = item.status;
        switch(status) {
          case PurchaseStatus.PENDING:
            return <span className={styles.statusPending}>Pendiente</span>;
          case PurchaseStatus.COMPLETED:
            return <span className={styles.statusCompleted}>Completada</span>;
          case PurchaseStatus.CANCELLED:
            return <span className={styles.statusCancelled}>Cancelada</span>;
          default:
            return status;
        }
      }
    },
    { 
      key: 'createdAt', 
      header: 'Fecha',
      render: (value: unknown, item: Purchase) => new Date(item.createdAt).toLocaleDateString()
    }
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPurchaseForm({
      ...purchaseForm,
      [name]: name === 'supplierId' ? value : name === 'status' ? value : parseFloat(value) || 0
    });
  };

  // Función para manejar cambios en el estado
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPurchaseForm({
      ...purchaseForm,
      status: e.target.value as PurchaseStatus
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      if (selectedPurchase) {
        // Actualizar compra existente
        await purchaseService.updatePurchase(selectedPurchase.id, {
          supplierId: purchaseForm.supplierId,
          subtotal: purchaseForm.subtotal,
          taxes: purchaseForm.taxes,
          total: purchaseForm.total,
          status: purchaseForm.status
        });
        toast.success('Compra actualizada correctamente');
      } else {
        // Crear nueva compra
        await purchaseService.createPurchase(purchaseForm);
        toast.success('Compra creada correctamente');
      }
      setShowForm(false);
      setPurchaseForm({
        supplierId: '',
        subtotal: 0,
        taxes: 0,
        total: 0,
        status: PurchaseStatus.PENDING,
        purchaseLines: []
      });
      setSelectedPurchase(null);
      loadPurchases(); // Recargar las compras
    } catch (error) {
      console.error('Error al guardar compra:', error);
      toast.error('Error al guardar la compra');
    }
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Función para eliminar una compra
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar esta compra?')) {
      try {
        await purchaseService.deletePurchase(id);
        toast.success('Compra eliminada correctamente');
        loadPurchases(); // Recargar las compras
      } catch (error) {
        console.error('Error al eliminar compra:', error);
        toast.error('Error al eliminar la compra');
      }
    }
  };

  // Función para editar una compra
  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setPurchaseForm({
      supplierId: purchase.supplierId,
      subtotal: purchase.subtotal,
      taxes: purchase.taxes,
      total: purchase.total,
      status: purchase.status,
      purchaseLines: []
    });
    setShowForm(true);
  };

  // Función para ver detalles de una compra
  const handleViewDetails = (purchase: Purchase) => {
    // Aquí iría la lógica para ver los detalles de la compra
    // Por ejemplo, redirigir a una página de detalles
    window.location.href = `/purchases/${purchase.id}`;
  };

  // Filtrar compras según el término de búsqueda
  const filteredPurchases = purchases.filter(purchase => {
    const supplierName = purchase.supplier?.name?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      supplierName.includes(searchTermLower) ||
      purchase.status.toLowerCase().includes(searchTermLower) ||
      purchase.total.toString().includes(searchTerm)
    );
  });

  // Calcular el total basado en subtotal e impuestos
  const calculateTotal = () => {
    const subtotal = purchaseForm.subtotal || 0;
    const taxes = purchaseForm.taxes || 0;
    return subtotal + taxes;
  };

  // Actualizar el total cuando cambia el subtotal o los impuestos
  useEffect(() => {
    setPurchaseForm(prev => ({
      ...prev,
      total: calculateTotal()
    }));
  }, [purchaseForm.subtotal, purchaseForm.taxes]);

  return (
    <DashboardLayout 
      title="Compras" 
      actions={
        <Button onClick={() => {
          setSelectedPurchase(null);
          setPurchaseForm({
            supplierId: '',
            subtotal: 0,
            taxes: 0,
            total: 0,
            status: PurchaseStatus.PENDING,
            purchaseLines: []
          });
          setShowForm(true);
        }}>Nueva Compra</Button>
      }
    >
      <Toaster position="top-right" />
      {showForm ? (
        <Card title={selectedPurchase ? "Editar Compra" : "Nueva Compra"} footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowForm(false);
              setSelectedPurchase(null);
              setPurchaseForm({
                supplierId: '',
                subtotal: 0,
                taxes: 0,
                total: 0,
                status: PurchaseStatus.PENDING,
                purchaseLines: []
              });
            }}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }>
          <form className={styles.purchaseForm} onSubmit={handleFormSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="supplierId" className={styles.label}>Proveedor</label>
              <select
                id="supplierId"
                name="supplierId"
                value={purchaseForm.supplierId}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="">Seleccione un proveedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            
            <Input 
              label="Subtotal" 
              id="subtotal" 
              name="subtotal" 
              type="number"
              step="0.01"
              value={(purchaseForm.subtotal || 0).toString()} 
              onChange={handleInputChange} 
              required 
            />
            
            <Input 
              label="Impuestos" 
              id="taxes" 
              name="taxes" 
              type="number"
              step="0.01"
              value={(purchaseForm.taxes || 0).toString()} 
              onChange={handleInputChange} 
              required 
            />
            
            <Input 
              label="Total" 
              id="total" 
              name="total" 
              type="number"
              step="0.01"
              value={(purchaseForm.total || 0).toString()} 
              readOnly
              disabled
            />
            
            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>Estado</label>
              <select
                id="status"
                name="status"
                value={purchaseForm.status}
                onChange={handleStatusChange}
                className={styles.select}
                required
              >
                <option value={PurchaseStatus.PENDING}>Pendiente</option>
                <option value={PurchaseStatus.COMPLETED}>Completada</option>
                <option value={PurchaseStatus.CANCELLED}>Cancelada</option>
              </select>
            </div>
            
            {/* Aquí iría la sección para agregar líneas de compra */}
            {!selectedPurchase && (
              <div className={styles.purchaseLinesSection}>
                <h3 className={styles.sectionTitle}>Líneas de Compra</h3>
                <p className={styles.note}>
                  Las líneas de compra se agregarán en la página de detalles después de crear la compra.
                </p>
              </div>
            )}
          </form>
        </Card>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Buscar compras..." 
                className={styles.searchInput} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            {loading ? (
              <div className={styles.loading}>Cargando compras...</div>
            ) : (
              <Table 
                columns={columns} 
                data={filteredPurchases} 
                keyExtractor={(item) => item.id} 
                onRowClick={(item) => handleViewDetails(item)}
                emptyMessage="No se encontraron compras"
                actions={[
                  { 
                    label: 'Ver Detalles', 
                    onClick: (item: Purchase) => handleViewDetails(item),
                    variant: 'primary'
                  },
                  { 
                    label: 'Editar', 
                    onClick: (item: Purchase) => handleEdit(item) 
                  },
                  { 
                    label: 'Eliminar', 
                    onClick: (item: Purchase) => handleDelete(item.id),
                    variant: 'danger'
                  }
                ]}
              />
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
