'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { roleService } from '@/services/roleService';
import { Role } from '@/types/auth';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import RolePermissionsForm from '@/components/RolePermissions/RolePermissionsForm';
import DashboardLayout from '@/components/Layout';
import Card from '@/components/Card';
import Link from 'next/link';
import styles from './page.module.css';

export default function RoleDetailsPage() {
  const params = useParams();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roleId = params?.id as string;
  
  // Acciones para el encabezado
  const headerActions = (
    <Link 
      href="/admin/roles"
      className={styles.backLink}
    >
      ← Volver a roles
    </Link>
  );

  useEffect(() => {
    const loadRole = async () => {
      if (!roleId) return;
      
      try {
        setLoading(true);
        const data = await roleService.getRoleById(roleId);
        setRole(data);
      } catch (err) {
        setError('Error al cargar los detalles del rol');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [roleId]);

  // Componente interno que renderiza los detalles del rol
  const RoleDetailsContent = () => {
    if (loading) {
      return <div className={styles.loadingMessage}>Cargando detalles del rol...</div>;
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

    if (!role) {
      return (
        <Card>
          <div className={styles.warningMessage}>
            No se encontró el rol solicitado.
          </div>
        </Card>
      );
    }

    return (
      <div className={styles.container}>
        <Card>
          <div className={styles.roleInfoContainer}>
            <div className={styles.roleHeader}>
              <h2 className={styles.roleTitle}>{role.name}</h2>
              {role.description && (
                <p className={styles.roleDescription}>{role.description}</p>
              )}
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoLabel}>ID:</div>
              <div className={styles.infoValue}>
                <span className={styles.infoId}>{role.id}</span>
              </div>
              <div className={styles.infoLabel}>Nombre:</div>
              <div className={styles.infoValue}>{role.name}</div>
              {role.description && (
                <>
                  <div className={styles.infoLabel}>Descripción:</div>
                  <div className={styles.infoValue}>{role.description}</div>
                </>
              )}
            </div>
          </div>
        </Card>
        
        {/* Formulario para asignar permisos al rol */}
        <RolePermissionsForm roleId={roleId} />
      </div>
    );
  };

  // Renderizar el componente con protección de permisos
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
      <DashboardLayout title={role ? `Rol: ${role.name}` : 'Detalles del Rol'} actions={headerActions}>
        <RoleDetailsContent />
      </DashboardLayout>
    </PermissionGuard>
  );
}
