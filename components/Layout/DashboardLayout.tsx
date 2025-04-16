'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../Navbar';
import { useAuth } from '@/contexts/AuthContext';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  actions,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Manejar el cierre de sesión
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Si no hay usuario autenticado, no renderizar el layout
  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Navbar onLogout={handleLogout} />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
