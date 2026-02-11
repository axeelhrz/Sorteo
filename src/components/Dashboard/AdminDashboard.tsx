'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  FiLogOut,
  FiUsers,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPlay,
  FiTag,
  FiCreditCard,
  FiDollarSign,
  FiBarChart2,
  FiList,
} from 'react-icons/fi';
import { adminService, type AdminDashboardStats } from '@/services/admin-service';
import dynamic from 'next/dynamic';
import styles from './AdminDashboard.module.css';

// Cargar vistas de admin de forma dinámica para no cargar todo al inicio
const PendingRafflesPage = dynamic(() => import('@/views/admin/raffles/pending/page'), { ssr: false });
const ActiveRafflesPage = dynamic(() => import('@/views/admin/raffles/active/page'), { ssr: false });
const FinishedRafflesPage = dynamic(() => import('@/views/admin/raffles/finished/page'), { ssr: false });
const AdminPaymentsPage = dynamic(() => import('@/views/admin/payments/page'), { ssr: false });
const AdminPaymentsToOrganizersPage = dynamic(() => import('@/views/admin/payments-to-organizers/page'), { ssr: false });
const AdminHistoryPage = dynamic(() => import('@/views/admin/history/page'), { ssr: false });
const AdminUsersPage = dynamic(() => import('@/views/admin/users/page'), { ssr: false });
const AdminShopsPage = dynamic(() => import('@/views/admin/shops/page'), { ssr: false });

type AdminTab = 'resumen' | 'sorteos-pendientes' | 'sorteos-activos' | 'sorteos-finalizados' | 'tickets' | 'pagos' | 'historial' | 'usuarios' | 'organizadores';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'resumen', label: 'Resumen', icon: <FiBarChart2 /> },
  { id: 'sorteos-pendientes', label: 'Sorteos Pendientes', icon: <FiClock /> },
  { id: 'sorteos-activos', label: 'Sorteos Activos', icon: <FiPlay /> },
  { id: 'sorteos-finalizados', label: 'Sorteos Finalizados', icon: <FiCheckCircle /> },
  { id: 'tickets', label: 'Tickets', icon: <FiCreditCard /> },
  { id: 'pagos', label: 'Pagos', icon: <FiDollarSign /> },
  { id: 'historial', label: 'Historial', icon: <FiList /> },
  { id: 'usuarios', label: 'Usuarios', icon: <FiUsers /> },
  { id: 'organizadores', label: 'Organizadores', icon: <FiShoppingBag /> },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
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
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      router.push('/');
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Header - misma estructura que Store */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTag}>Panel de Control</span>
            <h1 className={styles.title}>Panel de Administración</h1>
            <p className={styles.subtitle}>Estadísticas y gestión de la plataforma</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name || 'Administrador'}</span>
                <span className={styles.userRole}>Administrador</span>
              </div>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Tabs - control de todo desde aquí */}
        <div className={styles.tabsContainer}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido según tab activo */}
        <div className={styles.tabContent}>
          {activeTab === 'resumen' && (
            <>
              {loading && (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <p>Cargando estadísticas...</p>
                </div>
              )}

              {error && (
                <div className={styles.section} style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <p style={{ margin: 0, color: '#dc2626', fontWeight: 600 }}>{error}</p>
                </div>
              )}

              {stats && !loading && (
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Usuarios</div>
                        <div className={styles.statValue}>{stats.users.total}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        <FiUsers />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>Total registrados</span></div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Organizadores</div>
                        <div className={styles.statValue}>{stats.shops.total}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <FiShoppingBag />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>Total · {stats.shops.pending} pendientes</span></div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Pendientes aprobación</div>
                        <div className={styles.statValue}>{stats.raffles.pending}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}>
                        <FiClock />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>Sorteos por aprobar</span></div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Sorteos activos</div>
                        <div className={styles.statValue}>{stats.raffles.active}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <FiPlay />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>En curso</span></div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Finalizados</div>
                        <div className={styles.statValue}>{stats.raffles.finished}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                        <FiCheckCircle />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>Completados</span></div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Rechazados / Cancelados</div>
                        <div className={styles.statValue}>{stats.raffles.rejected + stats.raffles.cancelled}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <FiXCircle />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>Rechazados y cancelados</span></div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Tickets vendidos</div>
                        <div className={styles.statValue}>{stats.tickets.totalSold}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                        <FiTag />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>Total vendidos</span></div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                      <div>
                        <div className={styles.statLabel}>Pagos</div>
                        <div className={styles.statValue}>{stats.payments.total}</div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <FiCreditCard />
                      </div>
                    </div>
                    <div className={styles.statChange}><span>{stats.payments.pending} pendientes · {stats.payments.completed} completados</span></div>
                  </div>
                  <div className={styles.statCard} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.statHeader} style={{ flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '20px 32px', flex: 1 }}>
                        <div>
                          <div className={styles.statLabel}>Ingresos totales</div>
                          <div className={styles.statValue} style={{ fontSize: '36px' }}>
                            S/. {stats.payments.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div>
                          <div className={styles.statLabel}>Pago Organizadores</div>
                          <div className={styles.statValue} style={{ fontSize: '36px' }}>
                            S/. {(stats.payments.paymentToOrganizers ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div>
                          <div className={styles.statLabel}>Ingreso de la Plataforma</div>
                          <div className={styles.statValue} style={{ fontSize: '36px' }}>
                            S/. {(stats.payments.platformIncome ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                      <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', width: 56, height: 56, fontSize: 28 }}>
                        <FiDollarSign />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'sorteos-pendientes' && <PendingRafflesPage />}
          {activeTab === 'sorteos-activos' && <ActiveRafflesPage />}
          {activeTab === 'sorteos-finalizados' && <FinishedRafflesPage />}
          {activeTab === 'tickets' && <AdminPaymentsPage />}
          {activeTab === 'pagos' && <AdminPaymentsToOrganizersPage />}
          {activeTab === 'historial' && <AdminHistoryPage />}
          {activeTab === 'usuarios' && <AdminUsersPage />}
          {activeTab === 'organizadores' && <AdminShopsPage />}
        </div>
      </main>
    </div>
  );
}
