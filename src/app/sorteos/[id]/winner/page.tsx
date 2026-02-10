'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FiAward, FiCheckCircle, FiSearch, FiClock, FiHelpCircle } from 'react-icons/fi';
import { publicRaffleService } from '@/services/public-raffle-service';
import { useAuth } from '@/hooks/useAuth';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { apiClient } from '@/lib/api-client';
import styles from './winner.module.css';

export default function WinnerPage() {
  const params = useParams();
  const raffleId = params.id as string;
  const { user } = useAuth();

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [winnerTicket, setWinnerTicket] = useState<any | null>(null);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [isWinner, setIsWinner] = useState(false);

  useEffect(() => {
    const loadRaffle = async () => {
      try {
        setIsLoading(true);
        const data = await publicRaffleService.getRaffleById(raffleId);
        setRaffle(data);

        // Si la oportunidad está finalizada y tiene ganador, cargar información del ticket ganador
        if (data.status === RaffleStatus.FINISHED && data.winnerTicketId) {
          try {
            // Intentar obtener el ticket ganador
            const ticketResponse = await apiClient.get(`/api/raffle-tickets/${data.winnerTicketId}`);
            setWinnerTicket(ticketResponse.data);
          } catch (err) {
            console.error('Error loading winner ticket:', err);
            // Si falla, intentar obtener todos los tickets del sorteo y buscar el ganador
            try {
              const allTicketsResponse = await apiClient.get(`/api/raffle-tickets?raffleId=${raffleId}`);
              const allTickets = allTicketsResponse.data || [];
              const winner = allTickets.find((t: any) => t.id === data.winnerTicketId);
              if (winner) {
                setWinnerTicket(winner);
              }
            } catch (err2) {
              console.error('Error loading all tickets:', err2);
            }
          }
        }
      } catch (err) {
        console.error('Error loading raffle:', err);
        setError('No pudimos cargar la oportunidad. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    if (raffleId) {
      loadRaffle();
    }
  }, [raffleId]);

  useEffect(() => {
    const loadUserTickets = async () => {
      if (!user || !raffleId) return;

      try {
        const response = await apiClient.get(`/api/raffle-tickets?raffleId=${raffleId}`);
        const tickets = response.data || [];
        setUserTickets(tickets);

        // Verificar si el usuario es el ganador
        if (raffle?.winnerTicketId) {
          const userWon = tickets.some((t: any) => t.id === raffle.winnerTicketId);
          setIsWinner(userWon);
        }
      } catch (err) {
        console.error('Error loading user tickets:', err);
      }
    };

    if (user && raffle) {
      loadUserTickets();
    }
  }, [user, raffleId, raffle?.winnerTicketId]);

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando información del ganador...</p>
        </div>
      </main>
    );
  }

  if (error || !raffle) {
    return (
      <main className={styles.container}>
        <div className={styles.errorContainer}>
          <FiSearch className={styles.errorIcon} />
          <h1 className={styles.errorTitle}>Oportunidad no encontrada</h1>
          <p className={styles.errorDescription}>
            La oportunidad que buscas no existe o no está disponible en este momento.
          </p>
          <Link href="/sorteos">
            <button className={styles.backButton}>Volver al listado</button>
          </Link>
        </div>
      </main>
    );
  }

  if (raffle.status !== RaffleStatus.FINISHED) {
    return (
      <main className={styles.container}>
        <div className={styles.errorContainer}>
          <FiClock className={styles.errorIcon} />
          <h1 className={styles.errorTitle}>Oportunidad aún no finalizada</h1>
          <p className={styles.errorDescription}>
            Esta oportunidad aún no ha finalizado. Vuelve cuando la oportunidad esté completa.
          </p>
          <Link href={`/sorteos/${raffleId}`}>
            <button className={styles.backButton}>Ver oportunidad</button>
          </Link>
        </div>
      </main>
    );
  }

  if (!raffle.winnerTicketId) {
    return (
      <main className={styles.container}>
        <div className={styles.errorContainer}>
          <FiHelpCircle className={styles.errorIcon} />
          <h1 className={styles.errorTitle}>Ganador no disponible</h1>
          <p className={styles.errorDescription}>
            El ganador de esta oportunidad aún no ha sido determinado.
          </p>
          <Link href={`/sorteos/${raffleId}`}>
            <button className={styles.backButton}>Volver a la oportunidad</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      {/* Back Button */}
      <Link href={`/sorteos/${raffleId}`} className={styles.backLink}>
        ← Volver a la oportunidad
      </Link>

      {/* Winner Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          {isWinner ? (
            <>
              <div className={styles.winnerIcon}>
                <FiAward />
              </div>
              <h1 className={styles.heroTitle}>¡Felicidades! Eres el ganador</h1>
              <p className={styles.heroSubtitle}>
                Has ganado la oportunidad de <strong>{raffle.product?.name}</strong>
              </p>
            </>
          ) : (
            <>
              <div className={styles.winnerIcon}>
                <FiCheckCircle />
              </div>
              <h1 className={styles.heroTitle}>Oportunidad finalizada</h1>
              <p className={styles.heroSubtitle}>
                El ganador de la oportunidad de <strong>{raffle.product?.name}</strong> ha sido seleccionado
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Column - Product Info */}
        <div className={styles.leftColumn}>
          <div className={styles.productCard}>
            {raffle.product?.mainImage ? (
              <div className={styles.imageContainer}>
                <Image
                  src={raffle.product.mainImage}
                  alt={raffle.product.name}
                  fill
                  className={styles.image}
                  priority
                />
              </div>
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>Sin imagen disponible</span>
              </div>
            )}
            <div className={styles.productInfo}>
              <h2 className={styles.productName}>{raffle.product?.name}</h2>
              <p className={styles.productDescription}>{raffle.product?.description}</p>
              <div className={styles.valueBox}>
                <span className={styles.valueLabel}>Valor de Ticket</span>
                <span className={styles.valueAmount}>
                  S/ {Number(raffle.productValue).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        {/* Shop Info */}
        <div className={styles.shopCard}>
          <h3 className={styles.shopTitle}>Organizador</h3>
          <div className={styles.shopInfo}>
              {raffle.shop?.logo && (
                <Image
                  src={raffle.shop.logo}
                  alt={raffle.shop.name}
                  width={48}
                  height={48}
                  className={styles.shopLogo}
                />
              )}
              <div className={styles.shopDetails}>
                <h4 className={styles.shopName}>{raffle.shop?.name}</h4>
                {raffle.shop?.status === 'verified' && (
              <span className={styles.verifiedBadge}>
                <FiCheckCircle className={styles.verifiedIcon} />
                Organizador verificado
              </span>
                )}
              </div>
            </div>
            {raffle.shop?.publicEmail && (
              <p className={styles.shopContact}>
                <strong>Contacto:</strong> {raffle.shop.publicEmail}
              </p>
            )}
            {raffle.shop?.phone && (
              <p className={styles.shopContact}>
                <strong>Teléfono:</strong> {raffle.shop.phone}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Winner Info */}
        <div className={styles.rightColumn}>
          {/* Winner Ticket Card */}
          <div className={`${styles.winnerCard} ${isWinner ? styles.winnerCardHighlight : ''}`}>
            <div className={styles.winnerHeader}>
              <h2 className={styles.winnerTitle}>
                {isWinner ? (
                  <>
                    <FiCheckCircle className={styles.titleIcon} />
                    Tu ticket ganador
                  </>
                ) : (
                  <>
                    <FiAward className={styles.titleIcon} />
                    Ticket ganador
                  </>
                )}
              </h2>
            </div>

            <div className={styles.winnerTicketDisplay}>
              <div className={styles.ticketNumberContainer}>
                <span className={styles.ticketLabel}>Ticket ganador</span>
                <span className={styles.ticketNumber}>
                  #{winnerTicket?.number ?? raffle.winnerInfo?.ticketNumber ?? 'N/A'}
                </span>
              </div>

              <div className={styles.winnerUserInfo}>
                <p className={styles.winnerUserLabel}>Nombre de usuario</p>
                <p className={styles.winnerUserName}>
                  {winnerTicket?.user?.name ?? raffle.winnerInfo?.userName ?? '—'}
                </p>
                {(isWinner && (winnerTicket?.user?.email || raffle.winnerInfo?.userEmail)) && (
                  <p className={styles.winnerUserEmail}>{winnerTicket?.user?.email ?? raffle.winnerInfo?.userEmail}</p>
                )}
              </div>

              {raffle.raffleExecutedAt && (
                <div className={styles.executionInfo}>
                  <p className={styles.executionLabel}>Fecha de ejecución</p>
                  <p className={styles.executionDate}>
                    {new Date(raffle.raffleExecutedAt).toLocaleString('es-PE', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              )}
            </div>

            {isWinner && (
              <div className={styles.winnerMessage}>
            <p className={styles.winnerMessageText}>
              <strong>¡Felicidades!</strong> Has sido seleccionado como ganador de esta oportunidad.
              El organizador se pondrá en contacto contigo para coordinar la entrega del premio.
            </p>
            {raffle.shop?.publicEmail && (
              <p className={styles.winnerMessageText}>
                Si tienes alguna pregunta, puedes contactar al organizador en:{' '}
                <a href={`mailto:${raffle.shop.publicEmail}`} className={styles.contactLink}>
                  {raffle.shop.publicEmail}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Raffle Stats */}
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Estadísticas de la oportunidad</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total de tickets</span>
                <span className={styles.statValue}>{raffle.totalTickets}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Tickets vendidos</span>
                <span className={styles.statValue}>{raffle.soldTickets}</span>
              </div>
            </div>
          </div>

          {/* User Participation (if logged in) */}
          {user && userTickets.length > 0 && (
            <div className={styles.participationCard}>
              <h3 className={styles.participationTitle}>Tus participaciones</h3>
              <p className={styles.participationText}>
                Participaste con <strong>{userTickets.length}</strong> ticket{userTickets.length > 1 ? 's' : ''}:
              </p>
              <div className={styles.ticketNumbers}>
                {userTickets.map((ticket: any) => (
                  <span
                    key={ticket.id}
                    className={`${styles.ticketNumberBadge} ${
                      ticket.id === raffle.winnerTicketId ? styles.ticketNumberWinner : ''
                    }`}
                  >
                    #{ticket.number}
                    {ticket.id === raffle.winnerTicketId && (
                      <FiAward className={styles.winnerBadgeIcon} />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Quieres participar en más oportunidades?</h2>
        <p className={styles.ctaText}>Descubre otras oportunidades disponibles y gana increíbles premios</p>
        <Link href="/sorteos">
          <button className={styles.ctaButton}>Ver Oportunidades</button>
        </Link>
      </div>
    </main>
  );
}