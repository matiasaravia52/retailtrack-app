'use client';

import React, { useState, useEffect } from 'react';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';
import { Permission } from '@/types/auth';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import Table from '@/components/Table';
import styles from './RolePermissionsForm.module.css';

interface RolePermissionsFormProps {
  roleId: string;
}

interface RoleDetails {
  id: string | number;
  name: string;
  description?: string;
}

export const RolePermissionsForm: React.FC<RolePermissionsFormProps> = ({ roleId }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [roleDetails, setRoleDetails] = useState<RoleDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar permisos disponibles, permisos actuales del rol y detalles del rol
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar detalles del rol
        const role = await roleService.getRoleById(roleId);
        setRoleDetails(role);
        
        // Cargar todos los permisos disponibles
        const allPermissions = await permissionService.getPermissions();
        setPermissions(allPermissions);

        // Cargar permisos actuales del rol
        const rolePermissions = await roleService.getRolePermissions(roleId);
        // Convertir los IDs de string a number para evitar errores de tipo
        setSelectedPermissions(rolePermissions.map(p => typeof p.id === 'string' ? parseInt(p.id, 10) : p.id));
      } catch (err) {
        setError('Error al cargar los datos del rol y permisos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roleId]);

  // Manejar cambios en la selección de permisos
  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Guardar los permisos asignados
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await roleService.assignPermissionsToRole(roleId, selectedPermissions);
      setSuccess('Permisos asignados correctamente');
      setError(null);
    } catch (err) {
      setError('Error al asignar permisos');
      setSuccess(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Componente interno que renderiza el formulario
  const PermissionsFormContent = () => {
    if (loading) return <div className={styles.loadingMessage}>Cargando...</div>;

    // Definición de columnas para la tabla de permisos
    const columns = [
      { 
        key: 'selected', 
        header: 'Seleccionar',
        render: (_: unknown, permission: Permission) => {
          const permId = typeof permission.id === 'string' ? parseInt(permission.id, 10) : permission.id;
          return (
            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id={`permission-${permission.id}`}
                checked={selectedPermissions.includes(permId)}
                onChange={() => handlePermissionChange(permId)}
                className={styles.tableCheckbox}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          );
        }
      },
      { key: 'name', header: 'Nombre' },
      { key: 'description', header: 'Descripción' },
    ];

    return (
      <div className={styles.formWrapper}>
        <div className={styles.roleHeader}>
          <h2 className={styles.formTitle}>
            {roleDetails?.name || 'Rol'}
          </h2>
          {roleDetails?.description && (
            <p className={styles.roleDescription}>{roleDetails.description}</p>
          )}
          <div className={styles.roleInfo}>
            <span className={styles.roleId}>ID: {roleId}</span>
          </div>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionTitle}>Permisos disponibles</h3>
            <p className={styles.sectionDescription}>Selecciona los permisos que deseas asignar a este rol. Los usuarios con este rol tendrán acceso a las funcionalidades correspondientes.</p>
            
            {permissions.length === 0 ? (
              <div className={styles.noPermissionsMessage}>No hay permisos disponibles</div>
            ) : (
              <div className={styles.tableContainer}>
                <Table
                  columns={columns}
                  data={permissions}
                  keyExtractor={(permission) => permission.id.toString()}
                  emptyMessage="No hay permisos disponibles"
                />
              </div>
            )}
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Guardando cambios...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Renderizar el componente con protección de permisos
  return (
    <PermissionGuard 
      permission="roles:manage" 
      fallback={
        <div className={styles.errorMessage}>
          No tienes permiso para administrar los permisos de roles. Esta función está reservada para administradores.
        </div>
      }
    >
      <PermissionsFormContent />
    </PermissionGuard>
  );
};

export default RolePermissionsForm;
