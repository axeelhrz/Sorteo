'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FiLogOut, 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX
} from 'react-icons/fi';
import { CreateRaffleForm } from '@/components/ShopPanel/CreateRaffleForm';
import { firebaseShopService } from '@/services/firebase-shop-service';
import { Shop } from '@/types/shop';
import styles from './StoreDashboard.module.css';

export default function StoreDashboard() {
  const router = useRouter();
  const { user, logout, isHydrated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [, setLoadingShop] = useState(true);

  // Mock data - Replace with Firebase calls
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRaffles: 0,
    ticketsSold: 0,
    totalRevenue: 0
  });

  const [raffles] = useState<any[]>([]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    loadData();
    loadShop();
  }, [user, isHydrated]);

  const loadShop = async () => {
    if (!user?.shopId) return;
    
    try {
      setLoadingShop(true);
      const shopData = await firebaseShopService.getShopById(user.shopId);
      setShop(shopData);
    } catch (error) {
      console.error('Error loading shop:', error);
    } finally {
      setLoadingShop(false);
    }
  };

  const loadData = async () => {
    try {
      // TODO: Load data from Firebase
      // const productsData = await firebaseProductService.getShopProducts(user?.shopId);
      // const rafflesData = await firebaseRaffleService.getShopRaffles(user?.shopId);
      // When implementing, uncomment the setters:
      // const [products, setProducts] = useState<any[]>([]);
      // const [raffles, setRaffles] = useState<any[]>([]);
      // setProducts(productsData);
      // setRaffles(rafflesData);
      
      setStats({
        totalProducts: 0,
        totalRaffles: 0,
        ticketsSold: 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
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

  const handleCreateRaffle = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleRaffleCreated = () => {
    setShowCreateModal(false);
    loadData(); // Reload data after creating raffle
  };

  const handleViewRaffles = () => {
    router.push('/panel/sorteos');
  };

  const handleViewEarnings = () => {
    router.push('/shop/deposits');
  };

  const handleViewStats = () => {
    router.push('/panel/estadisticas');
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
              <p className={styles.subtitle}>Gestiona tus sorteos y productos</p>
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
            <p className={styles.subtitle}>Gestiona tus sorteos y productos</p>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase() || '-'}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name || 'Usuario'}</span>
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
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Productos</div>
                <div className={styles.statValue}>{stats.totalProducts}</div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FiPackage />
              </div>
            </div>
            <div className={styles.statChange}>
              <span>↑ 0% este mes</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div>
                <div className={styles.statLabel}>Sorteos Activos</div>
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
                <div className={styles.statLabel}>Tickets Vendidos</div>
                <div className={styles.statValue}>{stats.ticketsSold}</div>
              </div>
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <FiTrendingUp />
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

        {/* Quick Actions Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
              <p className={styles.sectionSubtitle}>Accede rápidamente a las funciones principales</p>
            </div>
          </div>

          <div className={styles.actionsGrid}>
            <button className={styles.actionCard} onClick={handleCreateRaffle} title="Crear un nuevo sorteo">
              <div className={styles.actionIcon}>
                <FiPlus />
              </div>
              <div className={styles.actionTitle}>Crear Sorteo</div>
              <div className={styles.actionDesc}>Nuevo sorteo</div>
            </button>

            <button className={styles.actionCard} onClick={handleViewRaffles} title="Ver todos tus sorteos activos">
              <div className={styles.actionIcon}>
                <FiShoppingBag />
              </div>
              <div className={styles.actionTitle}>Mis Sorteos</div>
              <div className={styles.actionDesc}>Ver todos</div>
            </button>

            <button className={styles.actionCard} onClick={handleViewEarnings} title="Revisa tus ganancias totales">
              <div className={styles.actionIcon}>
                <FiDollarSign />
              </div>
              <div className={styles.actionTitle}>Ganancias</div>
              <div className={styles.actionDesc}>Ingresos</div>
            </button>

            <button className={styles.actionCard} onClick={handleViewStats} title="Ver estadísticas y análisis">
              <div className={styles.actionIcon}>
                <FiTrendingUp />
              </div>
              <div className={styles.actionTitle}>Estadísticas</div>
              <div className={styles.actionDesc}>Análisis</div>
            </button>
          </div>
        </div>

        {/* Raffles Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Mis Sorteos</h2>
              <p className={styles.sectionSubtitle}>Gestiona todos tus sorteos activos y en progreso</p>
            </div>
            <button className={styles.createBtn} onClick={handleCreateRaffle} title="Crear un nuevo sorteo" type="button">
              <FiPlus />
              <span>Nuevo Sorteo</span>
            </button>
          </div>

          {raffles.length === 0 ? (
            <div className={styles.emptyState}>
              <FiShoppingBag className={styles.emptyIcon} />
              <h3>No tienes sorteos</h3>
              <p>Crea tu primer sorteo para comenzar a vender tickets y generar ingresos</p>
              <button className={styles.createBtn} onClick={handleCreateRaffle} type="button">
                <FiPlus />
                <span>Crear Sorteo</span>
              </button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sorteo</th>
                    <th>Producto</th>
                    <th>Tickets</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {raffles.map((raffle) => (
                    <tr key={raffle.id}>
                      <td>{raffle.title}</td>
                      <td>{raffle.productName}</td>
                      <td>{raffle.soldTickets}/{raffle.totalTickets}</td>
                      <td>S/. {raffle.ticketPrice}</td>
                      <td>
                        <span className={styles.badge}>{raffle.status}</span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} title="Ver">
                            <FiEye />
                          </button>
                          <button className={styles.actionBtn} title="Editar">
                            <FiEdit2 />
                          </button>
                          <button className={styles.actionBtn} title="Eliminar">
                            <FiTrash2 />
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
      </main>

      {/* Create Raffle Modal */}
      {showCreateModal && shop && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Crear Nuevo Sorteo</h2>
              <button className={styles.modalCloseBtn} onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <CreateRaffleForm 
                shop={shop} 
                onSuccess={handleRaffleCreated}
                onCancel={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}