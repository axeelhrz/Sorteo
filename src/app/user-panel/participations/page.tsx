'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { userPanelService } from '@/services/user-panel-service';
import type { UserParticipation } from '@/types/user-panel';
import styles from './participations.module.css';

export default function ParticipationsPage() {
  const [participations, setParticipations] = useState<UserParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipations = async () => {
      try {
        setLoading(true);
        const data = await userPanelService.getParticipations();
        setParticipations(data);
      } catch (err) {
        console.error('Error fetching participations:', err);
        setError('Error al cargar tus participaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipations();
  }, []);

  if (loading) {
    return (
      <UserPanelLayout activeSection="participations">
        <div className={styles.loadingContainer}>
          <p>Cargando participaciones...</p>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout activeSection="participations">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎫 Mis Participaciones</h1>
          <p className={styles.subtitle}>
            Aquí puedes ver todos los sorteos en los que has participado
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {participations.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🎰</p>
            <h2>No tienes participaciones aún</h2>
            <p>Comienza a comprar tickets en nuestros sorteos</p>
            <Link href="/sorteos" className={styles.ctaButton}>
              Ver Sorteos Disponibles
            </Link>
          </div>
        ) : (
          <div className={styles.participationsGrid}>
            {participations.map((participation) => {
              const progress = (participation.soldTickets || 0) / (participation.totalTickets || 1) * 100;
              return (
                <div
                  key={participation.raffleId}
                  className={styles.participationCard}
                >
                  {participation.raffleImage && (
                    <div className={styles.cardImage}>
                      <img src={participation.raffleImage} alt={participation.raffleTitle} />
                    </div>
                  )}

                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{participation.raffleTitle}</h3>
                      <span className={`${styles.statusBadge} ${styles[participation.raffleStatus]}`}>
                        {participation.raffleStatus === 'active' && '🔴 Activo'}
                        {participation.raffleStatus === 'sold_out' && '🟡 Agotado'}
                        {participation.raffleStatus === 'finished' && '✅ Finalizado'}
                        {participation.raffleStatus === 'cancelled' && '❌ Cancelado'}
                      </span>
                    </div>

                    <p className={styles.shopName}>{participation.shopName}</p>

                    <div className={styles.ticketsInfo}>
                      <p className={styles.ticketCount}>
                        <strong>{participation.ticketCount}</strong> tickets comprados
                      </p>
                      <p className={styles.purchaseDate}>
                        Comprado: {new Date(participation.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>

                    {participation.raffleStatus === 'active' && (
                      <div className={styles.progressSection}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className={styles.progressText}>
                          {participation.ticketsRemaining} tickets restantes
                        </p>
                      </div>
                    )}

                    {participation.isWinner && (
                      <div className={styles.winnerBadge}>
                        🏆 ¡GANADOR! Ticket #{participation.winnerTicketNumber}
                      </div>
                    )}

                    {participation.raffleStatus === 'finished' && !participation.isWinner && (
                      <div className={styles.lostBadge}>
                        Ticket ganador: #{participation.winnerTicketNumber}
                      </div>
                    )}

                    <Link
                      href={`/user-panel/participations/${participation.raffleId}`}
                      className={styles.viewDetailsButton}
                    >
                      Ver Detalles Completos →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}