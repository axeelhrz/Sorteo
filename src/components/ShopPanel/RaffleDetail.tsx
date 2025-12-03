'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { raffleService } from '@/services/raffle-service';
import styles from '@/app/panel/panel.module.css';
import { StatusBadge } from './StatusBadge';

interface RaffleDetailProps {
  raffleId: string;
}

export function RaffleDetail({ raffleId }: RaffleDetailProps) {
  const router = useRouter();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRaffle();
  }, [raffleId]);

  const loadRaffle = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await raffleService.getRaffleById(raffleId);
      setRaffle(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el sorteo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!raffle) return;
    setActionLoading(true);
    try {
      const updated = await raffleService.submitForApproval(raffle.id);
      setRaffle(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al enviar para aprobación');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!raffle) return;
    if (confirm('¿Estás seguro de que deseas cancelar este sorteo?')) {
      setActionLoading(true);
      try {
        const updated = await raffleService.cancelRaffle(raffle.id);
        setRaffle(updated);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error al cancelar el sorteo');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return <div className={styles.alert}>Cargando sorteo...</div>;
  }

  if (error) {
    return (
      <div className={styles.alert + ' ' + styles.alertError}>
        {error}
        <button onClick={loadRaffle} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!raffle) {
    return <div className={styles.alert + ' ' + styles.alertError}>Sorteo no encontrado</div>;
  }

  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;

  return (
    <div className={styles.raffleDetail}>
      <div className={styles.raffleDetailHeader}>
        <div>
          <h1 className={styles.raffleDetailTitle}>{raffle.product?.name || 'Sorteo'}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>ID: {raffle.id}</p>
        </div>
        <StatusBadge status={raffle.status} />
      </div>

      <div className={styles.raffleDetailSection}>
        <div className={styles.raffleDetailSectionTitle}>Información del producto</div>
        <div className={styles.raffleDetailGrid}>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Nombre</div>
            <div className={styles.raffleDetailItemValue}>{raffle.product?.name}</div>
          </div>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Valor</div>
            <div className={styles.raffleDetailItemValue}>S/. {Number(raffle.productValue).toFixed(2)}</div>
          </div>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Altura</div>
            <div className={styles.raffleDetailItemValue}>{Number(raffle.product?.height).toFixed(1)} cm</div>
          </div>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Ancho</div>
            <div className={styles.raffleDetailItemValue}>{Number(raffle.product?.width).toFixed(1)} cm</div>
          </div>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Profundidad</div>
            <div className={styles.raffleDetailItemValue}>{Number(raffle.product?.depth).toFixed(1)} cm</div>
          </div>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Requiere depósito</div>
            <div className={styles.raffleDetailItemValue}>{raffle.requiresDeposit ? 'Sí' : 'No'}</div>
          </div>
        </div>
      </div>

      <div className={styles.raffleDetailSection}>
        <div className={styles.raffleDetailSectionTitle}>Progreso de tickets</div>
        <div className={styles.ticketProgress}>
          <div className={styles.ticketProgressLabel}>
            <span>
              {raffle.soldTickets} / {raffle.totalTickets} tickets vendidos
            </span>
            <span className={styles.ticketProgressPercentage}>{Math.round(progressPercentage)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.raffleDetailSection}>
        <div className={styles.raffleDetailSectionTitle}>Información del sorteo</div>
        <div className={styles.raffleDetailGrid}>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Estado</div>
            <div className={styles.raffleDetailItemValue}>
              <StatusBadge status={raffle.status} />
            </div>
          </div>
          <div className={styles.raffleDetailItem}>
            <div className={styles.raffleDetailItemLabel}>Creado</div>
            <div className={styles.raffleDetailItemValue}>
              {new Date(raffle.createdAt).toLocaleDateString()}
            </div>
          </div>
          {raffle.activatedAt && (
            <div className={styles.raffleDetailItem}>
              <div className={styles.raffleDetailItemLabel}>Activado</div>
              <div className={styles.raffleDetailItemValue}>
                {new Date(raffle.activatedAt).toLocaleDateString()}
              </div>
            </div>
          )}
          {raffle.raffleExecutedAt && (
            <div className={styles.raffleDetailItem}>
              <div className={styles.raffleDetailItemLabel}>Finalizado</div>
              <div className={styles.raffleDetailItemValue}>
                {new Date(raffle.raffleExecutedAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {raffle.specialConditions && (
        <div className={styles.raffleDetailSection}>
          <div className={styles.raffleDetailSectionTitle}>Condiciones especiales</div>
          <p>{raffle.specialConditions}</p>
        </div>
      )}

      {raffle.status === RaffleStatus.FINISHED && raffle.winnerTicketId && (
        <div className={styles.raffleDetailSection}>
          <div className={styles.alert + ' ' + styles.alertSuccess}>
            ✓ Sorteo finalizado. Ticket ganador: {raffle.winnerTicketId}
          </div>
        </div>
      )}

      <div className={styles.buttonGroup}>
        {raffle.status === RaffleStatus.DRAFT && (
          <button
            onClick={handleSubmitForApproval}
            className={styles.primaryButton}
            disabled={actionLoading}
          >
            {actionLoading ? 'Enviando...' : 'Enviar para aprobación'}
          </button>
        )}

        {(raffle.status === RaffleStatus.DRAFT || raffle.status === RaffleStatus.PENDING_APPROVAL) && (
          <button
            onClick={handleCancel}
            className={styles.dangerButton}
            disabled={actionLoading}
          >
            {actionLoading ? 'Cancelando...' : 'Cancelar sorteo'}
          </button>
        )}

        <button
          onClick={() => router.back()}
          className={styles.secondaryButton}
        >
          Volver
        </button>
      </div>
    </div>
  );
}