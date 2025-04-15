'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input, { Select } from '@/components/Input';
import styles from './page.module.css';

export default function Users() {
  // Estado para controlar la visualización del formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el formulario de usuario
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  // Datos de ejemplo para los usuarios
  const users = [
    { id: '1', name: 'Admin Usuario', email: 'admin@retailtrack.com', role: 'admin', lastLogin: '15/04/2025 10:30' },
    { id: '2', name: 'Gerente Ejemplo', email: 'gerente@retailtrack.com', role: 'manager', lastLogin: '15/04/2025 09:15' },
    { id: '3', name: 'Empleado Uno', email: 'empleado1@retailtrack.com', role: 'employee', lastLogin: '14/04/2025 16:45' },
    { id: '4', name: 'Empleado Dos', email: 'empleado2@retailtrack.com', role: 'employee', lastLogin: '14/04/2025 14:20' },
    { id: '5', name: 'Gerente Dos', email: 'gerente2@retailtrack.com', role: 'manager', lastLogin: '13/04/2025 11:10' },
  ];

  // Datos de ejemplo para los roles
  const roles = [
    { id: 'admin', name: 'Administrador' },
    { id: 'manager', name: 'Gerente' },
    { id: 'employee', name: 'Empleado' },
  ];

  // Columnas para la tabla de usuarios
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Rol',
      render: (value: string) => {
        let roleClass = '';
        let roleName = '';
        
        switch (value) {
          case 'admin':
            roleClass = styles.admin;
            roleName = 'Administrador';
            break;
          case 'manager':
            roleClass = styles.manager;
            roleName = 'Gerente';
            break;
          case 'employee':
            roleClass = styles.employee;
            roleName = 'Empleado';
            break;
          default:
            roleName = value;
        }
        
        return (
          <span className={`${styles.roleChip} ${roleClass}`}>
            {roleName}
          </span>
        );
      }
    },
    { key: 'lastLogin', header: 'Último Acceso' },
  ];

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    // Validar que las contraseñas coincidan
    if (userForm.password !== userForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    console.log('Usuario a guardar:', userForm);
    // Aquí iría la lógica para guardar el usuario
    setShowForm(false);
    setUserForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    });
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Usuarios" 
      actions={
        <Button onClick={() => setShowForm(true)}>Nuevo Usuario</Button>
      }
    >
      {showForm ? (
        <Card title="Nuevo Usuario" footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </>
        }>
          <form className={styles.userForm} onSubmit={handleFormSubmit}>
            <Input 
              label="Nombre" 
              id="name" 
              name="name" 
              value={userForm.name} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Email" 
              id="email" 
              name="email" 
              type="email" 
              value={userForm.email} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Contraseña" 
              id="password" 
              name="password" 
              type="password" 
              value={userForm.password} 
              onChange={handleInputChange} 
              required 
            />
            <Input 
              label="Confirmar Contraseña" 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              value={userForm.confirmPassword} 
              onChange={handleInputChange} 
              required 
            />
            <Select
              label="Rol"
              id="role"
              name="role"
              value={userForm.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un rol</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </form>
        </Card>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Buscar usuarios..." 
                className={styles.searchInput} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card>
            <Table 
              columns={columns} 
              data={filteredUsers} 
              keyExtractor={(item) => item.id} 
              onRowClick={(item) => console.log('Usuario seleccionado:', item)}
              emptyMessage="No se encontraron usuarios"
            />
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
