'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FiSearch, FiLock, FiCheckCircle, FiArrowLeft, FiHome } from 'react-icons/fi';
import { publicRaffleService } from '@/services/public-raffle-service';
import { useAuth } from '@/hooks/useAuth';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { BuyTicketsBlock } from '@/components/marketplace/BuyTicketsBlock';
import { apiClient } from '@/lib/api-client';
import HowItWorks from '@/components/marketplace/HowItWorks';
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
          setError('No pudimos cargar el sorteo. Intenta nuevamente.');
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

  useEffect(() => {
    const loadUserTickets = async () => {
      if (!user || !raffleId) return;

      try {
        setLoadingTickets(true);
        const response = await apiClient.get(`/api/raffle-tickets?raffleId=${raffleId}`);
        setUserTickets(response.data || []);
      } catch (err) {
        console.error('Error loading user tickets:', err);
      } finally {
        setLoadingTickets(false);
      }
    };

    loadUserTickets();
  }, [user, raffleId]);

  if (isLoading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando sorteo...</p>
        </div>
      </main>
    );
  }

  if (error || !raffle) {
    return (
      <main className={styles.container}>
        <div className={styles.errorContainer}>
          <FiSearch className={styles.errorIcon} />
          <h1 className={styles.errorTitle}>Sorteo no encontrado</h1>
          <p className={styles.errorDescription}>
            El sorteo que buscas no existe o no está disponible en este momento.
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

  // Calcular fecha estimada del sorteo (basada en velocidad de venta)
  const calculateEstimatedDate = () => {
    if (remainingTickets <= 0) return null;
    if (raffle.soldTickets === 0) return null;

    // Calcular velocidad de venta (tickets por día)
    const daysSinceCreation = Math.max(
      1,
      (new Date().getTime() - new Date(raffle.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    const ticketsPerDay = raffle.soldTickets / daysSinceCreation;

    if (ticketsPerDay <= 0) return null;

    // Calcular días restantes
    const daysRemaining = remainingTickets / ticketsPerDay;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + Math.ceil(daysRemaining));

    return estimatedDate;
  };

  const estimatedDate = calculateEstimatedDate();

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
        {/* Left Column - Image and Info */}
        <div className={styles.leftColumn}>
          {/* Product Image */}
          <div className={styles.imageContainer}>
            {raffle.product?.mainImage ? (
              <Image
                src={raffle.product.mainImage}
                alt={raffle.product.name}
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

          {/* Shop Info */}
          <div className={styles.shopInfo}>
            <h3 className={styles.shopTitle}>Tienda</h3>
            <div className={styles.shopCard}>
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
                    Tienda verificada
                  </span>
                )}
              </div>
            </div>
            {raffle.shop?.description && (
              <p className={styles.shopDescription}>{raffle.shop.description}</p>
            )}
            
            {/* Social Media */}
            {raffle.shop?.socialMedia && (
              <div className={styles.socialMedia}>
                <p className={styles.socialLabel}>Síguenos en redes sociales:</p>
                <p className={styles.socialLinks}>{raffle.shop.socialMedia}</p>
              </div>
            )}
            
            <Link href={`/tienda/${raffle.shop?.id}`}>
              <button className={styles.viewShopButton}>Ver otros sorteos</button>
            </Link>
          </div>
        </div>

        {/* Right Column - Details and CTA */}
        <div className={styles.rightColumn}>
          {/* Product Info */}
          <div className={styles.productSection}>
            <h1 className={styles.productName}>{raffle.product?.name}</h1>
            <p className={styles.productDescription}>{raffle.product?.description}</p>

            {/* Value */}
            <div className={styles.valueBox}>
              <span className={styles.valueLabel}>Valor del producto</span>
              <span className={styles.valueAmount}>S/ {Number(raffle.productValue).toFixed(2)}</span>
            </div>

            {/* Delivery and Pickup Info */}
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
                        <p className={styles.deliveryOptionText}>
                          Zonas de cobertura: {raffle.product.deliveryZones}
                        </p>
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
                      <p className={styles.deliveryOptionTitle}>Recojo en tienda</p>
                      <p className={styles.deliveryOptionText}>
                        Disponible para recojo en las instalaciones de la tienda
                      </p>
                    </div>
                  </div>
                ) : null}

                {!raffle.product?.hasDelivery && !raffle.product?.pickupInStore && (
                  <p className={styles.deliveryOptionText}>
                    Consulta con la tienda sobre las opciones de entrega disponibles.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Raffle Rules */}
          <div className={styles.rulesSection}>
            <h3 className={styles.sectionTitle}>Cómo funciona este sorteo</h3>
            <div className={styles.rulesList}>
              <div className={styles.rule}>
                <span className={styles.ruleIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </span>
                <div>
                  <p className={styles.ruleTitle}>Tickets limitados</p>
                  <p className={styles.ruleText}>
                    Los tickets disponibles para este sorteo son limitados. Compra los tuyos antes de que se agoten.
                  </p>
                </div>
              </div>
              <div className={styles.rule}>
                <span className={styles.ruleIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1"></circle>
                    <path d="M12 1v6m0 6v6"></path>
                    <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24"></path>
                    <path d="M1 12h6m6 0h6"></path>
                    <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
                  </svg>
                </span>
                <div>
                  <p className={styles.ruleTitle}>Sorteo automático</p>
                  <p className={styles.ruleText}>
                    Cuando se venden todos los tickets, el sorteo se ejecuta automáticamente.
                  </p>
                </div>
              </div>
              <div className={styles.rule}>
                <span className={styles.ruleIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6-7 6 7"></path>
                    <path d="M6 9h12v10c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9z"></path>
                  </svg>
                </span>
                <div>
                  <p className={styles.ruleTitle}>Ganador aleatorio</p>
                  <p className={styles.ruleText}>
                    El ganador se elige de forma completamente aleatoria entre todos los tickets vendidos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className={styles.progressSection}>
            <h3 className={styles.sectionTitle}>Progreso del sorteo</h3>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Tickets vendidos</span>
              <span className={styles.progressCount}>
                {raffle.soldTickets} de {raffle.totalTickets}
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className={styles.progressFooter}>
              <span className={styles.remainingTickets}>
                {remainingTickets > 0
                  ? `${remainingTickets} tickets disponibles`
                  : 'Todos los tickets vendidos'}
              </span>
              <span className={styles.progressPercent}>{Math.round(progressPercentage)}%</span>
            </div>
            {estimatedDate && isActive && (
              <div className={styles.estimatedDate}>
                <span className={styles.estimatedLabel}>Fecha estimada del sorteo:</span>
                <span className={styles.estimatedValue}>
                  {estimatedDate.toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Deposit Info */}
          {raffle.requiresDeposit && (
            <div className={styles.depositInfo}>
              <FiLock className={styles.depositIcon} />
              <div>
                <p className={styles.depositTitle}>Depósito de garantía</p>
                <p className={styles.depositText}>
                  Esta tienda tiene un depósito de garantía para asegurar la entrega del premio.
                </p>
              </div>
            </div>
          )}

          {/* User Participation */}
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
                      <span key={ticket.id} className={styles.ticketNumber}>
                        #{ticket.number}
                      </span>
                    ))}
                  </div>
                  <p className={styles.participationDate}>
                    Comprado{userTickets.length > 1 ? 's' : ''} el{' '}
                    {new Date(userTickets[0]?.createdAt || Date.now()).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ) : (
                <p className={styles.participationText}>
                  Aún no participas en este sorteo. ¡Compra tickets para tener oportunidad de ganar!
                </p>
              )}
            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <p className={styles.loginText}>
                Inicia sesión o regístrate para comprar tickets y ver tus participaciones.
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

          {/* Buy Tickets Block */}
          {isActive && !isPaused && (
            <BuyTicketsBlock
              raffle={raffle}
              onPaymentCreated={() => {
                // Recargar tickets del usuario después de la compra
                if (user) {
                  setTimeout(() => {
                    apiClient.get(`/api/raffle-tickets?raffleId=${raffleId}`).then((response) => {
                      setUserTickets(response.data || []);
                    });
                  }, 2000);
                }
              }}
            />
          )}

          {isPaused && (
            <div className={styles.soldOutMessage}>
              <p>Este sorteo está pausado temporalmente.</p>
            </div>
          )}

          {isSoldOut && (
            <div className={styles.soldOutMessage}>
              <p>Tickets agotados. El sorteo se ejecutará pronto.</p>
            </div>
          )}

          {isFinished && (
            <div className={styles.finishedMessage}>
              <p>Este sorteo ha finalizado.</p>
              <Link href={`/sorteos/${raffleId}/winner`}>
                <button className={styles.viewWinnerButton}>
                  Ver ticket ganador →
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Winner Section (if finished) */}
      {isFinished && raffle.winnerTicketId && (
        <div className={styles.winnerSection}>
          <h2 className={styles.winnerTitle}>Sorteo finalizado</h2>
          <div className={styles.winnerCard}>
            <div className={styles.winnerInfo}>
              <p className={styles.winnerLabel}>El ganador ha sido seleccionado</p>
              <p className={styles.winnerDetailText}>
                El sorteo ha finalizado y el ganador ha sido notificado. Visita la página del ganador para ver más detalles.
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

      {/* How It Works */}
      <HowItWorks />

      {/* Related Raffles */}
      <div className={styles.relatedSection}>
        <h2 className={styles.relatedTitle}>Otros sorteos de esta tienda</h2>
        <p className={styles.relatedText}>
          <Link href={`/tienda/${raffle.shop?.id}`}>
            Ver todos los sorteos de {raffle.shop?.name} →
          </Link>
        </p>
      </div>
    </main>
  );
}