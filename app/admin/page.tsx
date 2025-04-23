'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';

export default function AdminPage() {
  const { user } = useAuth();

  const adminModules = [
    {
      title: 'Roles y Permisos',
      description: 'Administra los roles y asigna permisos a cada rol',
      path: '/admin/roles',
      permission: 'manage_roles',
      icon: '🔐'
    },
    {
      title: 'Usuarios',
      description: 'Gestiona los usuarios del sistema',
      path: '/users',
      permission: 'users:view',
      icon: '👥'
    },
    // Puedes agregar más módulos administrativos aquí
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
          
          {user && (
            <div className="mb-6">
              <p className="text-gray-600">
                Bienvenido, <span className="font-semibold">{user.name}</span>. 
                Desde aquí puedes acceder a todas las funciones administrativas de RetailTrack.
              </p>
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {adminModules.map((module) => (
              <PermissionGuard 
                key={module.path} 
                permission={module.permission}
                fallback={null}
              >
                <Link 
                  href={module.path}
                  className="block border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">{module.icon}</span>
                    <h2 className="text-xl font-semibold">{module.title}</h2>
                  </div>
                  <p className="text-gray-600">{module.description}</p>
                  <div className="mt-4 text-right">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      Acceder →
                    </span>
                  </div>
                </Link>
              </PermissionGuard>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <Link 
              href="/dashboard" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
