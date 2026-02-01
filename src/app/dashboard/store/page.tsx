'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import StoreDashboard from '@/components/Dashboard/StoreDashboard';
import styles from '../dashboard.module.css';

export default function StoreDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // First effect: Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Second effect: Check authentication and authorization after hydration
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Solo organizadores pueden solicitar creación de sorteos; usuarios y admin son redirigidos
    if (user.role !== UserRole.ORGANIZER) {
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [isHydrated, isAuthenticated, user, router]);

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // Show loading state while checking authorization
  if (!isAuthorized) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Verificando permisos...</p>
      </div>
    );
  }

  return <StoreDashboard />;
}