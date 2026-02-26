'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FiSearch, FiLock, FiArrowLeft, FiHome } from 'react-icons/fi';
import { publicRaffleService } from '@/services/public-raffle-service';
import { ticketAssignmentService } from '@/services/ticket-assignment-service';
import { useAuth } from '@/hooks/useAuth';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { BuyTicketsBlock } from '@/components/marketplace/BuyTicketsBlock';
import styles from './detail.module.css';

export default function RaffleDetailPage() {
  const params = useParams();
  const raffleId = params.id as string;
  const { user } = useAuth();

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    const loadRaffle = async () => {
      try {
        if (!hasLoadedOnce) {
          setIsLoading(true);
        }
        const data = await publicRaffleService.getRaffleById(raffleId);
        setRaffle(data);
        setHasLoadedOnce(true);
      } catch (err) {
        console.error('Error loading raffle:', err);
        if (!hasLoadedOnce) {
          setError('No pudimos cargar la oportunidad. Intenta nuevamente.');
        }
      } finally {
        if (!hasLoadedOnce) {
          setIsLoading(false);
        }
      }
    };

    if (raffleId) {
      loadRaffle();
    }
  }, [raffleId, hasLoadedOnce]);

  // Actualización en tiempo real solo si el sorteo está activo
  useEffect(() => {
    if (!raffle || (!raffle.status.includes('active') && raffle.status !== RaffleStatus.SOLD_OUT)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const data = await publicRaffleService.getRaffleById(raffleId);
        setRaffle(data);
      } catch (err) {
        console.error('Error updating raffle:', err);
      }
    }, 10000); // Aumentado a 10 segundos para reducir parpadeos

    return () => clearInterval(interval);
  }, [raffleId, raffle?.status]);

  const refreshUserTickets = useCallback(async () => {
    if (!user?.id || !raffleId) return;
    try {
      setLoadingTickets(true);
      const tickets = await ticketAssignmentService.getUserTicketsForRaffle(user.id, raffleId);
      setUserTickets(
        tickets.map((t) => ({
          id: t.id,
          number: t.ticketNumber,
          createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : (t.createdAt as unknown as string),
        }))
      );
    } catch (err) {
      console.error('Error loading user tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  }, [user?.id, raffleId]);

  useEffect(() => {
    refreshUserTickets();
  }, [refreshUserTickets]);

  useEffect(() => {
    if (!user || !raffleId) return;
    const onFocus = () => refreshUserTickets();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, raffleId, refreshUserTickets]);

  // Refrescar participaciones y sorteo cuando el usuario vuelve a la pestaña o a la página (p. ej. tras comprar en checkout)
  useEffect(() => {
    if (!raffleId) return;
    const refetch = () => {
      publicRaffleService.getRaffleById(raffleId).then(setRaffle).catch(() => {});
      if (user) refreshUserTickets();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) refetch(); // Página restaurada desde bfcache (p. ej. botón Atrás)
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [raffleId, user, refreshUserTickets]);

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando oportunidad...</p>
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

  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;
  const remainingTickets = raffle.totalTickets - raffle.soldTickets;
  const isActive = raffle.status === RaffleStatus.ACTIVE;
  const isSoldOut = raffle.status === RaffleStatus.SOLD_OUT;
  const isFinished = raffle.status === RaffleStatus.FINISHED;
  const isPaused = raffle.status === RaffleStatus.PAUSED;

  return (
    <main className={styles.container}>
      {/* Navigation Buttons */}
      <div className={styles.navigationButtons}>
        <Link href="/sorteos" className={styles.backLink}>
          <FiArrowLeft className={styles.backIcon} />
          Volver al listado
        </Link>
        <Link href="/" className={styles.homeLink}>
          <FiHome className={styles.homeIcon} />
          Volver a inicio
        </Link>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Column - Image and Description below */}
        <div className={styles.leftColumn}>
          {/* Product Image */}
          <div className={styles.imageContainer}>
            {(raffle.thumbnail || raffle.product?.mainImage) ? (
              <Image
                src={raffle.thumbnail || raffle.product!.mainImage!}
                alt={raffle.product?.name || 'Producto'}
                fill
                className={styles.image}
                priority
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>Sin imagen disponible</span>
              </div>
            )}
            {/* Status Badge */}
            <div className={`${styles.statusBadge} ${styles[`status-${raffle.status}`]}`}>
              {raffle.status === RaffleStatus.ACTIVE && 'Activo'}
              {raffle.status === RaffleStatus.PAUSED && 'Pausado'}
              {raffle.status === RaffleStatus.SOLD_OUT && 'Agotado'}
              {raffle.status === RaffleStatus.FINISHED && 'Finalizado'}
            </div>
          </div>

          {/* Organizador: "Por [nombre]" */}
          {raffle.shop?.name && (
            <p className={styles.organizerName}>Por {raffle.shop.name}</p>
          )}

          {/* Description below photo */}
          {raffle.product?.description && (
            <div className={styles.descriptionBox}>
              <h3 className={styles.descriptionTitle}>Descripción del producto</h3>
              <p className={styles.productDescription}>{raffle.product.description}</p>
            </div>
          )}

          {/* Redes sociales del organizador (siempre debajo de la descripción) */}
          {raffle.shop && (
            <div className={styles.socialMedia}>
              <h4 className={styles.socialLabel}>Redes del organizador</h4>
              {(() => {
                const sm = raffle.shop?.socialMedia as Record<string, string> | undefined;
                const entries = sm && typeof sm === 'object' ? Object.entries(sm).filter(([, v]) => v && String(v).trim()) : [];
                const labels: Record<string, string> = { facebook: 'Facebook', instagram: 'Instagram', twitter: 'X', tiktok: 'TikTok', whatsapp: 'WhatsApp', website: 'Sitio web' };
                if (entries.length === 0) {
                  return (
                    <p className={styles.socialEmpty}>El organizador no ha agregado redes sociales aún.</p>
                  );
                }
                return (
                  <div className={styles.socialLinks}>
                    {entries.map(([key, value]) => {
                      const url = String(value).trim().startsWith('http') ? value : (key === 'instagram' ? `https://instagram.com/${value.replace('@', '')}` : key === 'facebook' ? `https://facebook.com/${value}` : key === 'whatsapp' ? `https://wa.me/${value.replace(/\D/g, '')}` : key === 'tiktok' ? `https://tiktok.com/@${value.replace('@', '')}` : key === 'twitter' ? `https://twitter.com/${value.replace('@', '')}` : value);
                      const label = labels[key] || key;
                      return (
                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                          {label}
                        </a>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Column - Title, Unit, Delivery, Participa, Progress, Tus participaciones */}
        <div className={styles.rightColumn}>
          {/* Title */}
          <h1 className={styles.productName}>{raffle.product?.name}</h1>

          {/* Unit of participation */}
          <div className={styles.valueBox}>
            <span className={styles.valueLabel}>Unidad de participación</span>
            <span className={styles.valueAmount}>S/ {Number(raffle.productValue).toFixed(2)}</span>
          </div>

          {/* Entrega del premio */}
          <div className={styles.deliveryInfo}>
            <h4 className={styles.deliveryTitle}>Entrega del premio</h4>
            <div className={styles.deliveryOptions}>
              {raffle.product?.hasDelivery ? (
                <div className={styles.deliveryOption}>
                  <span className={styles.deliveryIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.deliveryOptionTitle}>Envío a domicilio</p>
                    {raffle.product?.deliveryZones && (
                      <p className={styles.deliveryOptionText}>Zonas: {raffle.product.deliveryZones}</p>
                    )}
                  </div>
                </div>
              ) : null}
              {raffle.product?.pickupInStore ? (
                <div className={styles.deliveryOption}>
                  <span className={styles.deliveryIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10"></path>
                      <path d="M3 10h14v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10z"></path>
                      <path d="M8 14h4"></path>
                    </svg>
                  </span>
                  <div>
                    <p className={styles.deliveryOptionTitle}>Recojo en local</p>
                    <p className={styles.deliveryOptionText}>Disponible para recojo en el organizador</p>
                  </div>
                </div>
              ) : null}
              {!raffle.product?.hasDelivery && !raffle.product?.pickupInStore && (
                <p className={styles.deliveryOptionText}>Consulta con el organizador sobre las opciones de entrega.</p>
              )}
            </div>
          </div>

          {/* Buy Tickets Block - Participa */}
          {isActive && !isPaused && (
            <BuyTicketsBlock
              raffle={raffle}
              onPaymentCreated={() => {
                if (user) {
                  publicRaffleService.getRaffleById(raffleId).then(setRaffle);
                  setTimeout(refreshUserTickets, 1500);
                  setTimeout(refreshUserTickets, 4000);
                }
              }}
            />
          )}

          {isPaused && (
            <div className={styles.soldOutMessage}>
              <p>Esta oportunidad está pausada temporalmente.</p>
            </div>
          )}

          {isSoldOut && (
            <div className={styles.soldOutMessage}>
              <p>Tickets agotados. El resultado se ejecutará pronto.</p>
            </div>
          )}

          {isFinished && (
            <div className={styles.finishedMessage}>
              <p>Esta oportunidad ha finalizado.</p>
              <Link href={`/sorteos/${raffleId}/winner`}>
                <button className={styles.viewWinnerButton}>Ver ticket ganador →</button>
              </Link>
            </div>
          )}

          {/* Progress Section */}
          <div className={styles.progressSection}>
            <h3 className={styles.sectionTitle}>Progreso de la oportunidad</h3>
            <div className={styles.progressBarRow}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <span className={styles.progressPercent}>{Math.round(progressPercentage)}%</span>
            </div>
            <div className={styles.progressFooter}>
              <span className={styles.progressLabel}>Tickets Participando</span>
              <span className={styles.progressCount}>
                {raffle.soldTickets} de {raffle.totalTickets}
              </span>
            </div>
            <div className={styles.progressFooter}>
              <span className={styles.remainingTickets}>
                {remainingTickets > 0 ? `${remainingTickets} tickets disponibles` : 'Todos los tickets vendidos'}
              </span>
            </div>
          </div>

          {/* Deposit Info */}
          {raffle.requiresDeposit && (
            <div className={styles.depositInfo}>
              <FiLock className={styles.depositIcon} />
              <div>
                <p className={styles.depositTitle}>Depósito de garantía</p>
                <p className={styles.depositText}>
                  Este organizador tiene un depósito de garantía para asegurar la entrega del premio.
                </p>
              </div>
            </div>
          )}

          {/* Tus participaciones */}
          {user ? (
            <div className={styles.userParticipation}>
              <h3 className={styles.sectionTitle}>Tus participaciones</h3>
              {loadingTickets ? (
                <p className={styles.participationText}>Cargando tus tickets...</p>
              ) : userTickets.length > 0 ? (
                <div className={styles.ticketsList}>
                  <p className={styles.participationText}>
                    Tienes <strong>{userTickets.length}</strong> ticket{userTickets.length > 1 ? 's' : ''} en este sorteo:
                  </p>
                  <div className={styles.ticketNumbers}>
                    {userTickets.map((ticket: any) => (
                      <span key={ticket.id} className={styles.ticketNumber}>#{ticket.number}</span>
                    ))}
                  </div>
                  {userTickets[0]?.createdAt && (
                    <p className={styles.participationDate}>
                      Comprado{userTickets.length > 1 ? 's' : ''} el{' '}
                      {new Date(userTickets[0].createdAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <p className={styles.participationText}>
                  Aún no participas en esta oportunidad. ¡Participa para tener oportunidad de ganar!
                </p>
              )}
            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <p className={styles.loginText}>
                Inicia sesión o regístrate para participar y ver tus participaciones.
              </p>
              <div className={styles.loginButtons}>
                <Link href="/login">
                  <button className={styles.loginButton}>Iniciar sesión</button>
                </Link>
                <Link href="/register">
                  <button className={styles.registerButton}>Registrarse</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Winner Section (if finished) */}
      {isFinished && raffle.winnerTicketId && (
        <div className={styles.winnerSection}>
          <h2 className={styles.winnerTitle}>Oportunidad finalizada</h2>
          <div className={styles.winnerCard}>
            <div className={styles.winnerInfo}>
              <p className={styles.winnerLabel}>El ganador ha sido seleccionado</p>
              <p className={styles.winnerDetailText}>
                La oportunidad ha finalizado y el ganador ha sido notificado. Visita la página del ganador para ver más detalles.
              </p>
            </div>
            <Link href={`/sorteos/${raffleId}/winner`}>
              <button className={styles.viewWinnerButton}>
                Ver ticket ganador →
              </button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}