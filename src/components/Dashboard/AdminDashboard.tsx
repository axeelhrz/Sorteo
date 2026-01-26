'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiLogOut, FiUsers, FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiPlay, FiTag, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import Logo from '@/components/Logo';
import styles from '@/app/dashboard/dashboard.module.css';

interface DashboardStats {
  users: { total: number };
  shops: { total: number; pending: number; verified: number; blocked: number };
  raffles: {
    pending: number;
    active: number;
    finished: number;
    cancelled: number;
    rejected: number;
  };
  tickets: { totalSold: number };
  payments: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    totalRevenue: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar estadísticas');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
            <h1>Panel de Administración</h1>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <span>{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
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
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Cargando estadísticas...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
            <p>Error: {error}</p>
          </div>
        )}

        {stats && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '24px', fontWeight: '700' }}>
                Resumen General
              </h2>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                Estadísticas y métricas de la plataforma
              </p>
            </div>

            <div className={styles.overviewGrid}>
              {/* Usuarios */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiUsers style={{ fontSize: '24px', color: '#667eea' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Usuarios Registrados</h3>
                </div>
                <p className={styles.bigNumber}>{stats.users.total}</p>
                <p className={styles.subtitle}>Total de usuarios</p>
              </div>

              {/* Organizadores */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiShoppingBag style={{ fontSize: '24px', color: '#667eea' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Organizadores Totales</h3>
                </div>
                <p className={styles.bigNumber}>{stats.shops.total}</p>
                <p className={styles.subtitle}>Total de organizadores</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #FFA500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiClock style={{ fontSize: '24px', color: '#FFA500' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Organizadores Pendientes</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#FFA500' }}>{stats.shops.pending}</p>
                <p className={styles.subtitle}>Esperando verificación</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #27ae60' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiCheckCircle style={{ fontSize: '24px', color: '#27ae60' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Organizadores Verificados</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats.shops.verified}</p>
                <p className={styles.subtitle}>Verificados y activos</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #e74c3c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiXCircle style={{ fontSize: '24px', color: '#e74c3c' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Organizadores Bloqueados</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#e74c3c' }}>{stats.shops.blocked}</p>
                <p className={styles.subtitle}>Bloqueados</p>
              </div>

              {/* Sorteos */}
              <div className={styles.card} style={{ borderLeft: '4px solid #FFA500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiClock style={{ fontSize: '24px', color: '#FFA500' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Sorteos Pendientes</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#FFA500' }}>{stats.raffles.pending}</p>
                <p className={styles.subtitle}>Esperando aprobación</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #27ae60' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiPlay style={{ fontSize: '24px', color: '#27ae60' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Sorteos Activos</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats.raffles.active}</p>
                <p className={styles.subtitle}>En curso</p>
              </div>

              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiCheckCircle style={{ fontSize: '24px', color: '#667eea' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Sorteos Finalizados</h3>
                </div>
                <p className={styles.bigNumber}>{stats.raffles.finished}</p>
                <p className={styles.subtitle}>Completados</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #e74c3c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiXCircle style={{ fontSize: '24px', color: '#e74c3c' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Sorteos Rechazados</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#e74c3c' }}>{stats.raffles.rejected}</p>
                <p className={styles.subtitle}>Rechazados</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #e74c3c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiXCircle style={{ fontSize: '24px', color: '#e74c3c' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Sorteos Cancelados</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#e74c3c' }}>{stats.raffles.cancelled}</p>
                <p className={styles.subtitle}>Cancelados</p>
              </div>

              {/* Tickets */}
              <div className={styles.card} style={{ borderLeft: '4px solid #27ae60' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiTag style={{ fontSize: '24px', color: '#27ae60' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Tickets Vendidos</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats.tickets.totalSold}</p>
                <p className={styles.subtitle}>Total vendidos</p>
              </div>

              {/* Payments */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiCreditCard style={{ fontSize: '24px', color: '#667eea' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Total de Pagos</h3>
                </div>
                <p className={styles.bigNumber}>{stats.payments.total}</p>
                <p className={styles.subtitle}>Transacciones</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #27ae60' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiCheckCircle style={{ fontSize: '24px', color: '#27ae60' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Pagos Completados</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats.payments.completed}</p>
                <p className={styles.subtitle}>Aprobados</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #FFA500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiClock style={{ fontSize: '24px', color: '#FFA500' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Pagos Pendientes</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#FFA500' }}>{stats.payments.pending}</p>
                <p className={styles.subtitle}>Esperando validación</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #e74c3c' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiXCircle style={{ fontSize: '24px', color: '#e74c3c' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Pagos Fallidos</h3>
                </div>
                <p className={styles.bigNumber} style={{ color: '#e74c3c' }}>{stats.payments.failed}</p>
                <p className={styles.subtitle}>Rechazados</p>
              </div>

              <div className={styles.card} style={{ borderLeft: '4px solid #27ae60', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <FiDollarSign style={{ fontSize: '24px', color: '#27ae60' }} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Ingresos Totales</h3>
                </div>
                <p className={styles.bigNumber} style={{ fontSize: '32px', color: '#27ae60' }}>
                  S/. {stats.payments.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={styles.subtitle}>Ingresos de la plataforma</p>
              </div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Link href="/admin">
                <button className={styles.createBtn}>
                  Ir al Panel de Administración Completo
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}