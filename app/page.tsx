'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { Select } from '@/components/Input';
import { useAuth, UserRole } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // Opciones de roles para el selector
  const roleOptions = [
    { id: 'admin', name: 'Administrador' },
    { id: 'manager', name: 'Gerente' },
    { id: 'employee', name: 'Empleado' },
  ];

  // Función para manejar el cambio de rol
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as UserRole);
  };

  // Función para iniciar sesión con el rol seleccionado
  const handleLogin = () => {
    login(selectedRole);
    
    // Redireccionar según el rol
    if (selectedRole === 'admin' || selectedRole === 'manager') {
      router.push('/dashboard');
    } else {
      router.push('/sales');
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1>RetailTrack</h1>
        <p>Sistema de Control de Inventario y Ventas</p>
      </div>
      
      <div className={styles.loginForm}>
        <h2>Seleccione su tipo de usuario</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="role">Rol:</label>
          <Select
            id="role"
            name="role"
            value={selectedRole}
            onChange={handleRoleChange}
            options={roleOptions}
          />
        </div>
        
        <div className={styles.buttons}>
          <Button onClick={handleLogin}>Ingresar al Sistema</Button>
        </div>
      </div>
    </main>
  );
}
