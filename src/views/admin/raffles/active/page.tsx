'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiPlay, FiTrash2, FiTrendingUp, FiCheckCircle, FiExternalLink } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import styles from '@/views/admin/admin.module.css';

interface Raffle {
  id: string;
  shop: { id: string; name: string };
  product: { id: string; name: string; value?: number };
  productValue: number;
  totalTickets: number;
  soldTickets: number;
  activatedAt: string;
  status: string;
}

export default function ActiveRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [shopFilter, setShopFilter] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchRaffles();
  }, [page, shopFilter]);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const data = await adminService.getActiveRaffles(
        limit,
        page * limit,
        shopFilter || undefined,
      );
      setRaffles(data.data as Raffle[]);
      setTotal(data.total);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar sorteos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRaffle = async () => {
    if (!selectedRaffleId || !cancelReason.trim()) {
      alert('Por favor ingresa un motivo de cancelación');
      return;
    }
    try {
      setActionLoading(true);
      await adminService.cancelRaffle(selectedRaffleId, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedRaffleId(null);
      setSelectedRaffle(null);
      setShowCancelSuccessModal(true);
      fetchRaffles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al cancelar sorteo');
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteRaffle = async () => {
    if (!selectedRaffleId) {
      alert('Error: Sorteo no seleccionado');
      return;
    }
    try {
      setActionLoading(true);
      await adminService.executeRaffle(selectedRaffleId);
      setShowExecuteModal(false);
      setSelectedRaffleId(null);
      setShowSuccessModal(true);
      fetchRaffles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al ejecutar sorteo');
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getProgressPercentage = (sold: number, total: number) => {
    return total > 0 ? Math.round((sold / total) * 100) : 0;
  };

  if (loading && raffles.length === 0) {
    return (
      <div className={styles.tableContainer} style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div className={styles.activeSpinner} />
        <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>Cargando sorteos activos...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', fontWeight: 700 }}>
          Activos
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Gestiona sorteos en curso. Ejecuta cuando se complete la venta o cancela si es necesario.
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div className={styles.tableHeader} style={{ marginBottom: '0', padding: '20px 24px', borderRadius: '12px 12px 0 0' }}>
        <div className={styles.filterContainer} style={{ flex: 1 }}>
          <div style={{ position: 'relative', maxWidth: 320 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 16 }} />
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Filtrar por nombre o ID de organizador..."
              value={shopFilter}
              onChange={(e) => {
                setShopFilter(e.target.value);
                setPage(0);
              }}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>
      </div>

      {raffles.length === 0 ? (
        <div className={styles.tableContainer} style={{ padding: '56px 24px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
          <FiTrendingUp style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: 18, fontWeight: 600 }}>No hay sorteos activos</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Los sorteos aprobados aparecerán aquí cuando estén activos.</p>
        </div>
      ) : (
        <div className={styles.tableContainer} style={{ borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Organizador</th>
                  <th>Oportunidad</th>
                  <th>Valor</th>
                  <th>Unidad</th>
                  <th>Tickets</th>
                  <th>Progreso</th>
                  <th>Activo desde</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {raffles.map((raffle) => {
                  const progress = getProgressPercentage(raffle.soldTickets, raffle.totalTickets);
                  const valorProducto = raffle.product?.value != null ? Math.round(Number(raffle.product.value)) : null;
                  return (
                    <tr key={raffle.id}>
                      <td>
                        <span className={styles.activeOrg}>{raffle.shop.name}</span>
                      </td>
                      <td>
                        <span className={styles.activeProduct} style={{ color: '#0f172a', fontSize: 14 }}>{raffle.product.name}</span>
                      </td>
                      <td>
                        {valorProducto != null ? (
                          <span className={styles.activeValue}>S/. {valorProducto.toLocaleString('es-PE')}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={styles.activeValue}>S/. {raffle.productValue.toFixed(2)}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{raffle.soldTickets}</span>
                        <span style={{ color: '#94a3b8' }}> / </span>
                        <span style={{ color: '#64748b' }}>{raffle.totalTickets}</span>
                      </td>
                      <td>
                        <div className={styles.activeProgressWrap}>
                          <div className={styles.activeProgressBar}>
                            <div
                              className={`${styles.activeProgressFill} ${progress === 100 ? styles.complete : ''}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className={styles.activeProgressPct}>{progress}%</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>
                        {new Date(raffle.activatedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionButtons} style={{ justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                          <Link
                            href={`/sorteos/${raffle.id}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', fontSize: 13, textDecoration: 'none', color: '#6366f1', border: '1px solid #6366f1', borderRadius: 8, backgroundColor: 'transparent', fontWeight: 600 }}
                            title="Ver oportunidad"
                          >
                            <FiExternalLink size={14} />
                            Ver
                          </Link>
                          {progress === 100 && (
                            <button
                              className={`${styles.btn} ${styles.btnSuccess}`}
                              onClick={() => {
                                setSelectedRaffleId(raffle.id);
                                setShowExecuteModal(true);
                              }}
                              title="Ejecutar sorteo y elegir ganador"
                            >
                              <FiPlay size={14} />
                              Ejecutar
                            </button>
                          )}
                          <button
                            className={`${styles.btn} ${styles.btnDanger}`}
                            onClick={() => {
                              setSelectedRaffleId(raffle.id);
                              setSelectedRaffle(raffle);
                              setCancelReason('');
                              setShowCancelModal(true);
                            }}
                            title="Cancelar sorteo"
                          >
                            <FiTrash2 size={14} />
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Cancel Modal - Confirmación */}
      {showCancelModal && (
        <div className={`${styles.modal} ${styles.open}`} onClick={() => { if (!actionLoading) { setShowCancelModal(false); setCancelReason(''); setSelectedRaffleId(null); setSelectedRaffle(null); } }}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Confirmar cancelación</h2>
            </div>
            <div className={styles.modalBody}>
              {selectedRaffle && (
                <p style={{ marginBottom: 12, fontSize: 14, color: '#0f172a', fontWeight: 600 }}>
                  ¿Cancelar «{selectedRaffle.product?.name}»?
                </p>
              )}
              <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
                El sorteo se eliminará del panel y del catálogo público. Esta acción no se puede deshacer.
              </p>
              <div className={styles.formGroup}>
                <label>Motivo (obligatorio)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ej: error en el producto, solicitud del organizador..."
                  disabled={actionLoading}
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => { setShowCancelModal(false); setCancelReason(''); setSelectedRaffleId(null); setSelectedRaffle(null); }}
                disabled={actionLoading}
              >
                Volver
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleCancelRaffle}
                disabled={actionLoading || !cancelReason.trim()}
              >
                {actionLoading ? 'Procesando...' : 'Confirmar cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Sorteo cancelado */}
      {showCancelSuccessModal && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 380, textAlign: 'center' }}>
            <div className={styles.modalBody} style={{ padding: '32px 24px 24px' }}>
              <FiCheckCircle style={{ fontSize: 56, color: '#059669', marginBottom: 16 }} />
              <h2 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#0f172a' }}>Sorteo cancelado</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
                El sorteo ha sido eliminado del panel y del catálogo.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center' }}>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={() => setShowCancelSuccessModal(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Modal */}
      {showExecuteModal && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 440 }}>
            <div className={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Ejecutar sorteo</h2>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#64748b', marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}>
                Se elegirá un ganador aleatorio entre los tickets vendidos y se enviarán los correos al ganador y al organizador.
              </p>
              <p style={{ color: '#059669', fontWeight: 600, fontSize: 13, margin: 0 }}>
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => { setShowExecuteModal(false); setSelectedRaffleId(null); }}
                disabled={actionLoading}
              >
                Volver
              </button>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={handleExecuteRaffle}
                disabled={actionLoading}
              >
                {actionLoading ? 'Ejecutando...' : 'Confirmar ejecución'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Sorteo ejecutado */}
      {showSuccessModal && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 380, textAlign: 'center' }}>
            <div className={styles.modalBody} style={{ padding: '32px 24px 24px' }}>
              <FiCheckCircle style={{ fontSize: 56, color: '#059669', marginBottom: 16 }} />
              <h2 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#0f172a' }}>Listo</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>
                Sorteo ejecutado exitosamente.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center' }}>
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
