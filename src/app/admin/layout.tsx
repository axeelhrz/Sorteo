'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiBarChart2, 
  FiClock, 
  FiPlay, 
  FiCheckCircle, 
  FiShoppingBag, 
  FiUsers, 
  FiFileText, 
  FiCreditCard,
  FiMenu
} from 'react-icons/fi';
import { useAuthStore } from '@/store/auth-store';
import Logo from '@/components/Logo';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verificar que el usuario es admin
  if (user?.role !== 'admin') {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.unauthorizedContent}>
          <h1>No autorizado</h1>
          <p>No tienes permiso para acceder a esta sección.</p>
          <button onClick={() => router.push('/')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <Logo size="small" showText={false} />
          <h2>Panel Admin</h2>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.navItem}>
            <FiBarChart2 className={styles.navIcon} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/raffles/pending" className={styles.navItem}>
            <FiClock className={styles.navIcon} />
            <span>Sorteos Pendientes</span>
          </Link>
          <Link href="/admin/raffles/active" className={styles.navItem}>
            <FiPlay className={styles.navIcon} />
            <span>Sorteos Activos</span>
          </Link>
          <Link href="/admin/raffles/finished" className={styles.navItem}>
            <FiCheckCircle className={styles.navIcon} />
            <span>Sorteos Finalizados</span>
          </Link>
          <Link href="/admin/shops" className={styles.navItem}>
            <FiShoppingBag className={styles.navIcon} />
            <span>Tiendas</span>
          </Link>
          <Link href="/admin/users" className={styles.navItem}>
            <FiUsers className={styles.navIcon} />
            <span>Usuarios</span>
          </Link>
          <Link href="/admin/audit" className={styles.navItem}>
            <FiFileText className={styles.navIcon} />
            <span>Auditoría</span>
          </Link>
          <Link href="/admin/payments" className={styles.navItem}>
            <FiCreditCard className={styles.navIcon} />
            <span>Transacciones</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <p>{user?.name}</p>
            <small>{user?.email}</small>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <h1>Panel de Administración</h1>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}