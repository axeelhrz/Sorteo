'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { userPanelService } from '@/services/user-panel-service';
import type { UserPanelDashboard } from '@/types/user-panel';
import styles from './user-panel.module.css';

export default function UserPanelDashboardPage() {
  const [dashboard, setDashboard] = useState<UserPanelDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await userPanelService.getDashboard();
        setDashboard(data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Error al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <UserPanelLayout>
        <div className={styles.loadingContainer}>
          <p>Cargando dashboard...</p>
        </div>
      </UserPanelLayout>
    );
  }

  if (error) {
    return (
      <UserPanelLayout>
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout activeSection="dashboard">
      <div className={styles.dashboardContainer}>
        {/* Bienvenida */}
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>¡Bienvenido a tu Panel!</h1>
          <p className={styles.welcomeSubtitle}>
            Aquí puedes ver tus participaciones, sorteos ganados y gestionar tu cuenta.
          </p>
        </div>

        {/* Resumen Rápido */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.cardIcon}>🎰</div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Sorteos Activos</p>
              <p className={styles.cardValue}>{dashboard?.totalParticipations || 0}</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardIcon}>🎫</div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Tickets Este Mes</p>
              <p className={styles.cardValue}>{dashboard?.ticketsPurchasedThisMonth || 0}</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardIcon}>🏆</div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Sorteos Ganados</p>
              <p className={styles.cardValue}>{dashboard?.wonRaffles || 0}</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardIcon}>📦</div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Entregas Pendientes</p>
              <p className={styles.cardValue}>{dashboard?.pendingDeliveries || 0}</p>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.cardIcon}>🔔</div>
            <div className={styles.cardContent}>
              <p className={styles.cardLabel}>Notificaciones Nuevas</p>
              <p className={styles.cardValue}>{dashboard?.newNotifications || 0}</p>
            </div>
          </div>
        </div>

        {/* Sorteos Activos Próximos a Terminar */}
        {dashboard?.activeRafflesNearEnd && dashboard.activeRafflesNearEnd.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>⏰ Sorteos Próximos a Terminar</h2>
            <div className={styles.rafflesList}>
              {dashboard.activeRafflesNearEnd.map((raffle) => {
                const progress = (raffle.soldTickets || 0) / (raffle.totalTickets || 1) * 100;
                return (
                  <div key={raffle.raffleId} className={styles.raffleItem}>
                    <div className={styles.raffleInfo}>
                      <h3 className={styles.raffleTitle}>{raffle.raffleTitle}</h3>
                      <p className={styles.raffleShop}>{raffle.shopName}</p>
                      <p className={styles.raffleTickets}>
                        Tickets: {raffle.ticketCount} comprados
                      </p>
                    </div>
                    <div className={styles.raffleProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className={styles.progressText}>
                        {raffle.ticketsRemaining} tickets restantes
                      </p>
                    </div>
                    <Link
                      href={`/user-panel/participations/${raffle.raffleId}`}
                      className={styles.viewButton}
                    >
                      Ver Detalles →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accesos Rápidos */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🚀 Accesos Rápidos</h2>
          <div className={styles.quickAccessGrid}>
            <Link href="/user-panel/participations" className={styles.quickAccessCard}>
              <span className={styles.quickAccessIcon}>🎫</span>
              <span className={styles.quickAccessLabel}>Ver mis Tickets</span>
            </Link>
            <Link href="/user-panel/won-raffles" className={styles.quickAccessCard}>
              <span className={styles.quickAccessIcon}>🏆</span>
              <span className={styles.quickAccessLabel}>Ver Sorteos Ganados</span>
            </Link>
            <Link href="/user-panel/notifications" className={styles.quickAccessCard}>
              <span className={styles.quickAccessIcon}>🔔</span>
              <span className={styles.quickAccessLabel}>Ver Notificaciones</span>
            </Link>
            <Link href="/user-panel/support" className={styles.quickAccessCard}>
              <span className={styles.quickAccessIcon}>💬</span>
              <span className={styles.quickAccessLabel}>Centro de Soporte</span>
            </Link>
          </div>
        </div>
      </div>
    </UserPanelLayout>
  );
}