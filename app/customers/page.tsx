'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from './page.module.css';
import { customerService, Customer, CreateCustomerData } from '@/services/customerService';
import { Toaster, toast } from 'react-hot-toast';

export default function Customers() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de cliente
  const [customerForm, setCustomerForm] = useState<CreateCustomerData>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  // Estado para los clientes
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para el cliente seleccionado para editar
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadCustomers();
  }, []);

  // Función para cargar los clientes
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla de clientes
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Teléfono' },
    { key: 'address', header: 'Dirección' },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerForm({
      ...customerForm,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      if (selectedCustomer) {
        // Actualizar cliente existente
        await customerService.updateCustomer(selectedCustomer.id, customerForm);
        toast.success('Cliente actualizado correctamente');
      } else {
        // Crear nuevo cliente
        await customerService.createCustomer(customerForm);
        toast.success('Cliente creado correctamente');
      }
      setShowForm(false);
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      setSelectedCustomer(null);
      loadCustomers(); // Recargar los clientes
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      toast.error('Error al guardar el cliente');
    }
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Función para eliminar un cliente
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar este cliente?')) {
      try {
        await customerService.deleteCustomer(id);
        toast.success('Cliente eliminado correctamente');
        loadCustomers(); // Recargar los clientes
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        toast.error('Error al eliminar el cliente');
      }
    }
  };

  // Función para editar un cliente
  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setShowForm(true);
  };

  // Filtrar clientes según el término de búsqueda
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Clientes" 
      actions={
        <Button onClick={() => {
          setSelectedCustomer(null);
          setCustomerForm({ name: '', email: '', phone: '', address: '' });
          setShowForm(true);
        }}>Nuevo Cliente</Button>
      }
    >
      <Toaster position="top-right" />
      {showForm ? (
        <Card title={selectedCustomer ? "Editar Cliente" : "Nuevo Cliente"} footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowForm(false);
              setSelectedCustomer(null);
              setCustomerForm({ name: '', email: '', phone: '', address: '' });
            }}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }>
          <form className={styles.customerForm} onSubmit={handleFormSubmit}>
            <Input 
              label="Nombre" 
              id="name" 
              name="name" 
              value={customerForm.name} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Email" 
              id="email" 
              name="email" 
              type="email"
              value={customerForm.email} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Teléfono" 
              id="phone" 
              name="phone" 
              value={customerForm.phone} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Dirección" 
              id="address" 
              name="address" 
              value={customerForm.address} 
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
                placeholder="Buscar clientes..." 
                className={styles.searchInput} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            {loading ? (
              <div className={styles.loading}>Cargando clientes...</div>
            ) : (
              <Table 
                columns={columns} 
                data={filteredCustomers} 
                keyExtractor={(item) => item.id} 
                onRowClick={(item) => handleEdit(item)}
                emptyMessage="No se encontraron clientes"
                actions={[
                  { 
                    label: 'Editar', 
                    onClick: (item: Customer) => handleEdit(item) 
                  },
                  { 
                    label: 'Eliminar', 
                    onClick: (item: Customer) => handleDelete(item.id),
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
