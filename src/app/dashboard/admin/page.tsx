'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '../dashboard.module.css';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}