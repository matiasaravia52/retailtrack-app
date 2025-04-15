'use client';

import React, { ReactNode } from 'react';
import Navbar from '../Navbar';
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
  // Esta función sería implementada cuando tengamos la autenticación
  const handleLogout = () => {
    console.log('Logout clicked');
    // Aquí iría la lógica de cierre de sesión
  };

  return (
    <div className={styles.container}>
      <Navbar userName="Usuario" onLogout={handleLogout} />
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
