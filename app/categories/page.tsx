'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input from '@/components/Input';
import styles from './page.module.css';
import { categoryService, Category, CreateCategoryData, CategoryStatus } from '@/services/categoryService';
import { Toaster, toast } from 'react-hot-toast';

export default function Categories() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de categoría
  const [categoryForm, setCategoryForm] = useState<CreateCategoryData>({
    name: '',
    status: CategoryStatus.ACTIVE
  });
  // Estado para las categorías
  const [categories, setCategories] = useState<Category[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para la categoría seleccionada para editar
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  // Función para cargar las categorías
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  // Columnas para la tabla de categorías
  const columns = [
    { key: 'name', header: 'Nombre' },
    { 
      key: 'status', 
      header: 'Estado',
      render: (value: unknown) => {
        const status = value as CategoryStatus;
        return (
          <span className={status === CategoryStatus.ACTIVE ? styles.statusActive : styles.statusInactive}>
            {status === CategoryStatus.ACTIVE ? 'Activo' : 'Inactivo'}
          </span>
        );
      }
    },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    try {
      if (selectedCategory) {
        // Actualizar categoría existente
        await categoryService.updateCategory(selectedCategory.id, categoryForm);
        toast.success('Categoría actualizada correctamente');
      } else {
        // Crear nueva categoría
        await categoryService.createCategory(categoryForm);
        toast.success('Categoría creada correctamente');
      }
      setShowForm(false);
      setCategoryForm({
        name: '',
        status: CategoryStatus.ACTIVE
      });
      setSelectedCategory(null);
      loadCategories(); // Recargar las categorías
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      toast.error('Error al guardar la categoría');
    }
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Función para eliminar una categoría
  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro que desea eliminar esta categoría?')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Categoría eliminada correctamente');
        loadCategories(); // Recargar las categorías
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        toast.error('Error al eliminar la categoría');
      }
    }
  };

  // Función para editar una categoría
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      status: category.status
    });
    setShowForm(true);
  };

  // Filtrar categorías según el término de búsqueda
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Categorías" 
      actions={
        <Button onClick={() => {
          setSelectedCategory(null);
          setCategoryForm({ name: '', status: CategoryStatus.ACTIVE });
          setShowForm(true);
        }}>Nueva Categoría</Button>
      }
    >
      <Toaster position="top-right" />
      {showForm ? (
        <Card title={selectedCategory ? "Editar Categoría" : "Nueva Categoría"} footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowForm(false);
              setSelectedCategory(null);
              setCategoryForm({ name: '', status: CategoryStatus.ACTIVE });
            }}>Cancelar</Button>
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
            <div className={styles.formGroup}>
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={categoryForm.status}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value={CategoryStatus.ACTIVE}>Activo</option>
                <option value={CategoryStatus.INACTIVE}>Inactivo</option>
              </select>
            </div>
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
            {loading ? (
              <div className={styles.loading}>Cargando categorías...</div>
            ) : (
              <Table 
                columns={columns} 
                data={filteredCategories} 
                keyExtractor={(item) => item.id} 
                onRowClick={(item) => handleEdit(item)}
                emptyMessage="No se encontraron categorías"
                actions={[
                  { 
                    label: 'Editar', 
                    onClick: (item: Category) => handleEdit(item) 
                  },
                  { 
                    label: 'Eliminar', 
                    onClick: (item: Category) => handleDelete(item.id),
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
