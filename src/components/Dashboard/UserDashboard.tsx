'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { FiLogOut, FiPlay, FiTag, FiAward, FiShoppingBag, FiStar } from 'react-icons/fi';
import { ticketAssignmentService } from '@/services/ticket-assignment-service';
import { firebaseUserParticipationService } from '@/services/firebase-user-participation-service';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { publicRaffleService } from '@/services/public-raffle-service';
import { DeliveryConfirmation } from '@/components/UserPanel/DeliveryConfirmation';
import type { WinnerInfo } from '@/types/raffle';
import styles from './UserDashboard.module.css';

interface Raffle {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    value: number;
    mainImage?: string;
  };
  thumbnail?: string;
  totalTickets: number;
  soldTickets: number;
  status: string;
  createdAt: string | Date;
  productValue?: number;
  winnerTicketId?: string;
}

interface RaffleTicket {
  id: string;
  raffleId: string;
  number: number;
  status: string;
  purchasedAt?: string;
}

type TabMyRaffles = 'participados' | 'ganados';

interface Product {
  id: string;
  name: string;
  value: number;
}


export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeRaffles, setActiveRaffles] = useState<Raffle[]>([]);
  const [myTickets, setMyTickets] = useState<RaffleTicket[]>([]);
  const [participations, setParticipations] = useState<Raffle[]>([]);
  const [wonRaffles, setWonRaffles] = useState<Raffle[]>([]);
  const [winnersInfo, setWinnersInfo] = useState<Map<string, WinnerInfo>>(new Map());
  const [tabMyRaffles, setTabMyRaffles] = useState<TabMyRaffles>('participados');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<{ [raffleId: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { productService } = await import('@/services/product-service');

        const activeResult = await publicRaffleService.getActiveRaffles({ limit: 100 });
        setActiveRaffles(activeResult.data.map((r: any) => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        })));

        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);

        if (user?.id) {
          const tickets = await ticketAssignmentService.getAllUserTickets(user.id);
          setMyTickets(tickets.map((t) => ({
            id: t.id,
            raffleId: t.raffleId,
            number: t.ticketNumber,
            status: t.status,
            purchasedAt: t.purchaseDate instanceof Date ? t.purchaseDate.toISOString() : String(t.purchaseDate),
          })));

          const parts = await firebaseUserParticipationService.getUserParticipations(user.id);
          setParticipations(parts.map((r) => ({
            ...r,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as unknown as string),
          })));

          const won = await firebaseUserParticipationService.getUserWonRaffles(user.id);
          setWonRaffles(won.map((r) => ({
            ...r,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as unknown as string),
          })));

          const winMap = new Map<string, WinnerInfo>();
          for (const r of won) {
            try {
              const info = await winnerVerificationService.getWinnerInfo(r.id);
              if (info) winMap.set(r.id, info);
            } catch (_e) {
              // ignore
            }
          }
          setWinnersInfo(winMap);
        } else {
          setMyTickets([]);
          setParticipations([]);
          setWonRaffles([]);
          setWinnersInfo(new Map());
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/');
    }
  };

  const handleBuyTickets = async (raffleId: string) => {
    // Solo usuarios pueden comprar tickets; organizadores no pueden participar
    if (user?.role !== UserRole.USER) {
      setError('Solo las cuentas de usuario pueden comprar tickets.');
      return;
    }
    const quantity = ticketQuantity[raffleId] || 1;
    const raffle = activeRaffles.find(r => r.id === raffleId);
    
    if (!raffle) {
      setError('Sorteo no encontrado');
      return;
    }

    const availableTickets = raffle.totalTickets - raffle.soldTickets;
    if (quantity > availableTickets) {
      setError(`Solo hay ${availableTickets} tickets disponibles`);
      return;
    }

    if (quantity < 1) {
      setError('Debes comprar al menos 1 ticket');
      return;
    }

    try {
      const { firebasePaymentService } = await import('@/services/firebase-payment-service');
      const productValue = raffle.productValue || raffle.product?.value || 0;
      const totalPrice = quantity * productValue;

      const payment = await firebasePaymentService.createPayment({
        raffleId: raffle.id,
        amount: totalPrice,
        ticketQuantity: quantity,
      });

      router.push(`/checkout?paymentId=${payment.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la compra');
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      active: '#2196F3',
      paused: '#FF9800',
      sold_out: '#9C27B0',
      finished: '#4CAF50',
      cancelled: '#F44336',
    };
    return statusColors[status] || '#757575';
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTag}>Panel de Usuario</span>
            <h1 className={styles.title}>Mi Dashboard</h1>
            <p className={styles.subtitle}>Participa en sorteos y gestiona tus tickets</p>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                <span className={styles.userRole}>Usuario</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Sorteos Disponibles</div>
                <div className={styles.statValue}>{activeRaffles.length}</div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FiPlay />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>Sorteos activos para participar</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Mis Tickets</div>
                <div className={styles.statValue}>{myTickets.length}</div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <FiTag />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>Tickets comprados</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Sorteos Participados</div>
                <div className={styles.statValue}>
                  {new Set(myTickets.map((t) => t.raffleId)).size}
                </div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <FiAward />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>Diferentes sorteos</span>
            </div>
          </div>
        </div>

        {/* Tabs: Sorteos participados / Sorteos ganados */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={tabMyRaffles === 'participados' ? styles.tabActive : styles.tab}
                onClick={() => setTabMyRaffles('participados')}
              >
                <FiTag style={{ marginRight: '6px' }} />
                Sorteos participados
              </button>
              <button
                type="button"
                className={tabMyRaffles === 'ganados' ? styles.tabActive : styles.tab}
                onClick={() => setTabMyRaffles('ganados')}
              >
                <FiStar style={{ marginRight: '6px' }} />
                Sorteos ganados
              </button>
            </div>
          </div>

          {tabMyRaffles === 'participados' && (
            <>
              {participations.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiTag className={styles.emptyIcon} />
                  <h3>No has participado en sorteos</h3>
                  <p>Compra tickets en los sorteos disponibles para aparecer aquí.</p>
                  <Link href="#raffles" className={styles.buyBtn}>Ver sorteos disponibles</Link>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Sorteo</th>
                        <th>Tickets</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participations.map((r) => {
                        const ticketCount = myTickets.filter((t) => t.raffleId === r.id).length;
                        const productName = r.product?.name || products.find((p) => p.id === r.productId)?.name || 'Sorteo';
                        const statusLabels: { [key: string]: string } = {
                          active: 'Activo',
                          sold_out: 'Agotado',
                          finished: 'Finalizado',
                          cancelled: 'Cancelado',
                        };
                        return (
                          <tr key={r.id}>
                            <td>{productName}</td>
                            <td>{ticketCount}</td>
                            <td>
                              <span className={styles.ticketBadge} style={{ backgroundColor: getStatusColor(r.status) }}>
                                {statusLabels[r.status] || r.status}
                              </span>
                            </td>
                            <td>
                              <Link href={`/sorteos/${r.id}`} className={styles.viewLink}>
                                Ver detalles →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {tabMyRaffles === 'ganados' && (
            <>
              {wonRaffles.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiStar className={styles.emptyIcon} />
                  <h3>No has ganado sorteos aún</h3>
                  <p>¡Sigue participando! Tus tickets pueden ser los ganadores.</p>
                  <Link href="#raffles" className={styles.buyBtn}>Ver sorteos disponibles</Link>
                </div>
              ) : (
                <div className={styles.rafflesGrid} style={{ gridTemplateColumns: '1fr' }}>
                  {wonRaffles.map((r) => {
                    const productName = r.product?.name || products.find((p) => p.id === r.productId)?.name || 'Premio';
                    const winnerInfo = winnersInfo.get(r.id);
                    return (
                      <div key={r.id} className={styles.raffleCard} style={{ maxWidth: '100%' }}>
                        <div className={styles.raffleHeader}>
                          <h3 className={styles.raffleName}>🏆 {productName}</h3>
                          <span className={styles.statusBadge} style={{ backgroundColor: '#10b981' }}>
                            Ganado
                          </span>
                        </div>
                        <p className={styles.rafflePrice}>
                          Ticket ganador: #{winnerInfo?.ticketNumber ?? '-'}
                        </p>
                        {winnerInfo && user && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                            <DeliveryConfirmation
                              raffleId={r.id}
                              winnerInfo={winnerInfo}
                              userId={user.id}
                              onConfirmSuccess={() => {
                                winnerVerificationService.getWinnerInfo(r.id).then((info) => {
                                  if (info) {
                                    setWinnersInfo((prev) => new Map(prev).set(r.id, info));
                                  }
                                });
                              }}
                            />
                          </div>
                        )}
                        <Link href={`/sorteos/${r.id}/winner`} className={styles.viewLink} style={{ display: 'inline-block', marginTop: '12px' }}>
                          Ver detalles del premio →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Raffles Section */}
        <div id="raffles" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Sorteos Disponibles</h2>
              <p className={styles.sectionSubtitle}>Explora y participa en los sorteos activos</p>
            </div>
          </div>

          {activeRaffles.length === 0 ? (
            <div className={styles.emptyState}>
              <FiShoppingBag className={styles.emptyIcon} />
              <h3>No hay sorteos disponibles</h3>
              <p>En este momento no hay sorteos activos. Vuelve pronto para participar en nuevos sorteos.</p>
            </div>
          ) : (
            <div className={styles.rafflesGrid}>
              {activeRaffles.map((raffle) => {
                const availableTickets = raffle.totalTickets - raffle.soldTickets;
                const progress = raffle.totalTickets > 0 ? (raffle.soldTickets / raffle.totalTickets) * 100 : 0;
                const productName = raffle.product?.name || products.find(p => p.id === raffle.productId)?.name || 'Producto desconocido';
                const productValue = raffle.productValue || raffle.product?.value || products.find(p => p.id === raffle.productId)?.value || 0;
                const quantity = ticketQuantity[raffle.id] || 1;
                const totalPrice = quantity * productValue;
                const canBuy = raffle.status === 'active' && availableTickets > 0;
                const statusLabels: { [key: string]: string } = {
                  'active': 'Activo',
                  'paused': 'Pausado',
                  'sold_out': 'Agotado',
                  'finished': 'Finalizado',
                  'cancelled': 'Cancelado',
                };

                return (
                  <div key={raffle.id} className={styles.raffleCard}>
                    <Link href={`/sorteos/${raffle.id}`} className={styles.raffleImageLink}>
                      <div className={styles.raffleImageContainer}>
                        {(raffle.thumbnail || raffle.product?.mainImage) ? (
                          <Image
                            src={raffle.thumbnail || raffle.product?.mainImage || ''}
                            alt={productName}
                            fill
                            className={styles.raffleImage}
                            sizes="(max-width: 768px) 100vw, 320px"
                          />
                        ) : (
                          <div className={styles.raffleImagePlaceholder}>
                            Sin imagen
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className={styles.raffleCardContent}>
                    <div className={styles.raffleHeader}>
                      <h3 className={styles.raffleName}>{productName}</h3>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(raffle.status) }}
                      >
                        {statusLabels[raffle.status] || raffle.status}
                      </span>
                    </div>

                    <p className={styles.rafflePrice}>
                      S/. {productValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>

                    <div className={styles.progressSection}>
                      <div className={styles.progressInfo}>
                        <span className={styles.progressLabel}>Tickets disponibles:</span>
                        <strong className={styles.progressValue} style={{ color: availableTickets > 0 ? '#10b981' : '#ef4444' }}>
                          {availableTickets.toLocaleString()} / {raffle.totalTickets.toLocaleString()}
                        </strong>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className={styles.progressPercent}>
                        {Math.round(progress)}% vendido
                      </p>
                    </div>

                    {canBuy ? (
                      <div>
                        <div className={styles.quantitySelector}>
                          <button
                            className={styles.quantityBtn}
                            onClick={() => setTicketQuantity({
                              ...ticketQuantity,
                              [raffle.id]: Math.max(1, quantity - 1)
                            })}
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={availableTickets}
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setTicketQuantity({
                                ...ticketQuantity,
                                [raffle.id]: Math.max(1, Math.min(val, availableTickets))
                              });
                            }}
                            className={styles.quantityInput}
                          />
                          <button
                            className={styles.quantityBtn}
                            onClick={() => setTicketQuantity({
                              ...ticketQuantity,
                              [raffle.id]: Math.min(availableTickets, quantity + 1)
                            })}
                            disabled={quantity >= availableTickets}
                          >
                            +
                          </button>
                        </div>
                        <p className={styles.totalPrice}>
                          Total: S/. {totalPrice.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <button
                          onClick={() => handleBuyTickets(raffle.id)}
                          className={styles.buyBtn}
                        >
                          Comprar Tickets
                        </button>
                      </div>
                    ) : (
                      <div className={styles.unavailableBox}>
                        {raffle.status === 'sold_out' && 'Agotado'}
                        {raffle.status === 'finished' && 'Finalizado'}
                        {raffle.status === 'cancelled' && 'Cancelado'}
                        {raffle.status === 'paused' && 'Pausado'}
                      </div>
                    )}
                    <Link href={`/sorteos/${raffle.id}`} className={styles.viewDetailsLink}>
                      Ver detalles →
                    </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tickets Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Mis Tickets</h2>
              <p className={styles.sectionSubtitle}>Revisa todos tus tickets comprados</p>
            </div>
          </div>

          {myTickets.length === 0 ? (
            <div className={styles.emptyState}>
              <FiTag className={styles.emptyIcon} />
              <h3>No tienes tickets</h3>
              <p>No has comprado tickets aún. Participa en los sorteos disponibles para obtener tus primeros tickets.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Sorteo</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {myTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>#{ticket.number}</td>
                      <td>Sorteo</td>
                      <td>
                        <span className={styles.ticketBadge}>
                          {ticket.status}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '13px' }}>
                        {ticket.purchasedAt ? new Date(ticket.purchasedAt).toLocaleDateString('es-PE') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}