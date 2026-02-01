'use client';

import React, { useEffect, useState } from 'react';
import { FiCheck, FiCircle, FiUpload } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import { uploadService } from '@/services/upload-service';
import styles from '@/views/admin/admin.module.css';

interface WinnerInfo {
  userName?: string;
  ticketNumber?: number;
  verificationCode?: string;
  claimedAt?: string | Date;
  deliveryEvidence?: { photoUrl?: string; uploadedAt?: string | Date };
  deliveryConfirmedAt?: string | Date;
}

interface Raffle {
  id: string;
  shop: { id: string; name: string };
  product: { id: string; name: string };
  productValue: number;
  totalTickets: number;
  soldTickets: number;
  winnerTicketId?: string;
  winnerInfo?: WinnerInfo;
  raffleExecutedAt: string;
  status: string;
  tickets: any[];
  paymentToOrganizerAt?: string | Date;
  paymentEvidenceUrl?: string;
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
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const getWinnerInfo = (raffle: Raffle) => {
    if (raffle.winnerInfo?.ticketNumber != null) return `Ticket #${raffle.winnerInfo.ticketNumber}`;
    if (!raffle.winnerTicketId) return 'No hay ganador';
    const winnerTicket = raffle.tickets?.find((t: any) => t.id === raffle.winnerTicketId);
    return winnerTicket ? `Ticket #${winnerTicket.number}` : 'Ganador no encontrado';
  };

  const formatDate = (v: string | Date | undefined | { toDate?: () => Date } | null) => {
    if (!v) return '—';
    if (typeof v === 'object' && v !== null && 'toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function') {
      return (v as { toDate: () => Date }).toDate().toLocaleString();
    }
    return new Date(v as string | Date).toLocaleString();
  };

  const handleRegisterPayment = async () => {
    if (!selectedRaffle || !paymentFile) {
      setPaymentError('Selecciona una imagen de evidencia de pago.');
      return;
    }
    setPaymentError(null);
    setPaymentUploading(true);
    try {
      const url = await uploadService.uploadImage(paymentFile, 'payment-evidence');
      await adminService.registerPaymentToOrganizer(selectedRaffle.id, url);
      await fetchRaffles();
      const updated = { ...selectedRaffle, paymentToOrganizerAt: new Date(), paymentEvidenceUrl: url };
      setSelectedRaffle(updated);
      setPaymentFile(null);
    } catch (err: any) {
      setPaymentError(err.message || 'Error al registrar el pago');
    } finally {
      setPaymentUploading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedRaffle(null);
    setPaymentFile(null);
    setPaymentError(null);
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
            placeholder="Filtrar por ID de organizador..."
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
                <th>Organizador</th>
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
          <div className={styles.modalContent} style={{ maxWidth: '560px' }}>
            <div className={styles.modalHeader}>
              <h2>Detalles del Sorteo Finalizado</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>ID Oportunidad</label>
                <p style={{ margin: '5px 0', color: '#2c3e50', fontFamily: 'monospace' }}>{selectedRaffle.id}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Organizador</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.shop.name}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Producto</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedRaffle.product.name}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Valor de Ticket</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>S/. {selectedRaffle.productValue.toFixed(2)}</p>
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
                  {selectedRaffle.winnerInfo?.userName && ` (${selectedRaffle.winnerInfo.userName})`}
                </p>
              </div>
              <div className={styles.formGroup}>
                <label>Fecha de Finalización</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {new Date(selectedRaffle.raffleExecutedAt).toLocaleString()}
                </p>
              </div>

              {/* Ciclo de vida */}
              <div className={styles.formGroup} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8ecf1' }}>
                <label style={{ marginBottom: '10px', display: 'block' }}>Ciclo de vida</label>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                    {selectedRaffle.winnerInfo?.claimedAt ? <FiCheck style={{ color: '#10b981', flexShrink: 0 }} /> : <FiCircle style={{ color: '#94a3b8', flexShrink: 0 }} />}
                    <span>Código único de ganador registrado: {formatDate(selectedRaffle.winnerInfo?.claimedAt)}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                    {selectedRaffle.winnerInfo?.deliveryEvidence?.photoUrl ? <FiCheck style={{ color: '#10b981', flexShrink: 0 }} /> : <FiCircle style={{ color: '#94a3b8', flexShrink: 0 }} />}
                    <span>Organizador entregó producto (evidencia): {selectedRaffle.winnerInfo?.deliveryEvidence?.uploadedAt ? formatDate(selectedRaffle.winnerInfo.deliveryEvidence.uploadedAt) : '—'}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                    {selectedRaffle.winnerInfo?.deliveryConfirmedAt ? <FiCheck style={{ color: '#10b981', flexShrink: 0 }} /> : <FiCircle style={{ color: '#94a3b8', flexShrink: 0 }} />}
                    <span>Ganador confirmó recepción: {formatDate(selectedRaffle.winnerInfo?.deliveryConfirmedAt)}</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    {selectedRaffle.paymentToOrganizerAt ? <FiCheck style={{ color: '#10b981', flexShrink: 0 }} /> : <FiCircle style={{ color: '#94a3b8', flexShrink: 0 }} />}
                    <span>Pago al organizador: {formatDate(selectedRaffle.paymentToOrganizerAt)}</span>
                  </li>
                </ul>
                {selectedRaffle.paymentEvidenceUrl && (
                  <p style={{ marginTop: '8px', fontSize: '13px' }}>
                    <a href={selectedRaffle.paymentEvidenceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>Ver evidencia de pago</a>
                  </p>
                )}
              </div>

              {/* Registrar pago al organizador */}
              {!selectedRaffle.paymentToOrganizerAt && (
                <div className={styles.formGroup} style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ marginBottom: '8px', display: 'block' }}>Registrar pago al organizador</label>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0' }}>
                    Sube la evidencia del pago realizado al organizador. Se enviará un correo al organizador y se actualizará el registro.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setPaymentFile(f || null);
                        setPaymentError(null);
                      }}
                      style={{ fontSize: '13px' }}
                    />
                    {paymentFile && (
                      <span style={{ fontSize: '13px', color: '#475569' }}>{paymentFile.name}</span>
                    )}
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      disabled={paymentUploading || !paymentFile}
                      onClick={handleRegisterPayment}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {paymentUploading ? (
                        'Subiendo...'
                      ) : (
                        <>
                          <FiUpload size={14} />
                          Registrar pago
                        </>
                      )}
                    </button>
                  </div>
                  {paymentError && (
                    <p style={{ marginTop: '8px', fontSize: '13px', color: '#dc2626' }}>{paymentError}</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={closeDetail}
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