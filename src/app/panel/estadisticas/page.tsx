'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { Shop } from '@/types/shop';
import { shopService } from '@/services/shop-service';
import { ShopHeader } from '@/components/ShopPanel/ShopHeader';
import { ShopSidebar } from '@/components/ShopPanel/ShopSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/app/panel/panel.module.css';

interface ShopStatistics {
  raffles: {
    total: number;
    draft: number;
    pendingApproval: number;
    active: number;
    soldOut: number;
    finished: number;
    cancelled: number;
  };
  tickets: {
    totalSold: number;
    totalAvailable: number;
    thisMonth: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    completedPayments: number;
  };
  products: {
    total: number;
    active: number;
    withDeposit: number;
  };
  conversionRate: number;
}

export default function StatisticsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [statistics, setStatistics] = useState<ShopStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const shopData = await shopService.getMyShop();
      setShop(shopData);
      const stats = await shopService.getShopStatistics(shopData.id);
      setStatistics(stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.SHOP}>
      <div className={styles.panelContainer}>
        <ShopSidebar isBlocked={shop?.status === 'blocked'} />
        <main className={styles.mainContent}>
          {loading && <div className={styles.alert}>Cargando estadísticas...</div>}
          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error}
              <button onClick={loadData} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
                Reintentar
              </button>
            </div>
          )}
          {shop && statistics && (
            <>
              <ShopHeader shop={shop} />
              <div className={styles.raffleDetail}>
                <h1 className={styles.raffleDetailTitle}>Estadísticas de mi tienda</h1>

                {/* Cards de resumen */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div className={styles.statCard}>
                    <div className={styles.statCardIcon}>📊</div>
                    <div className={styles.statCardValue}>{statistics.raffles.total}</div>
                    <div className={styles.statCardLabel}>Total de Sorteos</div>
                  </div>

                  <div className={styles.statCard}>
                    <div className={styles.statCardIcon}>🎫</div>
                    <div className={styles.statCardValue}>{statistics.tickets.totalSold}</div>
                    <div className={styles.statCardLabel}>Tickets Vendidos</div>
                  </div>

                  <div className={styles.statCard}>
                    <div className={styles.statCardIcon}>💰</div>
                    <div className={styles.statCardValue}>S/. {statistics.revenue.total.toFixed(2)}</div>
                    <div className={styles.statCardLabel}>Ingresos Totales</div>
                  </div>

                  <div className={styles.statCard}>
                    <div className={styles.statCardIcon}>📈</div>
                    <div className={styles.statCardValue}>{statistics.conversionRate.toFixed(1)}%</div>
                    <div className={styles.statCardLabel}>Tasa de Conversión</div>
                  </div>
                </div>

                {/* Estadísticas de sorteos */}
                <div className={styles.raffleFormSection} style={{ marginBottom: '30px' }}>
                  <h2 className={styles.raffleFormSectionTitle}>Sorteos</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                        {statistics.raffles.draft}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Borradores</div>
                    </div>
                    <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
                        {statistics.raffles.pendingApproval}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Pendientes de Aprobación</div>
                    </div>
                    <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                        {statistics.raffles.active}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Activos</div>
                    </div>
                    <div style={{ padding: '15px', background: '#cce5ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#004085' }}>
                        {statistics.raffles.soldOut}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Agotados</div>
                    </div>
                    <div style={{ padding: '15px', background: '#d1ecf1', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                        {statistics.raffles.finished}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Finalizados</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8d7da', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                        {statistics.raffles.cancelled}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Cancelados</div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de tickets */}
                <div className={styles.raffleFormSection} style={{ marginBottom: '30px' }}>
                  <h2 className={styles.raffleFormSectionTitle}>Tickets</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                        {statistics.tickets.totalSold}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Total Vendidos</div>
                    </div>
                    <div style={{ padding: '15px', background: '#e7f3ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#004085' }}>
                        {statistics.tickets.totalAvailable}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Total Disponibles</div>
                    </div>
                    <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                        {statistics.tickets.thisMonth}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Este Mes</div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de ingresos */}
                <div className={styles.raffleFormSection} style={{ marginBottom: '30px' }}>
                  <h2 className={styles.raffleFormSectionTitle}>Ingresos</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                        S/. {statistics.revenue.total.toFixed(2)}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Ingresos Totales</div>
                    </div>
                    <div style={{ padding: '15px', background: '#cce5ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#004085' }}>
                        S/. {statistics.revenue.thisMonth.toFixed(2)}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Este Mes</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                        {statistics.revenue.completedPayments}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Pagos Completados</div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas de productos */}
                <div className={styles.raffleFormSection}>
                  <h2 className={styles.raffleFormSectionTitle}>Productos</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                        {statistics.products.total}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Total de Productos</div>
                    </div>
                    <div style={{ padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                        {statistics.products.active}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Activos</div>
                    </div>
                    <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
                        {statistics.products.withDeposit}
                      </div>
                      <div style={{ color: '#7f8c8d', fontSize: '14px' }}>Con Depósito</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

