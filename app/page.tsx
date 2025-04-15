'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  // Esta función sería reemplazada por la lógica real de autenticación
  const handleLogin = () => {
    // Redireccionar al dashboard (simulación de login)
    router.push('/dashboard');
  };

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1>RetailTrack</h1>
        <p>Sistema de Control de Inventario y Ventas</p>
      </div>
      
      <div className={styles.buttons}>
        <Button onClick={handleLogin}>Ingresar al Sistema</Button>
      </div>
    </main>
  );
}
