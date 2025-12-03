'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import UserPanelSidebar from './UserPanelSidebar';
import UserPanelHeader from './UserPanelHeader';
import styles from './user-panel-layout.module.css';

interface UserPanelLayoutProps {
  children: ReactNode;
  activeSection?: string;
}

export default function UserPanelLayout({ children, activeSection }: UserPanelLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Solo usuarios normales pueden acceder al panel de usuario
    if (user.role !== UserRole.USER) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== UserRole.USER) {
    return <div className={styles.loading}>Redirigiendo...</div>;
  }

  return (
    <div className={styles.container}>
      <UserPanelSidebar activeSection={activeSection} />
      <div className={styles.mainContent}>
        <UserPanelHeader />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}