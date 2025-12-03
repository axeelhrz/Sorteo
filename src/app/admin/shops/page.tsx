'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin-service';
import styles from '../admin.module.css';

interface Shop {
  id: string;
  name: string;
  user: { id: string; name: string; email: string };
  status: string;
  createdAt: string;
  raffles?: any[];
}

interface ShopDetail extends Shop {
  stats: {
    totalRaffles: number;
    activeRaffles: number;
    finishedRaffles: number;
    cancelledRaffles: number;
  };
}

export default function ShopsManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedShop, setSelectedShop] = useState<ShopDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchShops();
  }, [page, statusFilter]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllShops(
        limit,
        page * limit,
        statusFilter || undefined,
      );
      setShops(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tiendas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (shopId: string) => {
    try {
      const data = await adminService.getShopDetail(shopId);
      setSelectedShop(data);
      setShowDetail(true);
    } catch (err: any) {
      alert('Error al cargar detalles de la tienda');
      console.error('Error:', err);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedShop || !newStatus) {
      alert('Por favor selecciona un estado');
      return;
    }

    try {
      setActionLoading(true);
      await adminService.changeShopStatus(selectedShop.id, newStatus, statusReason);
      alert('Estado de la tienda actualizado exitosamente');
      setShowStatusModal(false);
      setNewStatus('');
      setStatusReason('');
      setShowDetail(false);
      fetchShops();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cambiar estado');
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && shops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando tiendas...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Gestión de Tiendas</h2>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className={styles.tableHeader} style={{ marginBottom: '20px' }}>
        <div className={styles.filterContainer}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="verified">Verificado</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </div>
      </div>

      {shops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#7f8c8d' }}>No hay tiendas</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Propietario</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td>{shop.name}</td>
                  <td>{shop.user.name}</td>
                  <td>{shop.user.email}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[shop.status]}`}>
                      {shop.status}
                    </span>
                  </td>
                  <td>{new Date(shop.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => handleViewDetail(shop.id)}
                      >
                        Ver
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Anterior
            </button>
            <span style={{ padding: '8px 12px' }}>
              Página {page + 1} de {Math.ceil(total / limit)}
            </span>
            <button
              className={styles.paginationBtn}
              disabled={page >= Math.ceil(total / limit) - 1}
              onClick={() => setPage(page + 1)}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedShop && (
        <div className={`${styles.modal} ${showDetail ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalles de la Tienda</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nombre</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedShop.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Propietario</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedShop.user.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedShop.user.email}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Estado Actual</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  <span className={`${styles.statusBadge} ${styles[selectedShop.status]}`}>
                    {selectedShop.status}
                  </span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Descripción</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {(selectedShop as any).description || 'N/A'}
                </p>
              </div>

              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Estadísticas</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <small style={{ color: '#7f8c8d' }}>Total de Sorteos</small>
                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {selectedShop.stats.totalRaffles}
                    </p>
                  </div>
                  <div>
                    <small style={{ color: '#7f8c8d' }}>Sorteos Activos</small>
                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                      {selectedShop.stats.activeRaffles}
                    </p>
                  </div>
                  <div>
                    <small style={{ color: '#7f8c8d' }}>Sorteos Finalizados</small>
                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#3498db' }}>
                      {selectedShop.stats.finishedRaffles}
                    </p>
                  </div>
                  <div>
                    <small style={{ color: '#7f8c8d' }}>Sorteos Cancelados</small>
                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>
                      {selectedShop.stats.cancelledRaffles}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowDetail(false)}
                disabled={actionLoading}
              >
                Cerrar
              </button>
              <button
                className={`${styles.btn} ${styles.btnWarning}`}
                onClick={() => setShowStatusModal(true)}
                disabled={actionLoading}
              >
                Cambiar Estado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedShop && (
        <div className={`${styles.modal} ${showStatusModal ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Cambiar Estado de Tienda</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Estado Actual</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  <span className={`${styles.statusBadge} ${styles[selectedShop.status]}`}>
                    {selectedShop.status}
                  </span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Nuevo Estado</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={styles.filterSelect}
                  disabled={actionLoading}
                >
                  <option value="">Selecciona un estado</option>
                  {selectedShop.status !== 'pending' && <option value="pending">Pendiente</option>}
                  {selectedShop.status !== 'verified' && <option value="verified">Verificado</option>}
                  {selectedShop.status !== 'blocked' && <option value="blocked">Bloqueado</option>}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Motivo (Opcional)</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Ingresa el motivo del cambio de estado..."
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus('');
                  setStatusReason('');
                }}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.btnWarning}`}
                onClick={handleChangeStatus}
                disabled={actionLoading || !newStatus}
              >
                {actionLoading ? 'Procesando...' : 'Confirmar Cambio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}