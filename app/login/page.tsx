'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoginCredentials } from '@/services/authService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import styles from './page.module.css';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { user, isAuthenticated, loading, login } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  // Check if user is already logged in
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && user) {
      if (user.role === 'employee') {
        router.push('/sales');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router, isAuthenticated, user, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!credentials.email || !credentials.password) {
      setError('Por favor ingrese email y contraseña');
      return;
    }
    
    try {
      setError(null);
      await login(credentials);
      // Redirect based on user role
      if (user?.role === 'employee') {
        router.push('/sales');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Login error:', err);
        setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
      } else {
        console.error('Login error:', err);
        setError('Error al iniciar sesión. Verifique sus credenciales.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <Image 
            src="/images/retailtrack-icon.png" 
            alt="RetailTrack Logo" 
            width={150} 
            height={150} 
            priority
          />
        </div>
        
        <h1 className={styles.title}>Iniciar Sesión</h1>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleInputChange}
            required
          />
          
          <Input
            label="Contraseña"
            id="password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
          
          <Button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        <div className={styles.footer}>
          <p>RetailTrack &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
