'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
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
  FiGrid
} from 'react-icons/fi';
import Logo from '@/components/Logo';
import styles from './StoreDashboard.module.css';

type TabType = 'overview' | 'products' | 'raffles';

export default function StoreDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with Firebase calls
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRaffles: 0,
    ticketsSold: 0,
    totalRevenue: 0
  });

  const [products, setProducts] = useState<any[]>([]);
  const [raffles, setRaffles] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // TODO: Load data from Firebase
      // const productsData = await firebaseProductService.getShopProducts(user?.shopId);
      // const rafflesData = await firebaseRaffleService.getShopRaffles(user?.shopId);
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
    } finally {
      setIsLoading(false);
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

  const handleCreateProduct = () => {
    // TODO: Open create product modal
    console.log('Create product');
  };

  const handleCreateRaffle = () => {
    // TODO: Open create raffle modal
    console.log('Create raffle');
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Logo size="small" showText={false} imageSize={36} />
            <div>
              <h1 className={styles.title}>Panel de Tienda</h1>
              <p className={styles.subtitle}>Gestiona tus productos y sorteos</p>
            </div>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userRole}>Tienda</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabs}>
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiGrid />
            <span>Resumen</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FiPackage />
            <span>Productos</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'raffles' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('raffles')}
          >
            <FiShoppingBag />
            <span>Sorteos</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <FiPackage />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Productos</span>
                  <span className={styles.statValue}>{stats.totalProducts}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <FiShoppingBag />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Sorteos Activos</span>
                  <span className={styles.statValue}>{stats.totalRaffles}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <FiTrendingUp />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Tickets Vendidos</span>
                  <span className={styles.statValue}>{stats.ticketsSold}</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <FiDollarSign />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>Ingresos Totales</span>
                  <span className={styles.statValue}>S/. {stats.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
              <div className={styles.actionsGrid}>
                <button className={styles.actionCard} onClick={handleCreateProduct}>
                  <div className={styles.actionIcon}>
                    <FiPlus />
                  </div>
                  <div className={styles.actionContent}>
                    <span className={styles.actionTitle}>Crear Producto</span>
                    <span className={styles.actionDesc}>Agrega un nuevo producto a tu catálogo</span>
                  </div>
                </button>

                <button className={styles.actionCard} onClick={handleCreateRaffle}>
                  <div className={styles.actionIcon}>
                    <FiPlus />
                  </div>
                  <div className={styles.actionContent}>
                    <span className={styles.actionTitle}>Crear Sorteo</span>
                    <span className={styles.actionDesc}>Inicia un nuevo sorteo con tus productos</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mis Productos</h2>
              <button className={styles.createBtn} onClick={handleCreateProduct}>
                <FiPlus />
                <span>Nuevo Producto</span>
              </button>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <FiPackage className={styles.emptyIcon} />
                <h3>No tienes productos</h3>
                <p>Comienza creando tu primer producto para poder crear sorteos</p>
                <button className={styles.createBtn} onClick={handleCreateProduct}>
                  <FiPlus />
                  <span>Crear Producto</span>
                </button>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>S/. {product.price}</td>
                        <td>
                          <span className={styles.badge}>{product.status}</span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.actionBtn}>
                              <FiEye />
                            </button>
                            <button className={styles.actionBtn}>
                              <FiEdit2 />
                            </button>
                            <button className={styles.actionBtn}>
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
        )}

        {activeTab === 'raffles' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mis Sorteos</h2>
              <button className={styles.createBtn} onClick={handleCreateRaffle}>
                <FiPlus />
                <span>Nuevo Sorteo</span>
              </button>
            </div>

            {raffles.length === 0 ? (
              <div className={styles.emptyState}>
                <FiShoppingBag className={styles.emptyIcon} />
                <h3>No tienes sorteos</h3>
                <p>Crea tu primer sorteo para comenzar a vender tickets</p>
                <button className={styles.createBtn} onClick={handleCreateRaffle}>
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
                            <button className={styles.actionBtn}>
                              <FiEye />
                            </button>
                            <button className={styles.actionBtn}>
                              <FiEdit2 />
                            </button>
                            <button className={styles.actionBtn}>
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
        )}
      </main>
    </div>
  );
}