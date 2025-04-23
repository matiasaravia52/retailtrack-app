// Definición de tipos para roles y permisos

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  lastLogin: string | null;
  roles: Role[];
  permissions?: Permission[]; // Permisos calculados basados en roles
}

// Tipo para la respuesta de autenticación
export interface AuthResponse {
  token: string;
  user: User;
}

// Credenciales de inicio de sesión
export interface LoginCredentials {
  email: string;
  password: string;
}
