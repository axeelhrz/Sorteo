'use client';

import { useEffect, useState } from 'react';
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
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check auth after hydration
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push('/');
      return;
    }
  }, [isHydrated, isAuthenticated, user, requiredRole, router]);

  // Don't render anything until hydrated to prevent mismatch
  if (!isHydrated) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No tienes permiso para acceder a esta página</div>;
  }

  return <>{children}</>;
}