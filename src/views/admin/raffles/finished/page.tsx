'use client';

import React, { useEffect, useState } from 'react';
import { FiCheck, FiCircle, FiUpload, FiX, FiExternalLink } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import styles from '@/views/admin/admin.module.css';

interface WinnerInfo {
  userId?: string;
  userName?: string;
  userEmail?: string;
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
  const [paymentJustRegistered, setPaymentJustRegistered] = useState(false);

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
      setRaffles(data.data as Raffle[]);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar sorteos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWinnerTicket = (raffle: Raffle) => {
    if (raffle.winnerInfo?.ticketNumber != null) return `Ticket #${raffle.winnerInfo.ticketNumber}`;
    if (!raffle.winnerTicketId) return '—';
    const winnerTicket = raffle.tickets?.find((t: any) => t.id === raffle.winnerTicketId);
    return winnerTicket ? `Ticket #${winnerTicket.number}` : '—';
  };

  const getWinnerUser = (raffle: Raffle) => {
    if (raffle.winnerInfo?.userName) return raffle.winnerInfo.userName;
    if (raffle.winnerInfo?.userEmail) return raffle.winnerInfo.userEmail;
    return '—';
  };

  /** Estados: Ejecutado (en proceso), Pago Pendiente (evidencia no subida), Finalizado (cierre completo) */
  const getClosureStatus = (raffle: Raffle): 'ejecutado' | 'pago_pendiente' | 'finalizado' => {
    if (raffle.paymentToOrganizerAt) return 'finalizado';
    const wi = raffle.winnerInfo;
    const deliveryDone = wi?.deliveryConfirmedAt || wi?.deliveryEvidence?.photoUrl;
    if (deliveryDone) return 'pago_pendiente';
    return 'ejecutado';
  };

  const getClosureStatusLabel = (raffle: Raffle) => {
    const s = getClosureStatus(raffle);
    if (s === 'finalizado') return 'Finalizado';
    if (s === 'pago_pendiente') return 'Pago Pendiente';
    return 'Ejecutado';
  };

  const getClosureStatusBadgeClass = (raffle: Raffle) => {
    const s = getClosureStatus(raffle);
    if (s === 'finalizado') return styles.statusFinalizado;
    if (s === 'pago_pendiente') return styles.statusPagoPendiente;
    return styles.statusEjecutado;
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
      const paymentEvidenceUrl = await adminService.registerPaymentToOrganizer(selectedRaffle.id, paymentFile);
      await fetchRaffles();
      const updated = { ...selectedRaffle, paymentToOrganizerAt: new Date(), paymentEvidenceUrl };
      setSelectedRaffle(updated);
      setPaymentFile(null);
      setPaymentJustRegistered(true);
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : 'Error al registrar el pago');
    } finally {
      setPaymentUploading(false);
    }
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedRaffle(null);
    setPaymentFile(null);
    setPaymentError(null);
    setPaymentJustRegistered(false);
  };

  if (loading && raffles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando sorteos finalizados...</p>
      </div>
    );
  }

  return (
    <div className={styles.finishedPage}>
      <div className={styles.finishedPageHeader}>
        <h2 className={styles.finishedPageTitle}>Sorteos Finalizados</h2>
        <p className={styles.finishedPageSubtitle}>Oportunidades ejecutadas y ganadores asignados</p>
      </div>

      {error && (
        <div className={styles.finishedError}>
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
        <div className={styles.finishedEmpty}>
          <p className={styles.finishedEmptyText}>No hay sorteos finalizados</p>
          <p className={styles.finishedEmptyHint}>Las oportunidades que se ejecuten aparecerán aquí.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.finishedTh}>Organizador</th>
                  <th className={styles.finishedTh}>Producto</th>
                  <th className={styles.finishedTh}>Valor</th>
                  <th className={styles.finishedTh}>Tickets</th>
                  <th className={styles.finishedTh}>Ticket ganador</th>
                  <th className={styles.finishedTh}>Nombre de usuario</th>
                  <th className={styles.finishedTh}>Fecha fin</th>
                  <th className={styles.finishedTh}>Estado</th>
                  <th className={styles.finishedThActions}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {raffles.map((raffle) => (
                  <tr key={raffle.id} className={styles.finishedRow}>
                    <td className={styles.finishedTdOrg}>{raffle.shop.name}</td>
                    <td className={styles.finishedTdProduct}>{raffle.product.name}</td>
                    <td className={styles.finishedTdValue}>
                      S/. {raffle.productValue.toFixed(2)}
                    </td>
                    <td className={styles.finishedTdTickets}>
                      <span className={styles.ticketsCount}>
                        {raffle.soldTickets} / {raffle.totalTickets}
                      </span>
                    </td>
                    <td className={styles.finishedTdWinner}>{getWinnerTicket(raffle)}</td>
                    <td className={styles.finishedTdWinner}>
                      {getWinnerUser(raffle)}
                      {raffle.winnerInfo?.userEmail && raffle.winnerInfo?.userName && (
                        <span style={{ display: 'block', fontSize: 11, color: '#64748b', marginTop: 2 }}>{raffle.winnerInfo.userEmail}</span>
                      )}
                    </td>
                    <td className={styles.finishedTdDate}>
                      {new Date(raffle.raffleExecutedAt).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getClosureStatusBadgeClass(raffle)}`}>
                        {getClosureStatusLabel(raffle)}
                      </span>
                    </td>
                    <td className={styles.finishedTdActions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnVer}`}
                        onClick={() => {
                          setSelectedRaffle(raffle);
                          setShowDetail(true);
                        }}
                      >
                        <FiExternalLink size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

      {/* Detail Modal - Detalles del Sorteo Finalizado */}
      {showDetail && selectedRaffle && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.detailModalContent}>
            <div className={styles.detailModalHeader}>
              <h2>Detalles del Sorteo Finalizado</h2>
            </div>

            <div className={styles.detailModalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailGridItem}>
                  <label>ID Oportunidad</label>
                  <p className={styles.valueMono}>{selectedRaffle.id}</p>
                </div>
                <div className={styles.detailGridItem}>
                  <label>Organizador</label>
                  <p className={styles.value}>{selectedRaffle.shop.name}</p>
                </div>
                <div className={styles.detailGridItem}>
                  <label>Producto</label>
                  <p className={styles.value}>{selectedRaffle.product.name}</p>
                </div>
                <div className={styles.detailGridItem}>
                  <label>Valor de Ticket</label>
                  <p className={styles.value}>S/. {selectedRaffle.productValue.toFixed(2)}</p>
                </div>
                <div className={styles.detailGridItem}>
                  <label>Tickets Vendidos</label>
                  <p className={styles.value}>
                    {selectedRaffle.soldTickets} / {selectedRaffle.totalTickets}
                  </p>
                </div>
                <div className={styles.detailGridItem}>
                  <label>Ticket ganador</label>
                  <p className={styles.value}>{getWinnerTicket(selectedRaffle)}</p>
                </div>
                <div className={styles.detailGridItem}>
                  <label>Nombre de usuario</label>
                  <p className={styles.value}>
                    {selectedRaffle.winnerInfo?.userName || selectedRaffle.winnerInfo?.userEmail || '—'}
                    {selectedRaffle.winnerInfo?.userEmail && selectedRaffle.winnerInfo?.userName && (
                      <span style={{ display: 'block', fontSize: 13, color: '#64748b', marginTop: 4 }}>{selectedRaffle.winnerInfo.userEmail}</span>
                    )}
                  </p>
                </div>
                <div className={styles.detailGridItem}>
                  <label>Estado</label>
                  <p className={styles.value}>
                    <span className={`${styles.statusBadge} ${getClosureStatusBadgeClass(selectedRaffle)}`}>
                      {getClosureStatusLabel(selectedRaffle)}
                    </span>
                  </p>
                </div>
                <div className={styles.detailGridItem} style={{ gridColumn: '1 / -1' }}>
                  <label>Fecha de Finalización</label>
                  <p className={styles.value}>
                    {new Date(selectedRaffle.raffleExecutedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Ciclo de vida - Timeline */}
              <section className={styles.lifecycleSection}>
                <h3 className={styles.lifecycleSectionTitle}>Ciclo de vida</h3>
                <ul className={styles.lifecycleTimeline}>
                  <li className={styles.lifecycleStep}>
                    <span className={`${styles.lifecycleStepIcon} ${selectedRaffle.winnerInfo?.claimedAt ? styles.done : styles.pending}`}>
                      {selectedRaffle.winnerInfo?.claimedAt ? <FiCheck size={12} /> : <FiCircle size={12} />}
                    </span>
                    <div className={styles.lifecycleStepText}>
                      Código único de ganador registrado
                      <div className={styles.lifecycleStepDate}>{formatDate(selectedRaffle.winnerInfo?.claimedAt)}</div>
                    </div>
                  </li>
                  <li className={styles.lifecycleStep}>
                    <span className={`${styles.lifecycleStepIcon} ${selectedRaffle.winnerInfo?.deliveryEvidence?.photoUrl ? styles.done : styles.pending}`}>
                      {selectedRaffle.winnerInfo?.deliveryEvidence?.photoUrl ? <FiCheck size={12} /> : <FiCircle size={12} />}
                    </span>
                    <div className={styles.lifecycleStepText}>
                      Organizador entregó producto (evidencia)
                      <div className={styles.lifecycleStepDate}>
                        {selectedRaffle.winnerInfo?.deliveryEvidence?.uploadedAt
                          ? formatDate(selectedRaffle.winnerInfo.deliveryEvidence.uploadedAt)
                          : '—'}
                      </div>
                    </div>
                  </li>
                  <li className={styles.lifecycleStep}>
                    <span className={`${styles.lifecycleStepIcon} ${selectedRaffle.winnerInfo?.deliveryConfirmedAt ? styles.done : styles.pending}`}>
                      {selectedRaffle.winnerInfo?.deliveryConfirmedAt ? <FiCheck size={12} /> : <FiCircle size={12} />}
                    </span>
                    <div className={styles.lifecycleStepText}>
                      Ganador confirmó recepción
                      <div className={styles.lifecycleStepDate}>{formatDate(selectedRaffle.winnerInfo?.deliveryConfirmedAt)}</div>
                    </div>
                  </li>
                  <li className={styles.lifecycleStep}>
                    <span className={`${styles.lifecycleStepIcon} ${selectedRaffle.paymentToOrganizerAt ? styles.done : styles.pending}`}>
                      {selectedRaffle.paymentToOrganizerAt ? <FiCheck size={12} /> : <FiCircle size={12} />}
                    </span>
                    <div className={styles.lifecycleStepText}>
                      Pago al organizador
                      <div className={styles.lifecycleStepDate}>{formatDate(selectedRaffle.paymentToOrganizerAt)}</div>
                      {selectedRaffle.paymentEvidenceUrl && (
                        <a
                          href={selectedRaffle.paymentEvidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.evidenceLink}
                        >
                          <FiExternalLink size={14} />
                          Ver evidencia de pago
                        </a>
                      )}
                    </div>
                  </li>
                </ul>

                {/* Cómo se completa el ciclo */}
                <div className={styles.lifecycleHelp}>
                  <h4 className={styles.lifecycleHelpTitle}>Cómo se completa el ciclo</h4>
                  <ul className={styles.lifecycleHelpList}>
                    <li>
                      <strong>1. Código único de ganador registrado</strong><br />
                      Lo hace el <strong>organizador</strong>: en el detalle del sorteo (<code>/sorteos/{selectedRaffle.id}</code>) debe ingresar el código que el ganador le dio al contactarlo. Así se marca que validó al ganador.
                    </li>
                    <li>
                      <strong>2. Organizador entregó producto (evidencia)</strong><br />
                      Lo hace el <strong>organizador</strong>: en el mismo detalle del sorteo, después de validar el código, puede subir la foto o evidencia de entrega del premio.
                    </li>
                    <li>
                      <strong>3. Ganador confirmó recepción</strong><br />
                      Lo hace el <strong>ganador</strong>: en su panel (<code>/user-panel/won-raffles</code>), en “Sorteos ganados”, puede ver la evidencia y hacer clic en “Confirmar recepción” cuando reciba el premio.
                    </li>
                    <li>
                      <strong>4. Pago al organizador</strong><br />
                      Lo hace el <strong>admin</strong>: en este modal se sube la evidencia del pago realizado al organizador (arriba).
                    </li>
                  </ul>
                </div>
              </section>

              {/* Mensaje tras registrar pago: confirmar en Pagos */}
              {paymentJustRegistered && selectedRaffle.paymentToOrganizerAt && (
                <div style={{ padding: '14px 18px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', color: '#065f46' }}>
                  <strong>Pago registrado correctamente.</strong> Aparecerá en la pestaña <strong>Pagos (confirmar)</strong> del panel para que puedas confirmarlo.
                </div>
              )}

              {/* Registrar pago al organizador */}
              {!selectedRaffle.paymentToOrganizerAt && (
                <div className={styles.uploadSection}>
                  <p className={styles.uploadSectionTitle}>Registrar pago al organizador</p>
                  <p className={styles.uploadSectionDesc}>
                    Sube la evidencia del pago realizado al organizador. Se enviará un correo al organizador y se actualizará el registro.
                  </p>
                  <div className={styles.uploadZone}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setPaymentFile(f || null);
                        setPaymentError(null);
                      }}
                    />
                    {paymentFile && (
                      <span className={styles.uploadFileChip}>
                        {paymentFile.name}
                        <button
                          type="button"
                          onClick={() => { setPaymentFile(null); setPaymentError(null); }}
                          aria-label="Quitar archivo"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={paymentUploading || !paymentFile}
                    onClick={handleRegisterPayment}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    {paymentUploading ? (
                      'Subiendo...'
                    ) : (
                      <>
                        <FiUpload size={16} />
                        Registrar pago
                      </>
                    )}
                  </button>
                  {paymentError && (
                    <p style={{ marginTop: 12, fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{paymentError}</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.detailModalFooter}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeDetail}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}