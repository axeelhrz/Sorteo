'use client';

import React, { useEffect, useState } from 'react';
import UserPanelLayout from '@/components/UserPanel/UserPanelLayout';
import { userPanelService } from '@/services/user-panel-service';
import type { UserPurchaseHistory } from '@/types/user-panel';
import styles from './purchase-history.module.css';

export default function PurchaseHistoryPage() {
  const [purchases, setPurchases] = useState<UserPurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        setLoading(true);
        const data = await userPanelService.getPurchaseHistory();
        setPurchases(data);
      } catch (err) {
        console.error('Error fetching purchase history:', err);
        setError('Error al cargar el historial de compras');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []);

  const handleExportCSV = async () => {
    try {
      const blob = await userPanelService.exportPurchaseHistoryCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historial-compras-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Error al exportar el historial');
    }
  };

  if (loading) {
    return (
      <UserPanelLayout activeSection="purchase-history">
        <div className={styles.loadingContainer}>
          <p>Cargando historial de compras...</p>
        </div>
      </UserPanelLayout>
    );
  }

  return (
    <UserPanelLayout activeSection="purchase-history">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>📋 Historial de Compras</h1>
          <p className={styles.subtitle}>
            Aquí puedes ver todas tus compras de tickets
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.toolbar}>
          <button onClick={handleExportCSV} className={styles.exportButton}>
            📥 Exportar como CSV
          </button>
        </div>

        {purchases.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🛒</p>
            <h2>No tienes compras aún</h2>
            <p>Comienza a comprar tickets en nuestros sorteos</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Sorteo</th>
                  <th>Tickets</th>
                  <th>Monto Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                    <td className={styles.raffleCell}>{purchase.raffleTitle}</td>
                    <td className={styles.centerCell}>{purchase.ticketQuantity}</td>
                    <td className={styles.amountCell}>
                      ${purchase.totalAmount.toLocaleString()}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[purchase.paymentStatus]}`}>
                        {purchase.paymentStatus === 'paid' && '✅ Pagado'}
                        {purchase.paymentStatus === 'failed' && '❌ Fallido'}
                        {purchase.paymentStatus === 'refunded' && '↩️ Reembolsado'}
                        {purchase.paymentStatus === 'pending' && '⏳ Pendiente'}
                      </span>
                    </td>
                    <td>
                      <button className={styles.detailsButton}>
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </UserPanelLayout>
  );
}