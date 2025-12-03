'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { userPanelService } from '@/services/user-panel-service';
import type { UserWonRaffle } from '@/types/user-panel';
import styles from './won-raffles.module.css';

export default function WonRafflesPage() {
  const [wonRaffles, setWonRaffles] = useState<UserWonRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWonRaffles = async () => {
      try {
        setLoading(true);
        const data = await userPanelService.getWonRaffles();
        setWonRaffles(data);
      } catch (err) {
        console.error('Error fetching won raffles:', err);
        setError('Error al cargar tus sorteos ganados');
      } finally {
        setLoading(false);
      }
    };

    fetchWonRaffles();
  }, []);

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
                    <div className={`${styles.deliveryBadge} ${styles[raffle.deliveryStatus]}`}>
                      {raffle.deliveryStatus === 'pending' && '⏳ Pendiente'}
                      {raffle.deliveryStatus === 'in_process' && '📦 En Proceso'}
                      {raffle.deliveryStatus === 'delivered' && '✅ Entregado'}
                    </div>
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

                  <div className={styles.actions}>
                    {raffle.deliveryStatus !== 'delivered' && raffle.canCreateComplaint && (
                      <Link
                        href={`/user-panel/support?raffleId=${raffle.raffleId}`}
                        className={styles.complaintButton}
                      >
                        📋 Abrir Reclamo
                      </Link>
                    )}
                    {raffle.deliveryStatus !== 'delivered' && (
                      <button
                        className={styles.markReceivedButton}
                        onClick={() => {
                          // Implementar marcar como recibido
                        }}
                      >
                        ✅ Marcar como Recibido
                      </button>
                    )}
                    <Link
                      href={`/user-panel/won-raffles/${raffle.raffleId}`}
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