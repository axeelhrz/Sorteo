'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { Shop } from '@/types/shop';
import { shopService } from '@/services/shop-service';
import { apiClient } from '@/lib/api-client';
import { ShopHeader } from '@/components/ShopPanel/ShopHeader';
import { ShopSidebar } from '@/components/ShopPanel/ShopSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/app/panel/panel.module.css';

interface Deposit {
  id: string;
  shopId: string;
  raffleId: string;
  amount: number;
  status: 'pending' | 'held' | 'released' | 'executed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  raffle?: {
    id: string;
    product?: {
      name: string;
      value: number;
    };
  };
}

interface DepositStats {
  totalDeposits: number;
  totalAmount: number;
  byStatus: {
    pending: number;
    held: number;
    released: number;
    executed: number;
  };
  amountByStatus: {
    pending: number;
    held: number;
    released: number;
    executed: number;
  };
}

export default function DepositsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [stats, setStats] = useState<DepositStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadShop();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (shop) {
      fetchData();
    }
  }, [shop, filterStatus]);

  const loadShop = async () => {
    try {
      const shopData = await shopService.getMyShop();
      setShop(shopData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la tienda');
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch deposits
      let depositsResponse;
      if (filterStatus === 'all') {
        depositsResponse = await apiClient.get('/deposits');
      } else {
        depositsResponse = await apiClient.get(`/deposits/by-status/${filterStatus}`);
      }
      setDeposits(depositsResponse.data || []);

      // Fetch statistics
      const statsResponse = await apiClient.get('/deposits/stats/overview');
      setStats(statsResponse.data);

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar depósitos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#FFA500',
      held: '#F44336',
      released: '#4CAF50',
      executed: '#2196F3',
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      held: 'Retenido',
      released: 'Liberado',
      executed: 'Ejecutado',
    };
    return labels[status] || status;
  };

  return (
    <ProtectedRoute requiredRole={UserRole.SHOP}>
      <div className={styles.panelContainer}>
        <ShopSidebar isBlocked={shop?.status === 'blocked'} />
        <main className={styles.mainContent}>
          {loading && <div className={styles.alert}>Cargando...</div>}
          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error}
              <button onClick={fetchData} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
                Reintentar
              </button>
            </div>
          )}
          {shop && (
            <>
              <ShopHeader shop={shop} />
              <div className={styles.raffleDetail}>
                <h1 className={styles.raffleDetailTitle}>Gestión de Depósitos de Garantía</h1>
                <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                  Visualiza y gestiona todos tus depósitos de garantía
                </p>

                {/* Statistics Cards */}
                {stats && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className={styles.statCard}>
                      <div className={styles.statCardIcon}>📊</div>
                      <div className={styles.statCardValue}>{stats.totalDeposits}</div>
                      <div className={styles.statCardLabel}>Total de Depósitos</div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statCardIcon}>💰</div>
                      <div className={styles.statCardValue}>S/. {stats.totalAmount.toFixed(2)}</div>
                      <div className={styles.statCardLabel}>Monto Total</div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statCardIcon}>⏳</div>
                      <div className={styles.statCardValue}>{stats.byStatus.pending}</div>
                      <div className={styles.statCardLabel}>Pendientes</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                        S/. {stats.amountByStatus.pending.toFixed(2)}
                      </div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statCardIcon}>🔒</div>
                      <div className={styles.statCardValue}>{stats.byStatus.held}</div>
                      <div className={styles.statCardLabel}>Retenidos</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                        S/. {stats.amountByStatus.held.toFixed(2)}
                      </div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statCardIcon}>✅</div>
                      <div className={styles.statCardValue}>{stats.byStatus.released}</div>
                      <div className={styles.statCardLabel}>Liberados</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                        S/. {stats.amountByStatus.released.toFixed(2)}
                      </div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statCardIcon}>✓</div>
                      <div className={styles.statCardValue}>{stats.byStatus.executed}</div>
                      <div className={styles.statCardLabel}>Ejecutados</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                        S/. {stats.amountByStatus.executed.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter */}
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="statusFilter" className={styles.formLabel} style={{ marginRight: '10px' }}>
                    Filtrar por estado:
                  </label>
                  <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={styles.formSelect}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="held">Retenido</option>
                    <option value="released">Liberado</option>
                    <option value="executed">Ejecutado</option>
                  </select>
                </div>

                {/* Deposits Table */}
                <div>
                  <h2 style={{ marginBottom: '15px', fontSize: '18px', color: '#2c3e50' }}>Historial de Depósitos</h2>
                  {deposits.length === 0 ? (
                    <div className={styles.alert} style={{ textAlign: 'center' }}>
                      No hay depósitos registrados
                    </div>
                  ) : (
                    <table className={styles.table}>
                      <thead className={styles.tableHeader}>
                        <tr>
                          <th className={styles.tableHeaderCell}>ID Depósito</th>
                          <th className={styles.tableHeaderCell}>Producto</th>
                          <th className={styles.tableHeaderCell}>Monto</th>
                          <th className={styles.tableHeaderCell}>Estado</th>
                          <th className={styles.tableHeaderCell}>Fecha Creación</th>
                          <th className={styles.tableHeaderCell}>Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deposits.map((deposit) => (
                          <tr key={deposit.id} className={styles.tableRow}>
                            <td className={styles.tableCell}>
                              <strong>{deposit.id.substring(0, 8)}...</strong>
                            </td>
                            <td className={styles.tableCell}>
                              {deposit.raffle?.product?.name || 'N/A'}
                            </td>
                            <td className={styles.tableCell}>
                              <strong>S/. {Number(deposit.amount).toFixed(2)}</strong>
                            </td>
                            <td className={styles.tableCell}>
                              <span
                                className={styles.statusBadge}
                                style={{ backgroundColor: getStatusColor(deposit.status) }}
                              >
                                {getStatusLabel(deposit.status)}
                              </span>
                            </td>
                            <td className={styles.tableCell}>
                              {new Date(deposit.createdAt).toLocaleDateString('es-ES')}
                            </td>
                            <td className={styles.tableCell} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {deposit.notes ? deposit.notes.substring(0, 50) + '...' : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}



