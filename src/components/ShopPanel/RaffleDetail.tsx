'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Raffle, RaffleStatus, WinnerInfo } from '@/types/raffle';
import { raffleService } from '@/services/raffle-service';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { useAuthStore } from '@/store/auth-store';
import styles from './shop-panel.module.css';
import { StatusBadge } from './StatusBadge';
import { WinnerValidation } from './WinnerValidation';
import { DeliveryEvidenceUpload } from './DeliveryEvidenceUpload';

interface RaffleDetailProps {
  raffleId: string;
}

export function RaffleDetail({ raffleId }: RaffleDetailProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<WinnerInfo | null>(null);

  useEffect(() => {
    loadRaffle();
  }, [raffleId]);

  useEffect(() => {
    if (raffle?.winnerInfo) {
      setWinnerInfo(raffle.winnerInfo);
    }
  }, [raffle]);

  const loadRaffle = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await raffleService.getRaffleById(raffleId);
      setRaffle(data);
      
      // Si el sorteo está finalizado y tiene ganador, cargar información del ganador
      if (data.status === RaffleStatus.FINISHED && data.winnerTicketId) {
        try {
          const winner = await winnerVerificationService.getWinnerInfo(data.id);
          setWinnerInfo(winner);
        } catch (err) {
          console.error('Error loading winner info:', err);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el sorteo');
    } finally {
      setLoading(false);
    }
  };

  const handleValidationSuccess = (winner: WinnerInfo) => {
    setWinnerInfo(winner);
    loadRaffle(); // Recargar para actualizar el estado
  };

  const handleEvidenceUploadSuccess = (winner: WinnerInfo) => {
    setWinnerInfo(winner);
    loadRaffle(); // Recargar para actualizar el estado
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
    if (raffle.soldTickets > 0) {
      alert('Solo puedes solicitar la anulación de una oportunidad si aún no hay tickets comprados.');
      return;
    }
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
            <div className={styles.raffleDetailItemLabel}>Valor del producto</div>
            <div className={styles.raffleDetailItemValue}>
              {raffle.product?.value != null ? `S/. ${Math.round(Number(raffle.product.value)).toLocaleString('es-PE')}` : '—'}
            </div>
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

      {raffle.status !== 'draft' && raffle.status !== 'pending_approval' && (
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
      )}

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

      {/* Sección de Gestión del Ganador */}
      {raffle.status === RaffleStatus.FINISHED && raffle.winnerTicketId && (
        <>
          <div className={styles.raffleDetailSection}>
            <div className={styles.alert + ' ' + styles.alertSuccess}>
              ✓ Sorteo finalizado. Ticket ganador: #{raffle.winnerTicketId}
            </div>
          </div>

          {/* Validación del Código del Ganador */}
          {(!winnerInfo || winnerInfo.deliveryStatus === 'pending') && (
            <WinnerValidation
              raffleId={raffle.id}
              onValidationSuccess={handleValidationSuccess}
            />
          )}

          {/* Estado de Entrega */}
          {winnerInfo && winnerInfo.deliveryStatus !== 'pending' && (
            <div className={styles.raffleDetailSection}>
              <div className={styles.raffleDetailSectionTitle}>Estado de Entrega</div>
              <div className={styles.raffleDetailGrid}>
                <div className={styles.raffleDetailItem}>
                  <div className={styles.raffleDetailItemLabel}>Ticket Ganador</div>
                  <div className={styles.raffleDetailItemValue}>#{winnerInfo.ticketNumber}</div>
                </div>
                <div className={styles.raffleDetailItem}>
                  <div className={styles.raffleDetailItemLabel}>Código de Verificación</div>
                  <div className={styles.raffleDetailItemValue}>{winnerInfo.verificationCode}</div>
                </div>
                <div className={styles.raffleDetailItem}>
                  <div className={styles.raffleDetailItemLabel}>Estado</div>
                  <div className={styles.raffleDetailItemValue}>
                    {winnerInfo.deliveryStatus === 'contacted' && '✅ Contactado'}
                    {winnerInfo.deliveryStatus === 'in_delivery' && '📦 En Entrega'}
                    {winnerInfo.deliveryStatus === 'delivered' && '✅ Entregado'}
                    {winnerInfo.deliveryStatus === 'confirmed' && '✅ Confirmado'}
                  </div>
                </div>
                {winnerInfo.claimedAt && (
                  <div className={styles.raffleDetailItem}>
                    <div className={styles.raffleDetailItemLabel}>Validado el</div>
                    <div className={styles.raffleDetailItemValue}>
                      {new Date(winnerInfo.claimedAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subida de Evidencia de Entrega */}
          {winnerInfo && 
           (winnerInfo.deliveryStatus === 'contacted' || winnerInfo.deliveryStatus === 'in_delivery') && 
           !winnerInfo.deliveryEvidence && 
           user && (
            <DeliveryEvidenceUpload
              raffleId={raffle.id}
              currentUserId={user.id}
              onUploadSuccess={handleEvidenceUploadSuccess}
            />
          )}

          {/* Evidencia Subida */}
          {winnerInfo?.deliveryEvidence && (
            <div className={styles.raffleDetailSection}>
              <div className={styles.raffleDetailSectionTitle}>Evidencia de Entrega</div>
              <div className={styles.evidenceContainer}>
                <img 
                  src={winnerInfo.deliveryEvidence.photoUrl} 
                  alt="Evidencia de entrega"
                  style={{ maxWidth: '400px', borderRadius: '8px', marginBottom: '16px' }}
                />
                {winnerInfo.deliveryEvidence.notes && (
                  <p><strong>Notas:</strong> {winnerInfo.deliveryEvidence.notes}</p>
                )}
                <p style={{ fontSize: '14px', color: '#7f8c8d' }}>
                  Subido el {new Date(winnerInfo.deliveryEvidence.uploadedAt).toLocaleString('es-PE', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
                {winnerInfo.deliveryStatus === 'delivered' && winnerInfo.deliveryDeadline && (
                  <div className={styles.alert} style={{ marginTop: '16px' }}>
                    ⏰ El ganador tiene hasta el{' '}
                    {new Date(winnerInfo.deliveryDeadline).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    para confirmar la recepción. Si no confirma, se dará por confirmada automáticamente.
                  </div>
                )}
                {winnerInfo.deliveryStatus === 'confirmed' && (
                  <div className={styles.alert + ' ' + styles.alertSuccess} style={{ marginTop: '16px' }}>
                    ✅ Entrega confirmada por el ganador
                  </div>
                )}
              </div>
            </div>
          )}
        </>
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
          raffle.soldTickets === 0 ? (
            <button
              onClick={handleCancel}
              className={styles.dangerButton}
              disabled={actionLoading}
            >
              {actionLoading ? 'Cancelando...' : 'Cancelar sorteo'}
            </button>
          ) : (
            <span className={styles.alert} style={{ padding: '10px 16px', fontSize: '13px' }}>
              No puedes anular: ya hay {raffle.soldTickets} ticket(s) comprado(s). Solo se puede solicitar anulación si no hay tickets vendidos.
            </span>
          )
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