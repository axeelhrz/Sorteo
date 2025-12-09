'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiLogOut, FiPlay, FiTag, FiAward } from 'react-icons/fi';
import Logo from '@/components/Logo';
import styles from '@/app/dashboard/dashboard.module.css';

interface Raffle {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    value: number;
  };
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

interface Product {
  id: string;
  name: string;
  value: number;
}

type TabType = 'overview' | 'raffles' | 'tickets';

export default function UserDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeRaffles, setActiveRaffles] = useState<Raffle[]>([]);
  const [myTickets, setMyTickets] = useState<RaffleTicket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState<{ [raffleId: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener sorteos activos
        const { raffleService } = await import('@/services/raffle-service');
        const allRaffles = await raffleService.getAllRaffles();
        const visibleRaffles = allRaffles.filter((r: any) => 
          r.status !== 'draft' && r.status !== 'rejected' && r.status !== 'pending_approval'
        );
        setActiveRaffles(visibleRaffles.map((r: any) => ({
          ...r,
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
        })));

        // Obtener productos
        const { productService } = await import('@/services/product-service');
        const allProducts = await productService.getAllProducts();
        setProducts(allProducts);

        // Obtener tickets del usuario (por ahora vacío)
        setMyTickets([]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      const { paymentService } = await import('@/services/payment-service');
      const productValue = raffle.productValue || raffle.product?.value || 0;
      const totalPrice = quantity * productValue;

      const payment = await paymentService.createPayment({
        raffleId: raffle.id,
        amount: totalPrice,
        ticketQuantity: quantity,
      });

      router.push(`/checkout?paymentId=${payment.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la compra');
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
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Logo size="small" showText={false} />
            <h1>Mi Dashboard</h1>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <span>{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user?.name}</p>
                <p className={styles.email}>{user?.email}</p>
                <span className={styles.role}>Usuario</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut className={styles.logoutIcon} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Resumen
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'raffles' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('raffles')}
        >
          Sorteos Disponibles ({activeRaffles.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tickets' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Mis Tickets ({myTickets.length})
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FiPlay />
              </div>
              <h3>Sorteos Disponibles</h3>
              <p className={styles.bigNumber}>{activeRaffles.length}</p>
              <p className={styles.subtitle}>Sorteos activos para participar</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FiTag />
              </div>
              <h3>Mis Tickets</h3>
              <p className={styles.bigNumber}>{myTickets.length}</p>
              <p className={styles.subtitle}>Tickets comprados</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <FiAward />
              </div>
              <h3>Sorteos Participados</h3>
              <p className={styles.bigNumber}>
                {new Set(myTickets.map(t => t.raffleId)).size}
              </p>
              <p className={styles.subtitle}>Diferentes sorteos</p>
            </div>
          </div>
        )}

        {/* Raffles Tab */}
        {activeTab === 'raffles' && (
          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600', color: '#333' }}>
              Sorteos Disponibles
            </h2>
            
            {activeRaffles.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                color: '#666'
              }}>
                <p>No hay sorteos disponibles en este momento</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
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
                    <div key={raffle.id} style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      opacity: raffle.status === 'cancelled' || raffle.status === 'finished' ? 0.7 : 1,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}>
                      {/* Encabezado */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: '600', flex: 1 }}>
                          {productName}
                        </h3>
                        <span style={{
                          backgroundColor: getStatusColor(raffle.status),
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          marginLeft: '10px'
                        }}>
                          {statusLabels[raffle.status] || raffle.status}
                        </span>
                      </div>

                      {/* Precio */}
                      <p style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#1976d2',
                        margin: '10px 0 15px 0'
                      }}>
                        S/. {productValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>

                      {/* Progreso de Tickets */}
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                          <span style={{ color: '#666' }}>Tickets disponibles:</span>
                          <strong style={{ color: availableTickets > 0 ? '#4CAF50' : '#F44336' }}>
                            {availableTickets.toLocaleString()} / {raffle.totalTickets.toLocaleString()}
                          </strong>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            backgroundColor: progress >= 100 ? '#4CAF50' : '#2196F3',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <p style={{ fontSize: '12px', color: '#999', margin: '5px 0 0 0' }}>
                          {Math.round(progress)}% vendido
                        </p>
                      </div>

                      {/* Selector de Cantidad y Botón */}
                      {canBuy ? (
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                            <button
                              onClick={() => setTicketQuantity({
                                ...ticketQuantity,
                                [raffle.id]: Math.max(1, quantity - 1)
                              })}
                              disabled={quantity <= 1}
                              style={{
                                padding: '6px 10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                opacity: quantity <= 1 ? 0.5 : 1
                              }}
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
                              style={{
                                width: '50px',
                                padding: '6px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}
                            />
                            <button
                              onClick={() => setTicketQuantity({
                                ...ticketQuantity,
                                [raffle.id]: Math.min(availableTickets, quantity + 1)
                              })}
                              disabled={quantity >= availableTickets}
                              style={{
                                padding: '6px 10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                                cursor: quantity >= availableTickets ? 'not-allowed' : 'pointer',
                                opacity: quantity >= availableTickets ? 0.5 : 1
                              }}
                            >
                              +
                            </button>
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: '600', margin: '8px 0', color: '#333' }}>
                            Total: S/. {totalPrice.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <button
                            onClick={() => handleBuyTickets(raffle.id)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: '#2196F3',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                          >
                            Comprar Tickets
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '6px',
                          textAlign: 'center',
                          color: '#999',
                          fontSize: '13px'
                        }}>
                          {raffle.status === 'sold_out' && 'Agotado'}
                          {raffle.status === 'finished' && 'Finalizado'}
                          {raffle.status === 'cancelled' && 'Cancelado'}
                          {raffle.status === 'paused' && 'Pausado'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600', color: '#333' }}>
              Mis Tickets
            </h2>
            
            {myTickets.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                color: '#666'
              }}>
                <p>No has comprado tickets aún. Participa en los sorteos disponibles.</p>
              </div>
            ) : (
              <div style={{
                overflowX: 'auto',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: '#fff'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Ticket</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Sorteo</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Estado</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTickets.map((ticket) => (
                      <tr key={ticket.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '12px', color: '#333' }}>#{ticket.number}</td>
                        <td style={{ padding: '12px', color: '#666' }}>Sorteo</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            backgroundColor: '#2196F3',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {ticket.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#999', fontSize: '13px' }}>
                          {ticket.purchasedAt ? new Date(ticket.purchasedAt).toLocaleDateString('es-PE') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}