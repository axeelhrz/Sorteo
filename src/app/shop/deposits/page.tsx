'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import styles from './deposits.module.css';

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
  const router = useRouter();
  const {token, isHydrated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [stats, setStats] = useState<DepositStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!isHydrated) return;

    if (!token) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isHydrated, token, filterStatus]);

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

  if (!isHydrated || loading) {
    return (
      <div className={styles.container}>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión de Depósitos de Garantía</h1>
        <p className={styles.subtitle}>
          Visualiza y gestiona todos tus depósitos de garantía
        </p>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Statistics Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total de Depósitos</h3>
            <p className={styles.bigNumber}>{stats.totalDeposits}</p>
            <p className={styles.subtitle}>Depósitos registrados</p>
          </div>

          <div className={styles.statCard}>
            <h3>Monto Total</h3>
            <p className={styles.bigNumber}>${stats.totalAmount.toLocaleString()}</p>
            <p className={styles.subtitle}>Valor total en depósitos</p>
          </div>

          <div className={styles.statCard}>
            <h3>Pendientes</h3>
            <p className={styles.bigNumber}>{stats.byStatus.pending}</p>
            <p className={styles.subtitle}>
              ${stats.amountByStatus.pending.toLocaleString()}
            </p>
          </div>

          <div className={styles.statCard}>
            <h3>Retenidos</h3>
            <p className={styles.bigNumber}>{stats.byStatus.held}</p>
            <p className={styles.subtitle}>
              ${stats.amountByStatus.held.toLocaleString()}
            </p>
          </div>

          <div className={styles.statCard}>
            <h3>Liberados</h3>
            <p className={styles.bigNumber}>{stats.byStatus.released}</p>
            <p className={styles.subtitle}>
              ${stats.amountByStatus.released.toLocaleString()}
            </p>
          </div>

          <div className={styles.statCard}>
            <h3>Ejecutados</h3>
            <p className={styles.bigNumber}>{stats.byStatus.executed}</p>
            <p className={styles.subtitle}>
              ${stats.amountByStatus.executed.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className={styles.filterSection}>
        <label htmlFor="statusFilter">Filtrar por estado:</label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.select}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendiente</option>
          <option value="held">Retenido</option>
          <option value="released">Liberado</option>
          <option value="executed">Ejecutado</option>
        </select>
      </div>

      {/* Deposits Table */}
      <div className={styles.tableContainer}>
        <h2>Historial de Depósitos</h2>
        {deposits.length === 0 ? (
          <p className={styles.emptyMessage}>No hay depósitos registrados</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Depósito</th>
                <th>Producto</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit.id}>
                  <td>
                    <strong>{deposit.id.substring(0, 8)}...</strong>
                  </td>
                  <td>
                    {deposit.raffle?.product?.name || 'N/A'}
                  </td>
                  <td>
                    <strong>${Number(deposit.amount).toLocaleString()}</strong>
                  </td>
                  <td>
                    <span
                      className={styles.badge}
                      style={{ backgroundColor: getStatusColor(deposit.status) }}
                    >
                      {getStatusLabel(deposit.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </td>
                  <td className={styles.notes}>
                    {deposit.notes ? deposit.notes.substring(0, 50) + '...' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}