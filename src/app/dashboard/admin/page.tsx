'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSessionStore } from '@/store/admin-session-store';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { adminUser, isLoading, isChecked, checkSession } = useAdminSessionStore();

  useEffect(() => {
    let mounted = true;
    checkSession().then((ok) => {
      if (mounted && !ok) router.replace('/login/admin');
    });
    return () => { mounted = false; };
  }, [checkSession, router]);

  useEffect(() => {
    if (isChecked && !isLoading && !adminUser) {
      router.replace('/login/admin');
    }
  }, [isChecked, isLoading, adminUser, router]);

  if (!isChecked || isLoading || !adminUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p>Redirigiendo...</p>
      </div>
    );
  }

  return <AdminDashboard />;
}