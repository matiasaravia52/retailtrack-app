'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '@/services/authService';

export default function ForceRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refreshPermissions = async () => {
      try {
        // Limpiar caché de permisos
        localStorage.removeItem('permissions');
        
        // Forzar recarga de permisos desde el servidor
        await authService.getUserPermissions();
        
        // Redirigir al dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error al actualizar permisos:', error);
        // Si hay error, redirigir al login
        router.push('/login');
      }
    };

    refreshPermissions();
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>Actualizando permisos...</h1>
      <p>Por favor espere...</p>
    </div>
  );
}
