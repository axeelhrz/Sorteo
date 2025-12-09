'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiLogOut } from 'react-icons/fi';
import Logo from '@/components/Logo';
import styles from '@/app/dashboard/dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Logo size="small" showText={false} />
            <h1>Dashboard Admin</h1>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <span>A</span>
              </div>
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.email}>{user?.email}</p>
                <span className={styles.role}>Administrador</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut className={styles.logoutIcon} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.overviewGrid}>
          <div className={styles.card}>
            <h3>Sorteos Pendientes</h3>
            <p className={styles.bigNumber}>0</p>
            <p className={styles.subtitle}>Esperando aprobación</p>
          </div>

          <div className={styles.card}>
            <h3>Sorteos Activos</h3>
            <p className={styles.bigNumber}>0</p>
            <p className={styles.subtitle}>Sorteos en curso</p>
          </div>

          <div className={styles.card}>
            <h3>Sorteos Finalizados</h3>
            <p className={styles.bigNumber}>0</p>
            <p className={styles.subtitle}>Sorteos completados</p>
          </div>

          <div className={styles.card}>
            <h3>Total Sorteos</h3>
            <p className={styles.bigNumber}>0</p>
            <p className={styles.subtitle}>Todos los sorteos</p>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link href="/admin">
            <button className={styles.createBtn}>
              Ir al Panel de Administración Completo
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}