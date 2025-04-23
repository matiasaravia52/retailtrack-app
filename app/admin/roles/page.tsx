'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { roleService } from '@/services/roleService';
import { Role } from '@/types/auth';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import DashboardLayout from '@/components/Layout';
import Card from '@/components/Card';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Link from 'next/link';
import styles from './page.module.css';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await roleService.getRoles();
        setRoles(rolesData);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('No se pudieron cargar los roles. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleRoleClick = (roleId: string) => {
    router.push(`/admin/roles/${roleId}`);
  };

  // Acciones para el encabezado
  const headerActions = (
    <Link href="/admin/roles/new">
      <Button variant="primary">
        Crear Nuevo Rol
      </Button>
    </Link>
  );

  // Componente interno que renderiza la lista de roles
  const RolesContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Cargando roles...</div>;
    }

    if (error) {
      return (
        <Card>
          <div className={styles.errorMessage}>
            {error}
          </div>
        </Card>
      );
    }

    // Definición de columnas para la tabla de roles
    const columns = [
      { key: 'name', header: 'Nombre' },
      { key: 'description', header: 'Descripción' },
      { 
        key: 'actions', 
        header: 'Acciones',
        render: (_: unknown, item: Role) => (
          <button 
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              handleRoleClick(item.id.toString());
            }}
          >
            Administrar permisos
          </button>
        ) 
      },
    ];

    return (
      <Card>
        <p className={styles.pageDescription}>
          Selecciona un rol para administrar sus permisos o crear uno nuevo.
        </p>
          
        <Table
          columns={columns}
          data={roles}
          keyExtractor={(role) => role.id.toString()}
          emptyMessage="No hay roles disponibles. Crea uno nuevo para comenzar."
          onRowClick={(role) => handleRoleClick(role.id.toString())}
        />
      </Card>
    );
  };

  return (
    <PermissionGuard 
      permission="roles:manage" 
      fallback={
        <DashboardLayout title="Acceso Denegado">
          <Card>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              No tienes permiso para administrar roles. Esta función está reservada para administradores.
            </div>
          </Card>
        </DashboardLayout>
      }
    >
      <DashboardLayout title="Roles y Permisos" actions={headerActions}>
        <RolesContent />
      </DashboardLayout>
    </PermissionGuard>
  );
}
