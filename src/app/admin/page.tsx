'use client';

import React, { useEffect, useState } from 'react';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiPlay, 
  FiTag, 
  FiCreditCard, 
  FiDollarSign 
} from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import styles from './admin.module.css';

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
        setError(err.response?.data?.message || 'Error al cargar estadísticas');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '28px', fontWeight: '700' }}>
          Resumen General
        </h2>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Estadísticas y métricas de la plataforma
        </p>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Usuarios */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FiUsers className={styles.statIcon} />
            <h3>Usuarios Registrados</h3>
          </div>
          <div className={styles.value}>{stats.users.total}</div>
        </div>

        {/* Tiendas */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FiShoppingBag className={styles.statIcon} />
            <h3>Tiendas Totales</h3>
          </div>
          <div className={styles.value}>{stats.shops.total}</div>
        </div>

        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statHeader}>
            <FiClock className={styles.statIcon} />
            <h3>Tiendas Pendientes</h3>
          </div>
          <div className={styles.value}>{stats.shops.pending}</div>
        </div>

        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statHeader}>
            <FiCheckCircle className={styles.statIcon} />
            <h3>Tiendas Verificadas</h3>
          </div>
          <div className={styles.value}>{stats.shops.verified}</div>
        </div>

        <div className={`${styles.statCard} ${styles.danger}`}>
          <div className={styles.statHeader}>
            <FiXCircle className={styles.statIcon} />
            <h3>Tiendas Bloqueadas</h3>
          </div>
          <div className={styles.value}>{stats.shops.blocked}</div>
        </div>

        {/* Sorteos */}
        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statHeader}>
            <FiClock className={styles.statIcon} />
            <h3>Sorteos Pendientes</h3>
          </div>
          <div className={styles.value}>{stats.raffles.pending}</div>
        </div>

        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statHeader}>
            <FiPlay className={styles.statIcon} />
            <h3>Sorteos Activos</h3>
          </div>
          <div className={styles.value}>{stats.raffles.active}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FiCheckCircle className={styles.statIcon} />
            <h3>Sorteos Finalizados</h3>
          </div>
          <div className={styles.value}>{stats.raffles.finished}</div>
        </div>

        <div className={`${styles.statCard} ${styles.danger}`}>
          <div className={styles.statHeader}>
            <FiXCircle className={styles.statIcon} />
            <h3>Sorteos Rechazados</h3>
          </div>
          <div className={styles.value}>{stats.raffles.rejected}</div>
        </div>

        <div className={`${styles.statCard} ${styles.danger}`}>
          <div className={styles.statHeader}>
            <FiXCircle className={styles.statIcon} />
            <h3>Sorteos Cancelados</h3>
          </div>
          <div className={styles.value}>{stats.raffles.cancelled}</div>
        </div>

        {/* Tickets */}
        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statHeader}>
            <FiTag className={styles.statIcon} />
            <h3>Tickets Vendidos</h3>
          </div>
          <div className={styles.value}>{stats.tickets.totalSold}</div>
        </div>

        {/* Payments */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <FiCreditCard className={styles.statIcon} />
            <h3>Total de Pagos</h3>
          </div>
          <div className={styles.value}>{stats.payments.total}</div>
        </div>

        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statHeader}>
            <FiCheckCircle className={styles.statIcon} />
            <h3>Pagos Completados</h3>
          </div>
          <div className={styles.value}>{stats.payments.completed}</div>
        </div>

        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statHeader}>
            <FiClock className={styles.statIcon} />
            <h3>Pagos Pendientes</h3>
          </div>
          <div className={styles.value}>{stats.payments.pending}</div>
        </div>

        <div className={`${styles.statCard} ${styles.danger}`}>
          <div className={styles.statHeader}>
            <FiXCircle className={styles.statIcon} />
            <h3>Pagos Fallidos</h3>
          </div>
          <div className={styles.value}>{stats.payments.failed}</div>
        </div>

        <div className={`${styles.statCard} ${styles.success}`} style={{ gridColumn: 'span 2' }}>
          <div className={styles.statHeader}>
            <FiDollarSign className={styles.statIcon} />
            <h3>Ingresos Totales</h3>
          </div>
          <div className={styles.value} style={{ fontSize: '32px', color: '#27ae60' }}>
            S/. {stats.payments.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '40px', 
        padding: '28px', 
        background: 'white', 
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        borderLeft: '4px solid #667eea'
      }}>
        <h3 style={{ color: '#333', marginTop: 0, fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
          Acciones Rápidas
        </h3>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
          Accede a las diferentes secciones del panel desde el menú lateral para:
        </p>
        <ul style={{ color: '#666', lineHeight: '2', fontSize: '14px', paddingLeft: '20px' }}>
          <li>Revisar y aprobar/rechazar sorteos pendientes de aprobación</li>
          <li>Monitorear sorteos activos y su progreso</li>
          <li>Verificar sorteos finalizados y ganadores</li>
          <li>Gestionar el estado de las tiendas</li>
          <li>Ver información de usuarios registrados</li>
          <li>Consultar el registro de auditoría de acciones administrativas</li>
        </ul>
      </div>
    </div>
  );
}