'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { roleService } from '@/services/roleService';
import DashboardLayout from '@/components/Layout';
import Card from '@/components/Card';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import Link from 'next/link';
import styles from './page.module.css';

export default function NewRolePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Acciones para el encabezado
  const headerActions = (
    <Link 
      href="/admin/roles"
      className={styles.backLink}
    >
      ← Volver a roles
    </Link>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Crear el nuevo rol
      await roleService.createRole({ name, description });
      
      // Redireccionar a la lista de roles
      router.push('/admin/roles');
    } catch (err) {
      console.error('Error creating role:', err);
      setError('Error al crear el rol. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard 
      permission="roles:manage" 
      fallback={
        <DashboardLayout title="Acceso Denegado">
          <Card>
            <div className={styles.errorMessage}>
              No tienes permiso para administrar roles. Esta función está reservada para administradores.
            </div>
          </Card>
        </DashboardLayout>
      }
    >
      <DashboardLayout title="Crear Nuevo Rol" actions={headerActions}>
        <Card>
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Nombre del Rol *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Ej: Supervisor"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Describe las responsabilidades de este rol"
                rows={3}
              />
            </div>
            
            <div className={styles.buttonContainer}>
              <button
                type="button"
                onClick={() => router.push('/admin/roles')}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Creando...' : 'Crear Rol'}
              </button>
            </div>
          </form>
        </Card>
      </DashboardLayout>
    </PermissionGuard>
  );
}
