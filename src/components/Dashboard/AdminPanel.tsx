'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiUsers, FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiPlay, FiTag, FiCreditCard, FiDollarSign, FiBarChart2, FiAlertCircle } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import styles from '@/views/admin/admin-panel.module.css';

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

type TabType = 'overview' | 'raffles' | 'shops' | 'users' | 'payments';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Resumen', icon: <FiBarChart2 /> },
  { id: 'raffles', label: 'Sorteos', icon: <FiTag /> },
  { id: 'shops', label: 'Organizadores', icon: <FiShoppingBag /> },
  { id: 'users', label: 'Usuarios', icon: <FiUsers /> },
  { id: 'payments', label: 'Pagos', icon: <FiCreditCard /> },
];

export default function AdminPanel() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
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

  const renderOverviewTab = () => (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Resumen General
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Estadísticas y métricas de la plataforma
        </p>
      </div>

      <div className={styles.overviewGrid}>
        {/* Usuarios */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiUsers style={{ fontSize: '24px', color: '#667eea' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Usuarios</h3>
          </div>
          <p className={styles.bigNumber}>{stats?.users.total || 0}</p>
          <p className={styles.subtitle}>Registrados en la plataforma</p>
        </div>

        {/* Organizadores */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiShoppingBag style={{ fontSize: '24px', color: '#667eea' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Organizadores</h3>
          </div>
          <p className={styles.bigNumber}>{stats?.shops.total || 0}</p>
          <div className={styles.statusBreakdown}>
            <span>Pendientes: <strong>{stats?.shops.pending || 0}</strong></span>
            <span>Verificados: <strong>{stats?.shops.verified || 0}</strong></span>
            <span>Bloqueados: <strong>{stats?.shops.blocked || 0}</strong></span>
          </div>
        </div>

        {/* Sorteos */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiTag style={{ fontSize: '24px', color: '#667eea' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Sorteos</h3>
          </div>
          <p className={styles.bigNumber}>{(stats?.raffles.pending || 0) + (stats?.raffles.active || 0) + (stats?.raffles.finished || 0)}</p>
          <div className={styles.statusBreakdown}>
            <span>Pendientes: <strong>{stats?.raffles.pending || 0}</strong></span>
            <span>Activos: <strong>{stats?.raffles.active || 0}</strong></span>
            <span>Finalizados: <strong>{stats?.raffles.finished || 0}</strong></span>
          </div>
        </div>

        {/* Tickets */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiTag style={{ fontSize: '24px', color: '#27ae60' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Tickets</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats?.tickets.totalSold || 0}</p>
          <p className={styles.subtitle}>Vendidos en total</p>
        </div>

        {/* Pagos */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiCreditCard style={{ fontSize: '24px', color: '#667eea' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Pagos</h3>
          </div>
          <p className={styles.bigNumber}>{stats?.payments.total || 0}</p>
          <div className={styles.statusBreakdown}>
            <span>Completados: <strong>{stats?.payments.completed || 0}</strong></span>
            <span>Pendientes: <strong>{stats?.payments.pending || 0}</strong></span>
            <span>Fallidos: <strong>{stats?.payments.failed || 0}</strong></span>
          </div>
        </div>

        {/* Ingresos */}
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiDollarSign style={{ fontSize: '24px', color: '#27ae60' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Ingresos</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#27ae60' }}>
            S/. {(stats?.payments.totalRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={styles.subtitle}>Ingresos totales de la plataforma</p>
        </div>
      </div>
    </>
  );

  const renderRafflesTab = () => (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Gestión de Sorteos
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Revisa, aprueba y gestiona todos los sorteos de la plataforma
        </p>
      </div>

      <div className={styles.overviewGrid}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiClock style={{ fontSize: '24px', color: '#FFA500' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Pendientes</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#FFA500' }}>{stats?.raffles.pending || 0}</p>
          <p className={styles.subtitle}>Esperando aprobación</p>
          <a href="/admin/raffles/pending" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiPlay style={{ fontSize: '24px', color: '#27ae60' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Activos</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats?.raffles.active || 0}</p>
          <p className={styles.subtitle}>En curso</p>
          <a href="/admin/raffles/active" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiCheckCircle style={{ fontSize: '24px', color: '#667eea' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Finalizados</h3>
          </div>
          <p className={styles.bigNumber}>{stats?.raffles.finished || 0}</p>
          <p className={styles.subtitle}>Completados</p>
          <a href="/admin/raffles/finished" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>
      </div>
    </>
  );

  const renderShopsTab = () => (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Gestión de Organizadores
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Verifica, gestiona y supervisa a todos los organizadores de la plataforma
        </p>
      </div>

      <div className={styles.overviewGrid}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiClock style={{ fontSize: '24px', color: '#FFA500' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Pendientes</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#FFA500' }}>{stats?.shops.pending || 0}</p>
          <p className={styles.subtitle}>Esperando verificación</p>
          <a href="/admin/shops" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiCheckCircle style={{ fontSize: '24px', color: '#27ae60' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Verificados</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats?.shops.verified || 0}</p>
          <p className={styles.subtitle}>Activos</p>
          <a href="/admin/shops" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiXCircle style={{ fontSize: '24px', color: '#e74c3c' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Bloqueados</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#e74c3c' }}>{stats?.shops.blocked || 0}</p>
          <p className={styles.subtitle}>Suspendidos</p>
          <a href="/admin/shops" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>
      </div>
    </>
  );

  const renderUsersTab = () => (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Gestión de Usuarios
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Supervisa y gestiona las cuentas de usuarios registrados en la plataforma
        </p>
      </div>

      <div className={styles.overviewGrid}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiUsers style={{ fontSize: '24px', color: '#667eea' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Total</h3>
          </div>
          <p className={styles.bigNumber}>{stats?.users.total || 0}</p>
          <p className={styles.subtitle}>Usuarios registrados</p>
          <a href="/admin/users" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>
      </div>
    </>
  );

  const renderPaymentsTab = () => (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Gestión de Pagos
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Revisa, valida y gestiona todas las transacciones de la plataforma
        </p>
      </div>

      <div className={styles.overviewGrid}>
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiCheckCircle style={{ fontSize: '24px', color: '#27ae60' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Completados</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#27ae60' }}>{stats?.payments.completed || 0}</p>
          <p className={styles.subtitle}>Aprobados</p>
          <a href="/admin/payments" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiClock style={{ fontSize: '24px', color: '#FFA500' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Pendientes</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#FFA500' }}>{stats?.payments.pending || 0}</p>
          <p className={styles.subtitle}>Esperando validación</p>
          <a href="/admin/payments" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiXCircle style={{ fontSize: '24px', color: '#e74c3c' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Fallidos</h3>
          </div>
          <p className={styles.bigNumber} style={{ color: '#e74c3c' }}>{stats?.payments.failed || 0}</p>
          <p className={styles.subtitle}>Rechazados</p>
          <a href="/admin/payments" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600', fontSize: '13px', marginTop: '12px', display: 'inline-block' }}>
            Ver detalles →
          </a>
        </div>
      </div>

      <div style={{ marginTop: '32px', padding: '24px', background: 'linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%)', borderRadius: '12px', borderLeft: '4px solid #667eea' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <FiDollarSign style={{ fontSize: '24px', color: '#27ae60' }} />
          <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '16px' }}>Ingresos Totales</span>
        </div>
        <div style={{ fontSize: '36px', fontWeight: '700', color: '#27ae60' }}>
          S/. {(stats?.payments.totalRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '13px' }}>Ingresos acumulados de la plataforma</p>
      </div>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'raffles':
        return renderRafflesTab();
      case 'shops':
        return renderShopsTab();
      case 'users':
        return renderUsersTab();
      case 'payments':
        return renderPaymentsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
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
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Cargando estadísticas...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            <FiAlertCircle style={{ display: 'inline-block', marginRight: '8px' }} />
            {error}
          </div>
        )}

        {!loading && !error && renderTabContent()}
      </div>
    </div>
  );
}