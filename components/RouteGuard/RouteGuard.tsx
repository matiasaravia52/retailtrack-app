'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';

// Mapeo de rutas a permisos requeridos
const routePermissions: Record<string, string> = {
  '/dashboard': 'dashboard:view',
  '/products': 'products:view',
  '/categories': 'categories:view',
  '/inventory': 'inventory:view',
  '/sales': 'sales:view',
  '/users': 'users:view',
  '/admin/roles': 'roles:manage',
  '/customers': 'customers:view',
  '/suppliers': 'suppliers:view',
  '/purchases': 'purchases:view',
};

// Páginas públicas que no requieren autenticación
const publicPages = ['/', '/login'];

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, hasRole, hasPermission } = useAuth();
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
    const checkPathPermission = async () => {
      if (user && !(await hasPathPermission(user, pathname))) {
        // Si no tiene permiso para esta ruta, redirigir al dashboard o a una ruta por defecto
        if (await hasPermission('dashboard:view')) {
          if (pathname !== '/dashboard') {
            router.push('/dashboard');
          }
        } else if (await hasPermission('sales:view')) {
          if (pathname !== '/sales') {
            router.push('/sales');
          }
        } else {
          // Si no tiene permisos para ninguna ruta principal, redirigir a la página de inicio
          if (pathname !== '/') {
            router.push('/');
          }
        }
      }
    };
    
    checkPathPermission();
  }, [isAuthenticated, pathname, router, user, allowedRoles, hasRole]);

  // Función para verificar si el usuario tiene permiso para acceder a la ruta
  const hasPathPermission = async (user: User, path: string): Promise<boolean> => {
    // Si la ruta no requiere un permiso específico, permitir acceso
    if (!routePermissions[path]) {
      return true;
    }
    
    // Verificar si el usuario tiene el permiso requerido para esta ruta
    const requiredPermission = routePermissions[path];
    return await hasPermission(requiredPermission);
  };

  return <>{children}</>;
};

export default RouteGuard;
