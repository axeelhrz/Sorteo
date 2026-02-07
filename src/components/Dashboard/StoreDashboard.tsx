'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FiLogOut, 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign, 
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCreditCard,
  FiDownload
} from 'react-icons/fi';
import { firebaseShopService } from '@/services/firebase-shop-service';
import { raffleService } from '@/services/raffle-service';
import { raffleUpdateService } from '@/services/raffle-update-service';
import { Shop } from '@/types/shop';
import { Raffle, WinnerInfo } from '@/types/raffle';
import CreateRaffleModal from './CreateRaffleModal';
import RaffleModals from './RaffleModals';
import styles from './StoreDashboard.module.css';

type TabType = 'overview' | 'raffles' | 'earnings';

export default function StoreDashboard() {
  const router = useRouter();
  const { user, logout, isHydrated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [, setLoadingShop] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Mock data - Replace with Firebase calls
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRaffles: 0,
    ticketsSold: 0,
    totalRevenue: 0
  });

  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [raffleStatusFilter, setRaffleStatusFilter] = useState<'all' | 'active' | 'finished' | 'draft'>('all');
  const [deposits] = useState<any[]>([]);
  const [viewModal, setViewModal] = useState({ isOpen: false, raffle: null as Raffle | null });
  const [activateModal, setActivateModal] = useState({ isOpen: false, raffleId: null as string | null, raffleName: null as string | null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, raffleId: null as string | null, raffleName: null as string | null });
  const [isEditingOrgName, setIsEditingOrgName] = useState(false);
  const [editingOrgName, setEditingOrgName] = useState('');

  useEffect(() => {
    if (!isHydrated || !user) return;
    loadShop();
  }, [user, isHydrated]);

  // Cargar datos cuando la tienda esté disponible
  useEffect(() => {
    if (shop?.id) {
      loadData();
    }
  }, [shop?.id]);

  const loadShop = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    try {
      setLoadingShop(true);
      
      // Si el usuario tiene shopId, intenta obtener la tienda por ID
      if (user.shopId) {
        try {
          const shopData = await firebaseShopService.getShopById(user.shopId);
          setShop(shopData);
          return;
        } catch (error) {
          console.warn('Could not load shop by shopId, trying by userId:', error);
        }
      }
      
      // Si no tiene shopId o falló, intenta obtener la tienda por userId
      const allShops = await firebaseShopService.getAllShops();
      const userShop = allShops.find(shop => shop.userId === user.id);
      
      if (userShop) {
        setShop(userShop);
        console.log('Shop loaded by userId:', userShop);
      } else {
        console.error('No shop found for user:', user.id);
      }
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoadingShop(false);
    }
  };

  const loadData = async () => {
    if (!shop?.id) {
      console.warn('No shop ID available for loading data');
      return;
    }

    try {
      // Cargar sorteos del organizador
      const rafflesData = await raffleService.getRafflesByShop(shop.id);
      setRaffles(rafflesData || []);

      // Actualizar estadísticas
      setStats({
        totalProducts: 0,
        totalRaffles: rafflesData?.length || 0,
        ticketsSold: 0,
        totalRevenue: 0
      });

      console.log('Raffles loaded:', rafflesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setRaffles([]);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/');
    }
  };

  const handleSaveOrgName = async () => {
    if (!shop?.id || !editingOrgName.trim()) {
      setIsEditingOrgName(false);
      return;
    }
    try {
      await firebaseShopService.updateShopName(shop.id, editingOrgName.trim());
      setShop((prev) => prev ? { ...prev, name: editingOrgName.trim() } : null);
      setIsEditingOrgName(false);
    } catch (error) {
      console.error('Error updating organizer name:', error);
    }
  };

  const handleStartEditOrgName = () => {
    if (!shop) return;
    setEditingOrgName(shop.name || '');
    setIsEditingOrgName(true);
  };

  const handleCreateRaffle = () => {
    console.log('handleCreateRaffle called');
    console.log('shop:', shop);
    console.log('user:', user);
    
    if (!shop) {
      console.error('No shop found. User ID:', user?.id, 'User shopId:', user?.shopId);
      // Intenta cargar la tienda nuevamente
      loadShop();
      return;
    }
    
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleRaffleCreated = () => {
    setShowCreateModal(false);
    // Recargar sorteos después de crear uno nuevo
    setTimeout(() => {
      loadData();
    }, 1000);
  };

  const handleViewRaffle = (raffle: Raffle) => {
    setViewModal({ isOpen: true, raffle });
  };

  const handleOpenActivateModal = (raffleId: string, raffleName: string) => {
    setActivateModal({ isOpen: true, raffleId, raffleName });
  };

  const handleOpenDeleteModal = (raffleId: string, raffleName: string) => {
    setDeleteModal({ isOpen: true, raffleId, raffleName });
  };

  const handleConfirmActivate = async (raffleId: string) => {
    try {
      await raffleUpdateService.activateRaffle(raffleId);
      loadData();
    } catch (error) {
      console.error('Error activating raffle:', error);
      alert('Error al activar el sorteo');
    }
  };

  const handleConfirmDelete = async (raffleId: string) => {
    try {
      await raffleUpdateService.deleteRaffle(raffleId);
      loadData();
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Error al eliminar el sorteo');
    }
  };

  // Prevent hydration mismatch by not rendering user-dependent content until hydrated
  if (!isHydrated) {
    return (
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <span className={styles.headerTag}>Panel de Control</span>
              <h1 className={styles.title}>Panel de Organizador</h1>
              <p className={styles.subtitle}>Gestiona tus Oportunidades</p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.userCard}>
                <div className={styles.userAvatar}>-</div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>Cargando...</span>
                  <span className={styles.userRole}>Organizador</span>
                </div>
              </div>
              <button className={styles.logoutBtn} disabled>
                <FiLogOut />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <span className={styles.headerTag}>Panel de Control</span>
            <h1 className={styles.title}>Panel de Organizador</h1>
            <p className={styles.subtitle}>Gestiona tus Oportunidades</p>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                {(shop?.name || user?.name || 'O').charAt(0).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                {isEditingOrgName ? (
                  <input
                    type="text"
                    value={editingOrgName}
                    onChange={(e) => setEditingOrgName(e.target.value)}
                    onBlur={handleSaveOrgName}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveOrgName()}
                    className={styles.orgNameInput}
                    autoFocus
                  />
                ) : (
                  <span
                    className={styles.userName}
                    onClick={shop ? handleStartEditOrgName : undefined}
                    title={shop ? 'Haz clic para editar' : undefined}
                    style={shop ? undefined : { cursor: 'default' }}
                  >
                    {shop?.name || 'Organizador'}
                    <FiEdit2 className={styles.editIcon} />
                  </span>
                )}
                <span className={styles.userRole}>Organizador</span>
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
        {/* Tabs Navigation */}
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiPackage />
            <span>Resumen</span>
          </button>
          <button 
            className={styles.tab}
            onClick={handleCreateRaffle}
            type="button"
          >
            <FiPlus />
            <span>Crear Oportunidad</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'raffles' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('raffles')}
          >
            <FiShoppingBag />
            <span>Mis Oportunidades</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'earnings' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <FiDollarSign />
            <span>Ganancias</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Oportunidades Activas</div>
                <div className={styles.statValue}>{stats.totalRaffles}</div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <FiShoppingBag />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>↑ 0% este mes</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Ingresos Totales</div>
                <div className={styles.statValue}>S/. {stats.totalRevenue.toFixed(2)}</div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <FiDollarSign />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>↑ 0% este mes</span>
            </div>
          </div>
        </div>

          </>
        )}

        {activeTab === 'raffles' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Mis Oportunidades</h2>
                <p className={styles.sectionSubtitle}>Gestiona todas tus oportunidades: activas, en progreso y finalizadas</p>
              </div>
              <button className={styles.createBtn} onClick={handleCreateRaffle} title="Crear una nueva oportunidad" type="button">
                <FiPlus />
                <span>Nueva Oportunidad</span>
              </button>
            </div>

            {/* Filtros por estado */}
            {raffles.length > 0 && (
              <div className={styles.raffleFilters}>
                <button
                  type="button"
                  className={`${styles.raffleFilterChip} ${raffleStatusFilter === 'all' ? styles.raffleFilterChipActive : ''}`}
                  onClick={() => setRaffleStatusFilter('all')}
                >
                  Todos ({raffles.length})
                </button>
                <button
                  type="button"
                  className={`${styles.raffleFilterChip} ${raffleStatusFilter === 'active' ? styles.raffleFilterChipActive : ''}`}
                  onClick={() => setRaffleStatusFilter('active')}
                >
                  Activos ({raffles.filter((r) => ['active', 'pending_approval', 'paused', 'sold_out'].includes(r.status)).length})
                </button>
                <button
                  type="button"
                  className={`${styles.raffleFilterChip} ${raffleStatusFilter === 'finished' ? styles.raffleFilterChipActive : ''}`}
                  onClick={() => setRaffleStatusFilter('finished')}
                >
                  Finalizados ({raffles.filter((r) => r.status === 'finished').length})
                </button>
                <button
                  type="button"
                  className={`${styles.raffleFilterChip} ${raffleStatusFilter === 'draft' ? styles.raffleFilterChipActive : ''}`}
                  onClick={() => setRaffleStatusFilter('draft')}
                >
                  Borradores ({raffles.filter((r) => r.status === 'draft').length})
                </button>
              </div>
            )}

            {(() => {
              const filteredRaffles = raffleStatusFilter === 'all'
                ? raffles
                : raffleStatusFilter === 'active'
                  ? raffles.filter((r) => ['active', 'pending_approval', 'paused', 'sold_out'].includes(r.status))
                  : raffleStatusFilter === 'finished'
                    ? raffles.filter((r) => r.status === 'finished')
                    : raffles.filter((r) => r.status === 'draft');
              return filteredRaffles.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiShoppingBag className={styles.emptyIcon} />
                  <h3>
                    {raffleStatusFilter === 'all' ? 'No tienes oportunidades' : raffleStatusFilter === 'finished' ? 'No hay oportunidades finalizadas' : raffleStatusFilter === 'draft' ? 'No hay borradores' : 'No hay oportunidades activas'}
                  </h3>
                  <p>
                    {raffleStatusFilter === 'all'
                      ? 'Crea tu primera oportunidad para comenzar a vender tickets y generar ingresos'
                      : 'Cambia el filtro para ver otros estados'}
                  </p>
                  {raffleStatusFilter !== 'all' && (
                    <button type="button" className={styles.createBtn} onClick={() => setRaffleStatusFilter('all')}>
                      Ver todos
                    </button>
                  )}
                  {raffleStatusFilter === 'all' && (
                    <button className={styles.createBtn} onClick={handleCreateRaffle} type="button">
                      <FiPlus />
                      <span>Crear Oportunidad</span>
                    </button>
                  )}
                </div>
              ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Oportunidad</th>
                      <th>Tickets</th>
                      <th>Valor del Producto</th>
                      <th>Estado</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRaffles.map((raffle) => (
                      <tr key={raffle.id}>
                        <td>
                          <div className={styles.raffleInfo}>
                            <div className={styles.raffleName}>
                              {raffle.product?.name || 'Producto sin nombre'}
                            </div>
                            <div className={styles.raffleId}>
                              ID: {raffle.id.substring(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.ticketsInfo}>
                            <span className={styles.ticketsCount}>
                              {raffle.soldTickets}/{raffle.totalTickets}
                            </span>
                            <div className={styles.progressBar}>
                              <div 
                                className={styles.progressFill}
                                style={{ width: `${(raffle.soldTickets / raffle.totalTickets) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.price}>
                            S/. {raffle.productValue.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${styles[`badge${raffle.status}`]}`}>
                            {raffle.status === 'draft' && 'Borrador'}
                            {raffle.status === 'pending_approval' && 'Pendiente'}
                            {raffle.status === 'active' && 'Activo'}
                            {raffle.status === 'paused' && 'Pausado'}
                            {raffle.status === 'sold_out' && 'Agotado'}
                            {raffle.status === 'finished' && 'Finalizado'}
                            {raffle.status === 'cancelled' && 'Cancelado'}
                            {raffle.status === 'rejected' && 'Rechazado'}
                          </span>
                        </td>
                        <td>
                          <span className={styles.date}>
                            {new Date(raffle.createdAt).toLocaleDateString('es-PE')}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button 
                              className={styles.actionBtn} 
                              title="Ver detalles"
                              onClick={() => handleViewRaffle(raffle)}
                            >
                              <FiEye />
                              <span className={styles.actionBtnLabel}>Ver</span>
                            </button>
                            <button 
                              className={styles.actionBtn} 
                              title="Activar oportunidad"
                              onClick={() => handleOpenActivateModal(raffle.id, raffle.product?.name || 'Oportunidad')}
                              disabled={raffle.status !== 'draft'}
                            >
                              <FiEdit2 />
                              <span className={styles.actionBtnLabel}>Activar</span>
                            </button>
                            <button 
                              className={styles.actionBtn} 
                              title="Eliminar"
                              onClick={() => handleOpenDeleteModal(raffle.id, raffle.product?.name || 'Oportunidad')}
                            >
                              <FiTrash2 />
                              <span className={styles.actionBtnLabel}>Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Ganancias</h2>
                <p className={styles.sectionSubtitle}>Historial de ingresos y depósitos</p>
              </div>
              <button className={styles.createBtn} type="button">
                <FiDownload />
                <span>Exportar</span>
              </button>
            </div>

            {/* Earnings Stats */}
            <div className={styles.earningsGrid}>
              <div className={styles.earningCard}>
                <div className={styles.earningLabel}>Total Acumulado</div>
                <div className={styles.earningValue}>S/. {stats.totalRevenue.toFixed(2)}</div>
                <div className={styles.earningChange}>+0% este mes</div>
              </div>
              <div className={styles.earningCard}>
                <div className={styles.earningLabel}>Pendiente de Cobro</div>
                <div className={styles.earningValue}>S/. 0.00</div>
                <div className={styles.earningChange}>0 transacciones</div>
              </div>
              <div className={styles.earningCard}>
                <div className={styles.earningLabel}>Cobrado Este Mes</div>
                <div className={styles.earningValue}>S/. 0.00</div>
                <div className={styles.earningChange}>0 depósitos</div>
              </div>
            </div>

            {deposits.length === 0 ? (
              <div className={styles.emptyState}>
                <FiCreditCard className={styles.emptyIcon} />
                <h3>Sin depósitos registrados</h3>
                <p>Aquí verás el historial de tus depósitos y ganancias</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((deposit) => (
                      <tr key={deposit.id}>
                        <td>{deposit.date}</td>
                        <td>{deposit.concept}</td>
                        <td>S/. {deposit.amount}</td>
                        <td>
                          <span className={styles.badge}>{deposit.status}</span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.actionBtn} title="Ver">
                              <FiEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Create Raffle Modal */}
      <CreateRaffleModal
        isOpen={showCreateModal}
        shop={shop}
        onClose={handleCloseModal}
        onSuccess={handleRaffleCreated}
      />

      {/* Raffle Modals */}
      <RaffleModals
        viewModal={viewModal}
        activateModal={activateModal}
        deleteModal={deleteModal}
        onCloseViewModal={() => setViewModal({ isOpen: false, raffle: null })}
        onCloseActivateModal={() => setActivateModal({ isOpen: false, raffleId: null, raffleName: null })}
        onCloseDeleteModal={() => setDeleteModal({ isOpen: false, raffleId: null, raffleName: null })}
        onConfirmActivate={handleConfirmActivate}
        onConfirmDelete={handleConfirmDelete}
        onValidationSuccess={(winnerInfo: WinnerInfo) => {
          if (viewModal.raffle) {
            setViewModal((prev) => ({
              ...prev,
              raffle: { ...prev.raffle!, winnerInfo },
            }));
          }
          loadData();
        }}
        currentUserId={user?.id}
        onEvidenceUploadSuccess={(winnerInfo: WinnerInfo) => {
          if (viewModal.raffle) {
            setViewModal((prev) => ({
              ...prev,
              raffle: { ...prev.raffle!, winnerInfo },
            }));
          }
          loadData();
        }}
      />
    </div>
  );
}