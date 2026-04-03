'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { DeliveryConfirmation } from '@/components/UserPanel/DeliveryConfirmation';
import { userPanelService } from '@/services/user-panel-service';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { useAuthStore } from '@/store/auth-store';
import type { UserWonRaffle } from '@/types/user-panel';
import type { WinnerInfo } from '@/types/raffle';
import {
  getWinnerReceiptStatusDisplay,
  type WinnerReceiptStatusDisplay,
} from '@/lib/winner-receipt-status-display';
import styles from './won-raffles.module.css';

function getCardStatusDisplay(
  raffle: UserWonRaffle,
  wi: WinnerInfo | undefined
): WinnerReceiptStatusDisplay {
  if (wi) {
    return getWinnerReceiptStatusDisplay(wi);
  }
  if (raffle.deliveryStatus === 'delivered') {
    return {
      phase: 'pending_confirmation',
      title: 'Revisa recepción',
      subtitle: 'Abre esta tarjeta y confirma si ya recibiste el premio.',
      badgeClass: 'phasePendingConfirmation',
    };
  }
  if (raffle.deliveryStatus === 'in_process') {
    return {
      phase: 'in_progress',
      title: 'Entrega en curso',
      subtitle: 'El organizador gestiona la entrega.',
      badgeClass: 'phaseInProgress',
    };
  }
  return {
    phase: 'awaiting_delivery',
    title: 'Coordinación pendiente',
    subtitle: 'Espera novedades del organizador.',
    badgeClass: 'phaseAwaitingDelivery',
  };
}

export default function WonRafflesPage() {
  const { user } = useAuthStore();
  const [wonRaffles, setWonRaffles] = useState<UserWonRaffle[]>([]);
  const [winnersInfo, setWinnersInfo] = useState<Map<string, WinnerInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWonRaffles = async () => {
      try {
        setLoading(true);
        const data = await userPanelService.getWonRaffles();
        setWonRaffles(data);
        
        // Cargar información del ganador para cada sorteo
        const winnersMap = new Map<string, WinnerInfo>();
        for (const raffle of data) {
          try {
            const winnerInfo = await winnerVerificationService.getWinnerInfo(raffle.raffleId);
            if (winnerInfo) {
              winnersMap.set(raffle.raffleId, winnerInfo);
            }
          } catch (err) {
            console.error(`Error loading winner info for raffle ${raffle.raffleId}:`, err);
          }
        }
        setWinnersInfo(winnersMap);
      } catch (err) {
        console.error('Error fetching won raffles:', err);
        setError('Error al cargar tus sorteos ganados');
      } finally {
        setLoading(false);
      }
    };

    fetchWonRaffles();
  }, []);

  const handleConfirmSuccess = async () => {
    // Recargar sorteos ganados
    try {
      const data = await userPanelService.getWonRaffles();
      setWonRaffles(data);
      
      // Recargar información del ganador
      const winnersMap = new Map<string, WinnerInfo>();
      for (const raffle of data) {
        try {
          const winnerInfo = await winnerVerificationService.getWinnerInfo(raffle.raffleId);
          if (winnerInfo) {
            winnersMap.set(raffle.raffleId, winnerInfo);
          }
        } catch (err) {
          console.error(`Error loading winner info for raffle ${raffle.raffleId}:`, err);
        }
      }
      setWinnersInfo(winnersMap);
    } catch (err) {
      console.error('Error reloading won raffles:', err);
    }
  };

  if (loading) {
    return (
      <UserPanelLayout activeSection="won-raffles">
        <div className={styles.loadingContainer}>
          <p>Cargando sorteos ganados...</p>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout activeSection="won-raffles">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🏆 Mis Sorteos Ganados</h1>
          <p className={styles.subtitle}>
            Aquí puedes ver los sorteos que has ganado y el estado de entrega
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {wonRaffles.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🎁</p>
            <h2>Aún no has ganado ningún sorteo</h2>
            <p>¡Sigue participando! Tu próximo premio podría estar cerca</p>
            <Link href="/sorteos" className={styles.ctaButton}>
              Ver Sorteos Disponibles
            </Link>
          </div>
        ) : (
          <div className={styles.wonRafflesList}>
            {wonRaffles.map((raffle) => (
              <div key={raffle.raffleId} className={styles.wonRaffleCard}>
                {raffle.raffleImage && (
                  <div className={styles.cardImage}>
                    <img src={raffle.raffleImage} alt={raffle.raffleTitle} />
                  </div>
                )}

                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>{raffle.raffleTitle}</h3>
                      <p className={styles.shopName}>{raffle.shopName}</p>
                    </div>
                    {(() => {
                      const statusDisplay = getCardStatusDisplay(
                        raffle,
                        winnersInfo.get(raffle.raffleId)
                      );
                      const phaseClass =
                        styles[statusDisplay.badgeClass as keyof typeof styles] || styles.phaseUnknown;
                      return (
                        <div className={styles.deliveryBadgeStack}>
                          <div className={`${styles.deliveryBadge} ${phaseClass}`}>
                            {statusDisplay.title}
                          </div>
                          {statusDisplay.subtitle ? (
                            <span className={styles.deliveryBadgeSubtitle}>
                              {statusDisplay.subtitle}
                            </span>
                          ) : null}
                        </div>
                      );
                    })()}
                  </div>

                  <div className={styles.winnerInfo}>
                    <p className={styles.winnerTicket}>
                      <strong>Ticket Ganador:</strong> #{raffle.ticketNumber}
                    </p>
                    <p className={styles.winDate}>
                      Ganado: {new Date(raffle.winDate).toLocaleDateString()}
                    </p>
                  </div>

                  {raffle.productDescription && (
                    <p className={styles.productDescription}>{raffle.productDescription}</p>
                  )}

                  <div className={styles.shopContact}>
                    {raffle.shopEmail && (
                      <p>
                        <strong>Email:</strong> {raffle.shopEmail}
                      </p>
                    )}
                    {raffle.shopPhone && (
                      <p>
                        <strong>Teléfono:</strong> {raffle.shopPhone}
                      </p>
                    )}
                  </div>

                  {raffle.deliveryEvidence && (
                    <div className={styles.evidenceSection}>
                      <h4>Evidencia de Entrega</h4>
                      {raffle.deliveryEvidence.photoUrl && (
                        <p>
                          <a href={raffle.deliveryEvidence.photoUrl} target="_blank" rel="noopener noreferrer">
                            📸 Ver Foto de Entrega
                          </a>
                        </p>
                      )}
                      {raffle.deliveryEvidence.conversationScreenshot && (
                        <p>
                          <a href={raffle.deliveryEvidence.conversationScreenshot} target="_blank" rel="noopener noreferrer">
                            💬 Ver Conversación
                          </a>
                        </p>
                      )}
                      {raffle.deliveryEvidence.notes && (
                        <p className={styles.notes}>{raffle.deliveryEvidence.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Componente de Confirmación de Entrega */}
                  {winnersInfo.get(raffle.raffleId) && user && (
                    <DeliveryConfirmation
                      raffleId={raffle.raffleId}
                      winnerInfo={winnersInfo.get(raffle.raffleId)!}
                      userId={user.id}
                      onConfirmSuccess={handleConfirmSuccess}
                    />
                  )}

                  <div className={styles.actions}>
                    {raffle.canCreateComplaint && (
                      <Link
                        href={`/user-panel/support?raffleId=${raffle.raffleId}`}
                        className={styles.complaintButton}
                      >
                        📋 Abrir Reclamo
                      </Link>
                    )}
                    <Link
                      href={`/sorteos/${raffle.raffleId}/winner`}
                      className={styles.viewDetailsButton}
                    >
                      Ver Detalles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}