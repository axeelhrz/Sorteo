'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { raffleService } from '@/services/raffle-service';
import styles from '@/app/panel/panel.module.css';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

interface RafflesListProps {
  shopId: string;
}

export function RafflesList({ shopId }: RafflesListProps) {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<RaffleStatus | 'all'>('all');

  useEffect(() => {
    loadRaffles();
  }, [shopId]);

  const loadRaffles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await raffleService.getRafflesByShop(shopId);
      setRaffles(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los sorteos');
    } finally {
      setLoading(false);
    }
  };

  const filteredRaffles =
    filterStatus === 'all' ? raffles : raffles.filter((r) => r.status === filterStatus);

  const handleCancel = async (raffleId: string) => {
    if (confirm('¿Estás seguro de que deseas cancelar este sorteo?')) {
      try {
        await raffleService.cancelRaffle(raffleId);
        setRaffles(raffles.map((r) => (r.id === raffleId ? { ...r, status: RaffleStatus.CANCELLED } : r)));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error al cancelar el sorteo');
      }
    }
  };

  if (loading) {
    return <div className={styles.alert}>Cargando sorteos...</div>;
  }

  if (error) {
    return (
      <div className={styles.alert + ' ' + styles.alertError}>
        {error}
        <button onClick={loadRaffles} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
          Reintentar
        </button>
      </div>
    );
  }

  if (raffles.length === 0) {
    return (
      <EmptyState
        title="No tienes sorteos aún"
        description="Crea tu primer sorteo para comenzar a vender tickets"
        icon="🎲"
        action={{
          label: 'Crear sorteo',
          onClick: () => (window.location.href = '/panel/sorteos/crear'),
        }}
      />
    );
  }

  return (
    <div>
      <div className={styles.raffleDetailSection}>
        <label className={styles.raffleDetailSectionTitle}>Filtrar por estado</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as RaffleStatus | 'all')}
          className={styles.formSelect}
          style={{ maxWidth: '300px' }}
        >
          <option value="all">Todos los estados</option>
          <option value={RaffleStatus.DRAFT}>Borrador</option>
          <option value={RaffleStatus.PENDING_APPROVAL}>Pendiente de aprobación</option>
          <option value={RaffleStatus.ACTIVE}>Activo</option>
          <option value={RaffleStatus.SOLD_OUT}>Agotado</option>
          <option value={RaffleStatus.FINISHED}>Finalizado</option>
          <option value={RaffleStatus.CANCELLED}>Cancelado</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={styles.tableHeaderCell}>Producto</th>
            <th className={styles.tableHeaderCell}>Estado</th>
            <th className={styles.tableHeaderCell}>Tickets</th>
            <th className={styles.tableHeaderCell}>Creado</th>
            <th className={styles.tableHeaderCell}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredRaffles.map((raffle) => (
            <tr key={raffle.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{raffle.product?.name || 'Producto desconocido'}</td>
              <td className={styles.tableCell}>
                <StatusBadge status={raffle.status} />
              </td>
              <td className={styles.tableCell}>
                {raffle.soldTickets} / {raffle.totalTickets}
              </td>
              <td className={styles.tableCell}>{new Date(raffle.createdAt).toLocaleDateString()}</td>
              <td className={styles.tableCell}>
                <div className={styles.cardActions}>
                  <Link href={`/panel/sorteos/${raffle.id}`} className={styles.cardActionPrimary}>
                    Ver
                  </Link>
                  {(raffle.status === RaffleStatus.DRAFT || raffle.status === RaffleStatus.PENDING_APPROVAL) && (
                    <button
                      onClick={() => handleCancel(raffle.id)}
                      className={styles.cardActionSecondary}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}