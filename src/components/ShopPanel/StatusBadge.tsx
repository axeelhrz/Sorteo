'use client';

import { ShopStatus } from '@/types/shop';
import { RaffleStatus } from '@/types/raffle';
import styles from '@/app/panel/panel.module.css';

interface StatusBadgeProps {
  status: ShopStatus | RaffleStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_approval':
        return '#FFA500';
      case 'verified':
      case 'active':
        return '#4CAF50';
      case 'blocked':
      case 'rejected':
      case 'cancelled':
        return '#F44336';
      case 'draft':
        return '#9E9E9E';
      case 'sold_out':
        return '#2196F3';
      case 'finished':
        return '#673AB7';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      pending_approval: 'Pendiente de aprobación',
      verified: 'Verificada',
      blocked: 'Bloqueada',
      active: 'Activo',
      draft: 'Borrador',
      sold_out: 'Agotado',
      finished: 'Finalizado',
      cancelled: 'Cancelado',
      rejected: 'Rechazado',
    };
    return labels[status] || status;
  };

  return (
    <span
      className={styles.statusBadge}
      style={{ backgroundColor: getStatusColor(status) }}
    >
      {getStatusLabel(status)}
    </span>
  );
}