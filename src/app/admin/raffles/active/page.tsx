'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin-service';
import styles from '../../admin.module.css';

interface Raffle {
  id: string;
  shop: { id: string; name: string };
  product: { id: string; name: string };
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
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);
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
      setRaffles(data[0]);
      setTotal(data[1]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar sorteos');
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
      alert('Sorteo cancelado exitosamente');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedRaffleId(null);
      fetchRaffles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cancelar sorteo');
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
      alert('Sorteo ejecutado exitosamente');
      setShowExecuteModal(false);
      setSelectedRaffleId(null);
      fetchRaffles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al ejecutar sorteo');
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
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando sorteos activos...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Sorteos Activos</h2>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className={styles.tableHeader} style={{ marginBottom: '20px' }}>
        <div className={styles.filterContainer}>
          <input
            type="text"
            className={styles.filterInput}
            placeholder="Filtrar por ID de tienda..."
            value={shopFilter}
            onChange={(e) => {
              setShopFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {raffles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#7f8c8d' }}>No hay sorteos activos</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Tienda</th>
                <th>Producto</th>
                <th>Valor</th>
                <th>Tickets Vendidos</th>
                <th>Progreso</th>
                <th>Activo desde</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((raffle) => {
                const progress = getProgressPercentage(raffle.soldTickets, raffle.totalTickets);
                return (
                  <tr key={raffle.id}>
                    <td>{raffle.shop.name}</td>
                    <td>{raffle.product.name}</td>
                    <td>${raffle.productValue.toFixed(2)}</td>
                    <td>
                      {raffle.soldTickets} / {raffle.totalTickets}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '100px',
                            height: '8px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${progress}%`,
                              height: '100%',
                              backgroundColor: progress === 100 ? '#27ae60' : '#3498db',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{progress}%</span>
                      </div>
                    </td>
                    <td>{new Date(raffle.activatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        {progress === 100 && (
                          <button
                            className={`${styles.btn} ${styles.btnSuccess}`}
                            onClick={() => {
                              setSelectedRaffleId(raffle.id);
                              setShowExecuteModal(true);
                            }}
                          >
                            Ejecutar
                          </button>
                        )}
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => {
                            setSelectedRaffleId(raffle.id);
                            setShowCancelModal(true);
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className={`${styles.modal} ${showCancelModal ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Cancelar Sorteo</h2>
            </div>

            <div className={styles.modalBody}>
              <p style={{ color: '#7f8c8d', marginBottom: '15px' }}>
                ¿Estás seguro de que deseas cancelar este sorteo? Esta acción no se puede deshacer.
              </p>
              <div className={styles.formGroup}>
                <label>Motivo de la Cancelación</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ingresa el motivo de la cancelación..."
                  disabled={actionLoading}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedRaffleId(null);
                }}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleCancelRaffle}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Modal */}
      {showExecuteModal && (
        <div className={`${styles.modal} ${showExecuteModal ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Ejecutar Sorteo</h2>
            </div>

            <div className={styles.modalBody}>
              <p style={{ color: '#7f8c8d', marginBottom: '15px' }}>
                ¿Estás seguro de que deseas ejecutar este sorteo? Se seleccionará un ganador de forma aleatoria entre todos los tickets vendidos.
              </p>
              <p style={{ color: '#27ae60', fontWeight: 'bold' }}>
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setShowExecuteModal(false);
                  setSelectedRaffleId(null);
                }}
                disabled={actionLoading}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={handleExecuteRaffle}
                disabled={actionLoading}
              >
                {actionLoading ? 'Ejecutando...' : 'Confirmar Ejecución'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}