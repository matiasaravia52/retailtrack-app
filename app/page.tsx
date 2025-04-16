'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Si está cargando, no hacer nada todavía
    if (loading) return;
    
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Si está autenticado, redirigir según el rol
    if (user) {
      if (user.role === 'employee') {
        router.push('/sales');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, loading, router]);

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1>RetailTrack</h1>
        <p>Sistema de Control de Inventario y Ventas</p>
        <div className={styles.loading}>Redirigiendo...</div>
      </div>
    </main>
  );
}
