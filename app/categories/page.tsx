'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from './page.module.css';

export default function Categories() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de categoría
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Datos de ejemplo para las categorías
  const categories = [
    { id: '1', name: 'Electrónicos', productCount: 25 },
    { id: '2', name: 'Accesorios', productCount: 42 },
    { id: '3', name: 'Audio', productCount: 18 },
    { id: '4', name: 'Computación', productCount: 30 },
    { id: '5', name: 'Telefonía', productCount: 15 },
  ];

  // Columnas para la tabla de categorías
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'productCount', header: 'Cantidad de Productos' },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    console.log('Categoría a guardar:', categoryForm);
    // Aquí iría la lógica para guardar la categoría
    setShowForm(false);
    setCategoryForm({
      name: '',
      description: ''
    });
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Categorías" 
      actions={
        <Button onClick={() => setShowForm(true)}>Nueva Categoría</Button>
      }
    >
      {showForm ? (
        <Card title="Nueva Categoría" footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }>
          <form className={styles.categoryForm} onSubmit={handleFormSubmit}>
            <Input 
              label="Nombre" 
              id="name" 
              name="name" 
              value={categoryForm.name} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Descripción" 
              id="description" 
              name="description" 
              value={categoryForm.description} 
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
                placeholder="Buscar categorías..." 
                className={styles.searchInput} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <Table 
              columns={columns} 
              data={filteredCategories} 
              keyExtractor={(item) => item.id} 
              onRowClick={(item) => console.log('Categoría seleccionada:', item)}
              emptyMessage="No se encontraron categorías"
            />
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
