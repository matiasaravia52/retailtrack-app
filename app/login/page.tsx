'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService, LoginCredentials } from '@/services/authService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function Login() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isLoggedIn()) {
      const user = authService.getCurrentUser();
      // Redirect based on user role
      if (user?.role === 'employee') {
        router.push('/sales');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router]);

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
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      // Redirect based on user role
      if (response.user.role === 'employee') {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <Image 
            src="/logo.png" 
            alt="RetailTrack Logo" 
            width={180} 
            height={60} 
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
