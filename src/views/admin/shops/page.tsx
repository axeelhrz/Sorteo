'use client';

import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiEye, FiShoppingBag } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import styles from '@/views/admin/admin.module.css';

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
  const [showConfirmStatusModal, setShowConfirmStatusModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  const getStatusLabel = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'Pendiente';
    if (s === 'verified') return 'Verificado';
    if (s === 'blocked') return 'Bloqueado';
    return status || '—';
  };

  const formatDate = (value: string | undefined | null): string => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime()) || d.getTime() < 86400000) return '—'; // antes de 2 ene 1970 = inválido
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    fetchShops();
  }, [page, statusFilter]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllShops(
        limit,
        page * limit,
        statusFilter ? { status: statusFilter } : undefined,
      );
      setShops(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar organizadores');
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
      alert('Error al cargar detalles del organizador');
      console.error('Error:', err);
    }
  };

  const handleConfirmChangeStatus = () => {
    if (!selectedShop || !newStatus) return;
    setShowConfirmStatusModal(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedShop || !newStatus) return;

    try {
      setActionLoading(true);
      await adminService.changeShopStatus(selectedShop.id, newStatus, statusReason);
      setShowConfirmStatusModal(false);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusReason('');
      setShowDetail(false);
      fetchShops();
      setShowSuccessModal(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado');
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && shops.length === 0) {
    return (
      <div className={styles.tableContainer} style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div className={styles.userSpinner} />
        <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>Cargando organizadores...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', fontWeight: 700 }}>
          Gestión de Organizadores
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Tiendas/organizadores registrados. Filtra por estado y revisa detalles o cambia estado.
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className={styles.tableHeader} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 16 }}>
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
        <div className={styles.tableContainer} style={{ padding: '56px 24px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
          <FiShoppingBag style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: 18, fontWeight: 600 }}>No hay organizadores</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>No se encontraron tiendas con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className={styles.tableContainer} style={{ borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tienda / Organizador</th>
                  <th>Propietario</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Fecha de registro</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.id}>
                    <td>
                      <span className={styles.userName}>{shop.name || '—'}</span>
                    </td>
                    <td>
                      <span className={styles.userName}>{shop.user?.name || '—'}</span>
                    </td>
                    <td>
                      <span className={styles.userEmail}>{shop.user?.email || '—'}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[shop.status]}`}>
                        {getStatusLabel(shop.status)}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>
                      {formatDate(shop.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => handleViewDetail(shop.id)}
                          title="Ver detalles"
                        >
                          <FiEye size={14} />
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination} style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
            <button
              className={styles.paginationBtn}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Anterior
            </button>
            <span style={{ padding: '8px 16px', fontSize: 14, color: '#64748b' }}>
              Página {page + 1} de {Math.max(1, Math.ceil(total / limit))}
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
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 480 }}>
            <div className={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Detalles del organizador</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tienda / Nombre</label>
                <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: 16, fontWeight: 600 }}>{selectedShop.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Propietario</label>
                <p style={{ margin: '6px 0 0 0', color: '#334155', fontSize: 14 }}>{selectedShop.user?.name || '—'}</p>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
                <p style={{ margin: '6px 0 0 0', color: '#334155', fontSize: 14 }}>{selectedShop.user?.email || '—'}</p>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</label>
                <p style={{ margin: '8px 0 0 0' }}>
                  <span className={`${styles.statusBadge} ${styles[selectedShop.status]}`}>
                    {getStatusLabel(selectedShop.status)}
                  </span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Descripción</label>
                <p style={{ margin: '6px 0 0 0', color: '#334155', fontSize: 14 }}>
                  {(selectedShop as any).description || '—'}
                </p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginTop: 20, border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Estadísticas</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div>
                    <small style={{ color: '#64748b', fontSize: 12 }}>Total sorteos</small>
                    <p style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                      {selectedShop.stats?.totalRaffles ?? 0}
                    </p>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', fontSize: 12 }}>Activos</small>
                    <p style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 700, color: '#059669' }}>
                      {selectedShop.stats?.activeRaffles ?? 0}
                    </p>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', fontSize: 12 }}>Finalizados</small>
                    <p style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 700, color: '#2563eb' }}>
                      {selectedShop.stats?.finishedRaffles ?? 0}
                    </p>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', fontSize: 12 }}>Cancelados</small>
                    <p style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 700, color: '#dc2626' }}>
                      {selectedShop.stats?.cancelledRaffles ?? 0}
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
                Cambiar estado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedShop && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 420 }}>
            <div className={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Cambiar estado del organizador</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado actual</label>
                <p style={{ margin: '8px 0 0 0' }}>
                  <span className={`${styles.statusBadge} ${styles[selectedShop.status]}`}>
                    {getStatusLabel(selectedShop.status)}
                  </span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Nuevo estado</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={styles.filterSelect}
                  disabled={actionLoading}
                  style={{ marginTop: 8 }}
                >
                  <option value="">Selecciona un estado</option>
                  {selectedShop.status !== 'pending' && <option value="pending">Pendiente</option>}
                  {selectedShop.status !== 'verified' && <option value="verified">Verificado</option>}
                  {selectedShop.status !== 'blocked' && <option value="blocked">Bloqueado</option>}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Motivo (opcional)</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Motivo del cambio de estado..."
                  disabled={actionLoading}
                  style={{ marginTop: 8 }}
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
                onClick={handleConfirmChangeStatus}
                disabled={actionLoading || !newStatus}
              >
                Confirmar cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de verificación: confirmar cambio de estado */}
      {showConfirmStatusModal && selectedShop && newStatus && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 400 }}>
            <div className={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20 }}>¿Confirmar cambio de estado?</h2>
            </div>
            <div className={styles.modalBody}>
              <p style={{ margin: 0, color: '#334155', fontSize: 15, lineHeight: 1.5 }}>
                Vas a cambiar el estado del organizador <strong>"{selectedShop.name}"</strong> de{' '}
                <span className={`${styles.statusBadge} ${styles[selectedShop.status]}`} style={{ margin: '0 2px' }}>
                  {getStatusLabel(selectedShop.status)}
                </span>{' '}
                a{' '}
                <span className={`${styles.statusBadge} ${styles[newStatus]}`} style={{ margin: '0 2px' }}>
                  {getStatusLabel(newStatus)}
                </span>.
              </p>
              {statusReason && (
                <p style={{ margin: '16px 0 0 0', fontSize: 13, color: '#64748b' }}>
                  <strong>Motivo:</strong> {statusReason}
                </p>
              )}
              <p style={{ margin: '16px 0 0 0', fontSize: 14, color: '#64748b' }}>
                ¿Deseas continuar?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowConfirmStatusModal(false)}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.btnWarning}`}
                onClick={handleChangeStatus}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Sí, confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito: estado actualizado */}
      {showSuccessModal && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 380, textAlign: 'center' }}>
            <div className={styles.modalBody} style={{ padding: '32px 24px 24px' }}>
              <FiCheckCircle style={{ fontSize: 56, color: '#059669', marginBottom: 16 }} />
              <h2 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#0f172a' }}>Estado actualizado</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
                Estado del organizador actualizado correctamente.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center', paddingBottom: 24 }}>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={() => setShowSuccessModal(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}