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
  winnerTicketId: string;
  raffleExecutedAt: string;
  status: string;
  tickets: any[];
}

export default function FinishedRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [shopFilter, setShopFilter] = useState('');
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchRaffles();
  }, [page, shopFilter]);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const data = await adminService.getFinishedRaffles(
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

  const getWinnerInfo = (raffle: Raffle) => {
    if (!raffle.winnerTicketId) return 'No hay ganador';
    const winnerTicket = raffle.tickets?.find((t) => t.id === raffle.winnerTicketId);
    return winnerTicket ? `Ticket #${winnerTicket.number}` : 'Ganador no encontrado';
  };

  if (loading && raffles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando sorteos finalizados...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Sorteos Finalizados</h2>

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
          <p style={{ color: '#7f8c8d' }}>No hay sorteos finalizados</p>
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
                <th>Ganador</th>
                <th>Fecha Finalización</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((raffle) => (
                <tr key={raffle.id}>
                  <td>{raffle.shop.name}</td>
                  <td>{raffle.product.name}</td>
                  <td>${raffle.productValue.toFixed(2)}</td>
                  <td>
                    {raffle.soldTickets} / {raffle.totalTickets}
                  </td>
                  <td>{getWinnerInfo(raffle)}</td>
                  <td>{new Date(raffle.raffleExecutedAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[raffle.status]}`}>
                      {raffle.status === 'finished' ? 'Finalizado' : 'Agotado'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => {
                          setSelectedRaffle(raffle);
                          setShowDetail(true);
                        }}
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
              <h2>Detalles del Sorteo Finalizado</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Tienda</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.shop.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Producto</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.product.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Valor del Producto</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>${selectedRaffle.productValue.toFixed(2)}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Tickets Vendidos</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {selectedRaffle.soldTickets} / {selectedRaffle.totalTickets}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Ganador</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {getWinnerInfo(selectedRaffle)}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Fecha de Finalización</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {new Date(selectedRaffle.raffleExecutedAt).toLocaleString()}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Estado</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  <span className={`${styles.statusBadge} ${styles[selectedRaffle.status]}`}>
                    {selectedRaffle.status === 'finished' ? 'Finalizado' : 'Agotado'}
                  </span>
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowDetail(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}