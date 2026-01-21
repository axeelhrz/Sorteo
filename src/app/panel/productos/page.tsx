'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { Shop } from '@/types/shop';
import { shopService } from '@/services/shop-service';
import { ShopHeader } from '@/components/ShopPanel/ShopHeader';
import { ShopSidebar } from '@/components/ShopPanel/ShopSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/app/panel/panel.module.css';

export default function ProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.SHOP}>
      <div className={styles.panelContainer}>
        <ShopSidebar isBlocked={shop?.status === 'blocked'} />
        <main className={styles.mainContent}>
          {loading && <div className={styles.alert}>Cargando datos...</div>}
          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error}
              <button onClick={loadData} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
                Reintentar
              </button>
            </div>
          )}
          {shop && (
            <>
              <ShopHeader shop={shop} />
              <div className={styles.raffleDetail}>
                <h1 className={styles.raffleDetailTitle}>Gestión de productos</h1>

                <div
                  className={styles.alert}
                  style={{
                    backgroundColor: '#e3f2fd',
                    borderLeft: '4px solid #2196f3',
                    padding: '20px',
                    marginTop: '20px',
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>ℹ️ Cambio en la gestión de productos</h3>
                  <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
                    Los productos ahora se crean automáticamente al crear un sorteo. Ya no es necesario crear productos
                    por separado.
                  </p>
                  <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
                    <strong>Importante:</strong> No se pueden modificar o eliminar productos que tengan un sorteo
                    vigente asociado.
                  </p>
                  <button
                    onClick={() => router.push('/panel/sorteos/crear')}
                    className={styles.primaryButton}
                    style={{ marginTop: '10px' }}
                  >
                    ➕ Crear nuevo sorteo
                  </button>
                </div>

                <div
                  style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                  }}
                >
                  <h3 style={{ margin: '0 0 15px 0' }}>¿Cómo funciona ahora?</h3>
                  <ol style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>Ve a "Crear sorteo" desde el menú lateral</li>
                    <li>Completa la información del producto (nombre, descripción, valor, dimensiones, etc.)</li>
                    <li>Agrega las condiciones especiales del sorteo (opcional)</li>
                    <li>El producto y el sorteo se crearán automáticamente juntos</li>
                  </ol>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}