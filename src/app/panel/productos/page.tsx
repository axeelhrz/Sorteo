'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { shopService } from '@/services/shop-service';
import { productService } from '@/services/product-service';
import { ShopHeader } from '@/components/ShopPanel/ShopHeader';
import { ShopSidebar } from '@/components/ShopPanel/ShopSidebar';
import { EmptyState } from '@/components/ShopPanel/EmptyState';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/app/panel/panel.module.css';

export default function ProductsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
      const productsData = await productService.getProductsByShop(shopData.id);
      setProducts(productsData);
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h1 className={styles.raffleDetailTitle} style={{ margin: 0 }}>Mis productos</h1>
                  <a href="/panel/productos/crear" className={styles.primaryButton} style={{ textDecoration: 'none' }}>
                    + Crear producto
                  </a>
                </div>

                {products.length === 0 ? (
                  <EmptyState
                    title="No tienes productos aún"
                    description="Crea tu primer producto para poder crear sorteos."
                    icon="📦"
                  />
                ) : (
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th className={styles.tableHeaderCell}>Nombre</th>
                        <th className={styles.tableHeaderCell}>Valor</th>
                        <th className={styles.tableHeaderCell}>Dimensiones</th>
                        <th className={styles.tableHeaderCell}>Depósito</th>
                        <th className={styles.tableHeaderCell}>Estado</th>
                        <th className={styles.tableHeaderCell}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className={styles.tableRow}>
                          <td className={styles.tableCell}>{product.name}</td>
                          <td className={styles.tableCell}>S/. {Number(product.value).toFixed(2)}</td>
                          <td className={styles.tableCell}>
                            {Number(product.height).toFixed(1)} × {Number(product.width).toFixed(1)} × {Number(product.depth).toFixed(1)} cm
                          </td>
                          <td className={styles.tableCell}>{product.requiresDeposit ? '✓ Sí' : '✗ No'}</td>
                          <td className={styles.tableCell}>{product.status}</td>
                          <td className={styles.tableCell}>
                            <a
                              href={`/panel/productos/${product.id}/editar`}
                              className={styles.secondaryButton}
                              style={{ textDecoration: 'none', padding: '5px 10px', fontSize: '12px' }}
                            >
                              Editar
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}