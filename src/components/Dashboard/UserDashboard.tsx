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
import { productService } from '@/services/product-service';
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
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<{ [raffleId: string]: number }>({});
  const [expandedTicketsRaffleId, setExpandedTicketsRaffleId] = useState<string | null>(null);
  const [expandedWonRaffleId, setExpandedWonRaffleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) {
          const [activeResult, allProducts] = await Promise.all([
            publicRaffleService.getActiveRaffles({ limit: 100 }),
            productService.getAllProducts(),
          ]);
          setActiveRaffles(activeResult.data.map((r: any) => ({
            ...r,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
          })));
          setProducts(allProducts);
          setMyTickets([]);
          setParticipations([]);
          setWonRaffles([]);
          setWinnersInfo(new Map());
          return;
        }

        const [activeResult, allProducts, tickets, parts, won] = await Promise.all([
          publicRaffleService.getActiveRaffles({ limit: 100 }),
          productService.getAllProducts(),
          ticketAssignmentService.getAllUserTickets(user.id),
          firebaseUserParticipationService.getUserParticipations(user.id),
          firebaseUserParticipationService.getUserWonRaffles(user.id),
        ]);

        setActiveRaffles(activeResult.data.map((r: any) => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        })));
        setProducts(allProducts);
        setMyTickets(tickets.map((t) => ({
          id: t.id,
          raffleId: t.raffleId,
          number: t.ticketNumber,
          status: t.status,
          purchasedAt: t.purchaseDate instanceof Date ? t.purchaseDate.toISOString() : String(t.purchaseDate),
        })));
        setParticipations(parts.map((r) => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as unknown as string),
        })));
        setWonRaffles(won.map((r) => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : (r.createdAt as unknown as string),
        })));

        const winnerResults = await Promise.allSettled(
          won.map((r) => winnerVerificationService.getWinnerInfo(r.id))
        );
        const winMap = new Map<string, WinnerInfo>();
        winnerResults.forEach((result, i) => {
          if (result.status === 'fulfilled' && result.value) winMap.set(won[i].id, result.value);
        });
        setWinnersInfo(winMap);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
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

  return (
    <div className={styles.dashboard}>
      {/* Header: siempre visible para que la página se sienta rápida */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTag}>Panel de Usuario</span>
            <h1 className={styles.title}>Mi Dashboard</h1>
            <p className={styles.subtitle}>Participa en oportunidades y gestiona tus tickets</p>
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
        {/* Contenido visible de inmediato; los datos se cargan en segundo plano como en Admin/Store */}
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Oportunidades Disponibles</div>
                <div className={styles.statValue}>{activeRaffles.length}</div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FiPlay />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>Oportunidades activas para participar</span>
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
                <div className={styles.statLabel}>Mis Oportunidades</div>
                <div className={styles.statValue}>
                  {new Set(myTickets.map((t) => t.raffleId)).size}
                </div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <FiAward />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>Diferentes oportunidades</span>
            </div>
          </div>
        </div>

        {/* Tabs: Mis Oportunidades / Oportunidades ganadas */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={tabMyRaffles === 'participados' ? styles.tabActive : styles.tab}
                onClick={() => setTabMyRaffles('participados')}
              >
                <FiTag style={{ marginRight: '6px' }} />
                Mis Oportunidades
              </button>
              <button
                type="button"
                className={tabMyRaffles === 'ganados' ? styles.tabActive : styles.tab}
                onClick={() => setTabMyRaffles('ganados')}
              >
                <FiStar style={{ marginRight: '6px' }} />
                Oportunidades ganadas
              </button>
            </div>
          </div>

          {tabMyRaffles === 'participados' && (
            <>
              {participations.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiTag className={styles.emptyIcon} />
                  <h3>No has participado en oportunidades</h3>
                  <p>Compra tickets en las oportunidades disponibles para aparecer aquí.</p>
                  <Link href="#raffles" className={styles.buyBtn}>Ver oportunidades disponibles</Link>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Oportunidad</th>
                        <th>Tickets</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participations.map((r) => {
                        const ticketsForRaffle = myTickets.filter((t) => t.raffleId === r.id);
                        const ticketCount = ticketsForRaffle.length;
                        const productName = r.product?.name || products.find((p) => p.id === r.productId)?.name || 'Sorteo';
                        const hasWon = wonRaffles.some((wr) => wr.id === r.id);
                        const displayStatus = hasWon ? 'Ganado' : (r.status === 'active' || r.status === 'paused' || r.status === 'sold_out' ? 'Activo' : 'Finalizado');
                        const statusColors: { [key: string]: string } = {
                          Activo: '#2196F3',
                          Finalizado: '#64748b',
                          Ganado: '#10b981',
                        };
                        const isExpanded = expandedTicketsRaffleId === r.id;
                        return (
                          <React.Fragment key={r.id}>
                            <tr>
                              <td>{productName}</td>
                              <td>
                                <span style={{ marginRight: '8px' }}>{ticketCount}</span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTicketsRaffleId(isExpanded ? null : r.id)}
                                  className={styles.viewLink}
                                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Ver
                                </button>
                              </td>
                              <td>
                                <span className={styles.ticketBadge} style={{ backgroundColor: statusColors[displayStatus] || '#64748b' }}>
                                  {displayStatus}
                                </span>
                              </td>
                              <td>
                                <Link href={`/sorteos/${r.id}`} className={styles.viewLink}>
                                  Ver detalles →
                                </Link>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={4} style={{ padding: '0 16px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                  <div style={{ padding: '12px 16px', fontSize: '14px' }}>
                                    <strong style={{ color: '#475569', marginBottom: '8px', display: 'block' }}>Tus tickets:</strong>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                      {ticketsForRaffle.length > 0 ? (
                                        ticketsForRaffle.map((t) => (
                                          <span key={t.id} style={{ padding: '4px 10px', backgroundColor: '#e2e8f0', borderRadius: '6px', fontWeight: 600 }}>
                                            #{t.number}
                                          </span>
                                        ))
                                      ) : (
                                        <span style={{ color: '#64748b' }}>Sin tickets</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
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
                  <h3>No has ganado oportunidades aún</h3>
                  <p>¡Sigue participando! Tus tickets pueden ser los ganadores.</p>
                  <Link href="#raffles" className={styles.buyBtn}>Ver oportunidades disponibles</Link>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Oportunidad</th>
                        <th>Ticket ganador</th>
                        <th>Estado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {wonRaffles.map((r) => {
                        const productName = r.product?.name || products.find((p) => p.id === r.productId)?.name || 'Premio';
                        const winnerInfo = winnersInfo.get(r.id);
                        const isExpanded = expandedWonRaffleId === r.id;
                        return (
                          <React.Fragment key={r.id}>
                            <tr
                              onClick={() => setExpandedWonRaffleId(isExpanded ? null : r.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>🏆 {productName}</td>
                              <td>#{winnerInfo?.ticketNumber ?? '-'}</td>
                              <td>
                                <span className={styles.ticketBadge} style={{ backgroundColor: '#10b981' }}>
                                  Ganado
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={4} style={{ padding: 0, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                  <div style={{ padding: '20px 24px' }} onClick={(e) => e.stopPropagation()}>
                                    {winnerInfo && user && (
                                      <div style={{ marginBottom: '16px' }}>
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
                                    <Link href={`/sorteos/${r.id}/winner`} className={styles.viewLink}>
                                      Ver detalles del premio →
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Raffles Section */}
        <div id="raffles" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Oportunidades Disponibles</h2>
              <p className={styles.sectionSubtitle}>Explora y participa en las oportunidades activas</p>
            </div>
          </div>

          {activeRaffles.length === 0 ? (
            <div className={styles.emptyState}>
              <FiShoppingBag className={styles.emptyIcon} />
              <h3>No hay oportunidades disponibles</h3>
              <p>En este momento no hay oportunidades activas. Vuelve pronto para participar en nuevas oportunidades.</p>
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
                    <th>Oportunidad</th>
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