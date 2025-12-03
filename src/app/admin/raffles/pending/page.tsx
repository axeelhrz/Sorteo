'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin-service';
import styles from '../../admin.module.css';

interface Raffle {
  id: string;
  shop: { id: string; name: string };
  product: { id: string; name: string; value: number };
  productValue: number;
  totalTickets: number;
  requiresDeposit: boolean;
  createdAt: string;
  status: string;
}

interface RaffleDetail {
  id: string;
  shop: { id: string; name: string; status: string };
  product: { id: string; name: string; value: number; description: string };
  productValue: number;
  totalTickets: number;
  requiresDeposit: boolean;
  specialConditions: string;
  createdAt: string;
}

export default function PendingRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const limit = 10;

  useEffect(() => {
    fetchRaffles();
  }, [page]);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingRaffles(limit, page * limit);
      setRaffles(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar sorteos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (raffleId: string) => {
    try {
      const data = await adminService.getRaffleDetail(raffleId);
      setSelectedRaffle(data);
      setShowDetail(true);
    } catch (err: any) {
      alert('Error al cargar detalles del sorteo');
      console.error('Error:', err);
    }
  };

  const handleApprove = async (raffleId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas aprobar este sorteo?')) return;

    try {
      setActionLoading(true);
      await adminService.approveRaffle(raffleId);
      alert('Sorteo aprobado exitosamente');
      setShowDetail(false);
      fetchRaffles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al aprobar sorteo');
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (raffleId: string) => {
    if (!rejectReason.trim()) {
      alert('Por favor ingresa un motivo de rechazo');
      return;
    }

    try {
      setActionLoading(true);
      await adminService.rejectRaffle(raffleId, rejectReason);
      alert('Sorteo rechazado exitosamente');
      setShowRejectModal(false);
      setRejectReason('');
      setShowDetail(false);
      fetchRaffles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al rechazar sorteo');
      console.error('Error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && raffles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando sorteos pendientes...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Sorteos Pendientes de Aprobación</h2>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {raffles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#7f8c8d' }}>No hay sorteos pendientes de aprobación</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Tienda</th>
                <th>Producto</th>
                <th>Valor</th>
                <th>Tickets</th>
                <th>Depósito</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((raffle) => (
                <tr key={raffle.id}>
                  <td>{raffle.shop.name}</td>
                  <td>{raffle.product.name}</td>
                  <td>${raffle.productValue.toFixed(2)}</td>
                  <td>{raffle.totalTickets}</td>
                  <td>{raffle.requiresDeposit ? '✓ Sí' : '✗ No'}</td>
                  <td>{new Date(raffle.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => handleViewDetail(raffle.id)}
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
      {showDetail && selectedRaffle && (
        <div className={`${styles.modal} ${showDetail ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalles del Sorteo</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tienda</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {selectedRaffle.shop.name}
                  <span className={`${styles.statusBadge} ${styles[selectedRaffle.shop.status]}`} style={{ marginLeft: '10px' }}>
                    {selectedRaffle.shop.status}
                  </span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Producto</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.product.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Descripción</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.product.description || 'N/A'}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Valor del Producto</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>${selectedRaffle.productValue.toFixed(2)}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Total de Tickets</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.totalTickets}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Requiere Depósito</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {selectedRaffle.requiresDeposit ? '✓ Sí' : '✗ No'}
                </p>
              </div>

              {selectedRaffle.specialConditions && (
                <div className={styles.formGroup}>
                  <label>Condiciones Especiales</label>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.specialConditions}</p>
                </div>
              )}
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
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                Rechazar
              </button>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={() => handleApprove(selectedRaffle.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRaffle && (
        <div className={`${styles.modal} ${showRejectModal ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Rechazar Sorteo</h2>
            </div>

            <div className={styles.modalBody}>
              <p style={{ color: '#7f8c8d', marginBottom: '15px' }}>
                Por favor, proporciona un motivo para rechazar este sorteo. La tienda podrá ver este motivo.
              </p>
              <div className={styles.formGroup}>
                <label>Motivo del Rechazo</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ingresa el motivo del rechazo..."
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => handleRejectSubmit(selectedRaffle.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}