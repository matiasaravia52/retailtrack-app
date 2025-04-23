'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // Si se requieren todos los permisos o al menos uno
}

/**
 * Componente que controla la visibilidad de elementos UI basado en permisos
 * 
 * @param permission - Nombre del permiso o array de permisos requeridos
 * @param children - Elementos a mostrar si el usuario tiene el permiso
 * @param fallback - Elementos a mostrar si el usuario no tiene el permiso (opcional)
 * @param requireAll - Si se requieren todos los permisos (true) o al menos uno (false, por defecto)
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = null,
  requireAll = false
}) => {
  const { hasPermission } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);
        
        // Verificar si es un solo permiso o múltiples
        if (typeof permission === 'string') {
          const result = await hasPermission(permission);
          setHasAccess(result);
        } else if (Array.isArray(permission)) {
          if (requireAll) {
            // Debe tener todos los permisos
            const results = await Promise.all(
              permission.map((perm: string) => hasPermission(perm))
            );
            setHasAccess(results.every((result: boolean) => result === true));
          } else {
            // Debe tener al menos un permiso
            const results = await Promise.all(
              permission.map((perm: string) => hasPermission(perm))
            );
            setHasAccess(results.some((result: boolean) => result === true));
          }
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [permission, hasPermission, requireAll]);

  // Mientras se verifica el permiso, no mostrar nada
  if (loading) {
    return null;
  }

  // Si tiene acceso, mostrar los children, sino mostrar el fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
