'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiLogOut } from 'react-icons/fi';
import Logo from '@/components/Logo';
import styles from '@/app/dashboard/dashboard.module.css';

export default function StoreDashboard() {
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
            <h1>Dashboard Tienda</h1>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <span>{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.email}>{user?.email}</p>
                <span className={styles.role}>Tienda</span>
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
            <h3>Productos</h3>
            <p className={styles.bigNumber}>0</p>
            <p className={styles.subtitle}>Total de productos</p>
          </div>

          <div className={styles.card}>
            <h3>Sorteos</h3>
            <p className={styles.bigNumber}>0</p>
            <p className={styles.subtitle}>Total de sorteos</p>
          </div>

          <div className={styles.card}>
            <h3>Tickets Vendidos</h3>
            <p className={styles.bigNumber}>0</p>
            <p className={styles.subtitle}>Tickets en total</p>
          </div>

          <div className={styles.card}>
            <h3>Ingresos</h3>
            <p className={styles.bigNumber}>S/. 0</p>
            <p className={styles.subtitle}>Ingresos totales</p>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link href="/panel">
            <button className={styles.createBtn}>
              Ir al Panel de Tienda Completo
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}