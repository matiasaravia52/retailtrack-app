'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input, { Select } from '@/components/Input';
import RouteGuard from '@/components/RouteGuard/index';
import { userService, User as UserType, CreateUserData } from '@/services/userService';
import styles from './page.module.css';

function Users() {
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
    role: 'employee'
  });
  // Estado para los usuarios
  const [users, setUsers] = useState<UserType[]>([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error al cargar usuarios. Inténtelo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Datos para los roles
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
      render: (value: unknown) => {
        let roleClass = '';
        let roleName = '';
        const roleValue = typeof value === 'string' ? value : '';
        
        switch (roleValue) {
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
            roleName = roleValue;
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
  const handleSubmit = async () => {
    // Validar que las contraseñas coincidan
    if (userForm.password !== userForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      // Crear objeto con los datos del usuario
      const userData: CreateUserData = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role as 'admin' | 'manager' | 'employee'
      };
      
      // Llamar al servicio para crear el usuario
      const newUser = await userService.createUser(userData);
      
      // Actualizar la lista de usuarios
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Resetear el formulario
      setShowForm(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee'
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error creating user:', err);
        setError(err.message || 'Error al crear usuario');
      } else {
        console.error('Error creating user:', err);
        setError('Error al iniciar sesión. Verifique sus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el envío del formulario desde el evento submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Función para buscar usuarios
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Si el término de búsqueda está vacío, cargar todos los usuarios
      try {
        setLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    try {
      setLoading(true);
      const data = await userService.searchUsers(searchTerm);
      setUsers(data);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  };
  
  // Formatear fecha de último login
  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  return (
    <RouteGuard allowedRoles={['admin']}>
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
              <Input
                label="Buscar"
                id="search"
                name="search"
                placeholder="Buscar por nombre, email o rol"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleSearch} variant="secondary">Buscar</Button>
            </div>
          </div>
          
          {loading ? (
            <div className={styles.loading}>Cargando usuarios...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : users.length === 0 ? (
            <div className={styles.empty}>No se encontraron usuarios</div>
          ) : (
            <Card>
              <Table
                columns={columns}
                data={users.map(user => ({
                  ...user,
                  lastLogin: formatLastLogin(user.lastLogin)
                }))}
                keyExtractor={(item: UserType) => item.id}
                onRowClick={(item: UserType) => console.log('Usuario seleccionado:', item)}
                emptyMessage="No se encontraron usuarios"
              />
            </Card>
          )}
        </>
      )}
      </DashboardLayout>
    </RouteGuard>
  );
}

export default Users;
