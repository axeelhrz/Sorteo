'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { Shop } from '@/types/shop';
import { shopService } from '@/services/shop-service';
import { ShopHeader } from '@/components/ShopPanel/ShopHeader';
import { ShopSidebar } from '@/components/ShopPanel/ShopSidebar';
import { RaffleDetail } from '@/components/ShopPanel/RaffleDetail';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/app/panel/panel.module.css';

interface RaffleDetailPageProps {
  params: {
    id: string;
  };
}

export default function RaffleDetailPage({ params }: RaffleDetailPageProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadShop();
    }
  }, [isAuthenticated, user]);

  const loadShop = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await shopService.getMyShop();
      setShop(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.SHOP}>
      <div className={styles.panelContainer}>
        <ShopSidebar isBlocked={shop?.status === 'blocked'} />
        <main className={styles.mainContent}>
          {loading && <div className={styles.alert}>Cargando tienda...</div>}
          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error}
              <button onClick={loadShop} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
                Reintentar
              </button>
            </div>
          )}
          {shop && (
            <>
              <ShopHeader shop={shop} />
              <RaffleDetail raffleId={params.id} />
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}