'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login/admin');
      return;
    }
    if (user.role !== UserRole.ADMIN) {
      router.replace('/login/admin');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== UserRole.ADMIN) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p>Redirigiendo...</p>
      </div>
    );
  }

  return <AdminDashboard />;
}