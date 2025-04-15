'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Definimos los tipos de roles disponibles
export type UserRole = 'admin' | 'manager' | 'employee';

// Interfaz para el usuario
export interface User {
  name: string;
  role: UserRole;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Crear el contexto con un valor inicial
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Intentar recuperar el usuario del localStorage al iniciar
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = (role: UserRole) => {
    // Crear un usuario según el rol seleccionado
    const newUser = {
      name: getRoleName(role),
      role,
    };
    
    // Guardar en estado y localStorage
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // Función auxiliar para obtener el nombre según el rol
  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'employee':
        return 'Empleado';
      default:
        return 'Usuario';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
