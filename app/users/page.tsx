'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Input, { Select } from '@/components/Input';
import RouteGuard from '@/components/RouteGuard/index';
import PermissionGuard from '@/components/PermissionGuard';
import { userService, User as UserType, CreateUserData } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { Role } from '@/types/auth';
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
    roleId: ''
  });
  
  // Estado para los roles disponibles
  const [roles, setRoles] = useState<Role[]>([]);
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

  // Cargar roles disponibles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getRoles();
        setRoles(data);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Error al cargar roles');
      }
    };

    fetchRoles();
  }, []);

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Está seguro que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      await userService.deleteUser(userId);
      
      // Actualizar la lista de usuarios eliminando el usuario borrado
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setError(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Error al eliminar el usuario');
    } finally {
      setLoading(false);
    }
  };

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
    { 
      key: 'actions', 
      header: 'Acciones',
      render: (_: unknown, item: UserType) => (
        <div className={styles.actions}>
          <PermissionGuard permission="users:delete">
            <button 
              className={styles.deleteButton} 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteUser(item.id);
              }}
              aria-label="Eliminar usuario"
            >
              Eliminar
            </button>
          </PermissionGuard>
        </div>
      )
    },
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
    
    // Validar que se haya seleccionado un rol
    if (!userForm.roleId) {
      alert('Debe seleccionar un rol para el usuario');
      return;
    }
    
    try {
      setLoading(true);
      // Crear objeto con los datos del usuario
      const userData: CreateUserData = {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password
      };
      
      // Llamar al servicio para crear el usuario
      const newUser = await userService.createUser(userData);
      
      // Asignar el rol seleccionado al usuario
      await roleService.assignRoleToUser(newUser.id, userForm.roleId);
      
      // Recargar la lista de usuarios para obtener los datos actualizados
      const updatedUsers = await userService.getUsers();
      setUsers(updatedUsers);
      
      // Resetear el formulario
      setShowForm(false);
      setUserForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: ''
      });
      
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error creating user:', err);
        setError(err.message || 'Error al crear usuario');
      } else {
        console.error('Error creating user:', err);
        setError('Error al crear usuario. Inténtelo de nuevo.');
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
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <DashboardLayout 
        title="Usuarios" 
        actions={
          <PermissionGuard permission="users:create">
            <Button onClick={() => setShowForm(true)}>Nuevo Usuario</Button>
          </PermissionGuard>
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
              id="roleId"
              name="roleId"
              value={userForm.roleId}
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
