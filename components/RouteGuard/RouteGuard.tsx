'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';

// Definir los permisos de acceso según el rol
const rolePermissions: Record<UserRole, string[]> = {
  admin: ['/dashboard', '/products', '/categories', '/inventory', '/sales', '/users'],
  manager: ['/dashboard', '/products', '/categories', '/inventory', '/sales'],
  employee: ['/products', '/sales'],
};

// Páginas públicas que no requieren autenticación
const publicPages = ['/', '/login'];

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'manager' | 'employee')[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar si la página es pública
    if (publicPages.includes(pathname)) {
      return;
    }

    // Si no está autenticado, redirigir a la página de login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si hay roles permitidos especificados y el usuario no tiene uno de esos roles, redirigir
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirigir según el rol del usuario
      if (user.role === 'employee') {
        router.push('/sales');
      } else {
        router.push('/dashboard');
      }
      return;
    }
    
    // Si está autenticado, verificar si tiene permiso para acceder a la página
    if (user && !hasPermission(user.role, pathname)) {
      // Redirigir a la primera página permitida según su rol
      const allowedPages = rolePermissions[user.role];
      if (allowedPages && allowedPages.length > 0) {
        router.push(allowedPages[0]);
      } else {
        // Si no tiene permisos, redirigir a la página de inicio
        router.push('/');
      }
    }
  }, [isAuthenticated, pathname, router, user, allowedRoles]);

  // Función para verificar si el rol tiene permiso para acceder a la ruta
  const hasPermission = (role: UserRole, path: string): boolean => {
    const allowedPaths = rolePermissions[role] || [];
    return allowedPaths.includes(path);
  };

  return <>{children}</>;
};

export default RouteGuard;
