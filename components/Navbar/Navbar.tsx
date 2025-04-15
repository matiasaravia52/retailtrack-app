'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Productos', path: '/products' },
    { name: 'Categorías', path: '/categories' },
    { name: 'Inventario', path: '/inventory' },
    { name: 'Ventas', path: '/sales' },
    { name: 'Usuarios', path: '/users' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
        {userName && <span className={styles.userName}>{userName}</span>}
        {onLogout && (
          <button className={styles.logoutButton} onClick={onLogout}>
            Cerrar sesión
          </button>
        )}
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
