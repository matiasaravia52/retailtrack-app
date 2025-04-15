'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import styles from './Navbar.module.css';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

// Definir los enlaces permitidos según el rol
const roleNavLinks: Record<UserRole, Array<{ name: string; path: string }>> = {
  admin: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Productos', path: '/products' },
    { name: 'Categorías', path: '/categories' },
    { name: 'Inventario', path: '/inventory' },
    { name: 'Ventas', path: '/sales' },
    { name: 'Usuarios', path: '/users' },
  ],
  manager: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Productos', path: '/products' },
    { name: 'Categorías', path: '/categories' },
    { name: 'Inventario', path: '/inventory' },
    { name: 'Ventas', path: '/sales' },
  ],
  employee: [
    { name: 'Productos', path: '/products' },
    { name: 'Ventas', path: '/sales' },
  ],
};

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Determinar los enlaces de navegación según el rol del usuario
  const navLinks = user ? roleNavLinks[user.role] : [];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Manejar el cierre de sesión
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/dashboard" className={styles.logo}>
        RetailTrack
      </Link>

      <div className={styles.navLinks}>
        {navLinks.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`${styles.navLink} ${
              pathname === link.path ? styles.active : ''
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className={styles.userSection}>
        {user && <span className={styles.userName}>{user.name}</span>}
        <button className={styles.logoutButton} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <button
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-label="Menú móvil"
      >
        ☰
      </button>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`${styles.navLink} ${
                pathname === link.path ? styles.active : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Sección de usuario en el menú móvil */}
          {(userName || onLogout) && (
            <div className={styles.userSection}>
              {userName && <span className={styles.userName}>{userName}</span>}
              {onLogout && (
                <button className={styles.logoutButton} onClick={onLogout}>
                  Cerrar sesión
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
