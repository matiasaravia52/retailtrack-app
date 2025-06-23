'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from './page.module.css';
import { supplierService, Supplier, CreateSupplierData } from '@/services/supplierService';
import { Toaster, toast } from 'react-hot-toast';

export default function Suppliers() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de proveedor
  const [supplierForm, setSupplierForm] = useState<CreateSupplierData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: ''
  });
  // Estado para los proveedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para el proveedor seleccionado para editar
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Función para cargar los proveedores
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      toast.error('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla de proveedores
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'contactPerson', header: 'Persona de Contacto' },
    { key: 'address', header: 'Dirección' },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplierForm({
      ...supplierForm,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      if (selectedSupplier) {
        // Actualizar proveedor existente
        await supplierService.updateSupplier(selectedSupplier.id, supplierForm);
        toast.success('Proveedor actualizado correctamente');
      } else {
        // Crear nuevo proveedor
        await supplierService.createSupplier(supplierForm);
        toast.success('Proveedor creado correctamente');
      }
      setShowForm(false);
      setSupplierForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: ''
      });
      setSelectedSupplier(null);
      loadSuppliers(); // Recargar los proveedores
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      toast.error('Error al guardar el proveedor');
    }
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Función para eliminar un proveedor
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este proveedor?')) {
      try {
        await supplierService.deleteSupplier(id);
        toast.success('Proveedor eliminado correctamente');
        loadSuppliers(); // Recargar los proveedores
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        toast.error('Error al eliminar el proveedor');
      }
    }
  };

  // Función para editar un proveedor
  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      contactPerson: supplier.contactPerson
    });
    setShowForm(true);
  };

  // Filtrar proveedores según el término de búsqueda
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Proveedores" 
      actions={
        <Button onClick={() => {
          setSelectedSupplier(null);
          setSupplierForm({ name: '', email: '', phone: '', address: '', contactPerson: '' });
          setShowForm(true);
        }}>Nuevo Proveedor</Button>
      }
    >
      <Toaster position="top-right" />
      {showForm ? (
        <Card title={selectedSupplier ? "Editar Proveedor" : "Nuevo Proveedor"} footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowForm(false);
              setSelectedSupplier(null);
              setSupplierForm({ name: '', email: '', phone: '', address: '', contactPerson: '' });
            }}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }>
          <form className={styles.supplierForm} onSubmit={handleFormSubmit}>
            <Input 
              label="Nombre" 
              id="name" 
              name="name" 
              value={supplierForm.name} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Email" 
              id="email" 
              name="email" 
              type="email"
              value={supplierForm.email} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Teléfono" 
              id="phone" 
              name="phone" 
              value={supplierForm.phone} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Persona de Contacto" 
              id="contactPerson" 
              name="contactPerson" 
              value={supplierForm.contactPerson} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Dirección" 
              id="address" 
              name="address" 
              value={supplierForm.address} 
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
                placeholder="Buscar proveedores..." 
                className={styles.searchInput} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            {loading ? (
              <div className={styles.loading}>Cargando proveedores...</div>
            ) : (
              <Table 
                columns={columns} 
                data={filteredSuppliers} 
                keyExtractor={(item) => item.id} 
                onRowClick={(item) => handleEdit(item)}
                emptyMessage="No se encontraron proveedores"
                actions={[
                  { 
                    label: 'Editar', 
                    onClick: (item: Supplier) => handleEdit(item) 
                  },
                  { 
                    label: 'Eliminar', 
                    onClick: (item: Supplier) => handleDelete(item.id),
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
