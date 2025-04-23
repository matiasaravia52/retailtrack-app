'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Navbar.module.css';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

// Definir los enlaces disponibles
const allNavLinks = [
  { name: 'Dashboard', path: '/dashboard', requiredPermission: 'dashboard:view' },
  { name: 'Productos', path: '/products', requiredPermission: 'products:view' },
  { name: 'Categorías', path: '/categories', requiredPermission: 'categories:view' },
  { name: 'Inventario', path: '/inventory', requiredPermission: 'inventory:view' },
  { name: 'Ventas', path: '/sales', requiredPermission: 'sales:view' },
  { name: 'Usuarios', path: '/users', requiredPermission: 'users:view' },
  { name: 'Roles y Permisos', path: '/admin/roles', requiredPermission: 'roles:manage' },
];

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  // Determinar los enlaces de navegación según los permisos del usuario
  const [navLinks, setNavLinks] = useState<Array<{ name: string; path: string }>>([]);
  
  // Cargar los enlaces de navegación basados en los permisos del usuario
  React.useEffect(() => {
    const loadNavLinks = async () => {
      if (!user) {
        setNavLinks([]);
        return;
      }
      
      // Si el usuario tiene roles, filtrar los enlaces según sus permisos
      const availableLinks = [];
      
      for (const link of allNavLinks) {
        // Si el usuario tiene el permiso requerido para este enlace, añadirlo
        if (await hasPermission(link.requiredPermission)) {
          availableLinks.push({
            name: link.name,
            path: link.path
          });
        }
      }
      
      setNavLinks(availableLinks);
    };
    
    loadNavLinks();
  }, [user, hasPermission]);

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
