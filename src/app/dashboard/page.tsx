'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Redirigir según el rol del usuario
    if (user.role === UserRole.ADMIN) {
      router.push('/dashboard/admin');
    } else if (user.role === UserRole.USER) {
      router.push('/dashboard/user');
    } else if (user.role === UserRole.SHOP) {
      router.push('/dashboard/store');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p>Redirigiendo...</p>
    </div>
  );
}