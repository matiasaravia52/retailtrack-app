'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';

// Definir los permisos de acceso según el rol
const rolePermissions: Record<string, string[]> = {
  admin: ['/dashboard', '/products', '/categories', '/inventory', '/sales', '/users'],
  manager: ['/dashboard', '/products', '/categories', '/inventory', '/sales'],
  employee: ['/products', '/sales'],
};

// Páginas públicas que no requieren autenticación
const publicPages = ['/', '/login'];

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Evitar ejecuciones innecesarias si no tenemos la información del usuario aún
    if (user === undefined || user === null) {
      return;
    }

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
    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some(role => hasRole(role));
      if (!hasAllowedRole) {
        // Evitar redirecciones cíclicas - solo redirigir si no estamos ya en una página permitida
        // Determinar la página predeterminada basada en el primer rol del usuario
        const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'employee';
        const userDefaultPage = userRole === 'employee' ? '/sales' : '/dashboard';
        
        if (pathname !== userDefaultPage) {
          router.push(userDefaultPage);
        }
        return;
      }
    }
    
    // Si está autenticado, verificar si tiene permiso para acceder a la página
    if (user && !hasPathPermission(user, pathname)) {
      // Determinar el rol principal del usuario
      const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'employee';
      // Redirigir a la primera página permitida según su rol
      const allowedPages = rolePermissions[userRole];
      
      if (allowedPages && allowedPages.length > 0) {
        // Evitar redirecciones cíclicas - solo redirigir si no estamos ya en la página destino
        if (pathname !== allowedPages[0]) {
          router.push(allowedPages[0]);
        }
      } else {
        // Si no tiene permisos, redirigir a la página de inicio
        if (pathname !== '/') {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, pathname, router, user, allowedRoles, hasRole]);

  // Función para verificar si el usuario tiene permiso para acceder a la ruta
  const hasPathPermission = (user: User, path: string): boolean => {
    // Si el usuario tiene roles, verificar si alguno de ellos tiene permiso
    if (user.roles && user.roles.length > 0) {
      return user.roles.some((role: { name: string }) => {
        const allowedPaths = rolePermissions[role.name] || [];
        return allowedPaths.includes(path);
      });
    }
    return false;
  };

  return <>{children}</>;
};

export default RouteGuard;
