# RetailTrack API Integration

Este documento describe cómo se integran los endpoints de la API de RetailTrack en la aplicación frontend.

## Endpoints de Usuarios

Todos los endpoints de usuarios están implementados en el servicio `userService.ts` y se utilizan en la página de usuarios.

### Estructura del servicio de usuarios

```typescript
// Importación del servicio
import { userService, User, CreateUserData, UpdateUserData } from '@/services/userService';
```

### Endpoints disponibles

1. **Obtener todos los usuarios**
   ```typescript
   const users = await userService.getUsers();
   ```

2. **Obtener usuario por ID**
   ```typescript
   const user = await userService.getUserById(id);
   ```

3. **Crear usuario**
   ```typescript
   const userData: CreateUserData = {
     name: 'Nombre Usuario',
     email: 'usuario@example.com',
     password: 'contraseña',
     role: 'employee' // 'admin' | 'manager' | 'employee'
   };
   const newUser = await userService.createUser(userData);
   ```

4. **Actualizar usuario**
   ```typescript
   const updateData: UpdateUserData = {
     name: 'Nuevo Nombre',
     email: 'nuevo@example.com',
     // Solo incluir los campos que se quieren actualizar
   };
   const updatedUser = await userService.updateUser(id, updateData);
   ```

5. **Eliminar usuario**
   ```typescript
   const result = await userService.deleteUser(id);
   ```

6. **Buscar usuarios**
   ```typescript
   const searchResults = await userService.searchUsers('término de búsqueda');
   ```

7. **Actualizar último login**
   ```typescript
   const result = await userService.updateLastLogin(id);
   ```

## Implementación en la página de usuarios

La página de usuarios (`app/users/page.tsx`) implementa las siguientes funcionalidades:

1. **Listar usuarios**: Carga todos los usuarios al montar el componente
2. **Buscar usuarios**: Permite buscar usuarios por nombre, email o rol
3. **Crear usuario**: Formulario para crear un nuevo usuario
4. **Eliminar usuario**: Permite eliminar un usuario existente

### Ejemplo de uso en un componente

```typescript
import React, { useState, useEffect } from 'react';
import { userService, User } from '@/services/userService';

function UserComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Resto del componente...
}
```

## Configuración de la API

El servicio de usuarios está configurado para utilizar la URL de la API definida en la variable de entorno `NEXT_PUBLIC_API_URL`. Si esta variable no está definida, se utilizará la URL de la API desplegada en Railway:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://retailtrack-api-production.up.railway.app';
```

Para cambiar la URL de la API en desarrollo, puedes crear un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Manejo de errores

Todos los métodos del servicio de usuarios incluyen manejo de errores. En caso de error, se lanza una excepción que debe ser capturada en el componente que utiliza el servicio.

```typescript
try {
  const users = await userService.getUsers();
  // Procesar usuarios
} catch (error) {
  console.error('Error:', error);
  // Mostrar mensaje de error al usuario
}
```
