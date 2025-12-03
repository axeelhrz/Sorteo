'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated || !user) {
    return <div>Cargando...</div>;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div>No tienes permiso para acceder a esta página</div>;
  }

  return <>{children}</>;
}