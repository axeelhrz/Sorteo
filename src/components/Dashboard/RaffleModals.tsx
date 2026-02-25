'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { Raffle, WinnerInfo } from '@/types/raffle';
import { WinnerValidation } from '@/components/ShopPanel/WinnerValidation';
import { DeliveryEvidenceUpload } from '@/components/ShopPanel/DeliveryEvidenceUpload';
import styles from './StoreDashboard.module.css';

interface RaffleModalsProps {
  viewModal: {
    isOpen: boolean;
    raffle: Raffle | null;
  };
  activateModal: {
    isOpen: boolean;
    raffleId: string | null;
    raffleName: string | null;
  };
  deleteModal: {
    isOpen: boolean;
    raffleId: string | null;
    raffleName: string | null;
  };
  onCloseViewModal: () => void;
  onCloseActivateModal: () => void;
  onCloseDeleteModal: () => void;
  onConfirmActivate: (raffleId: string) => Promise<void>;
  onConfirmDelete: (raffleId: string) => Promise<void>;
  onValidationSuccess?: (winnerInfo: WinnerInfo) => void;
  /** ID del organizador (para subir evidencia de entrega). */
  currentUserId?: string;
  onEvidenceUploadSuccess?: (winnerInfo: WinnerInfo) => void;
}

export default function RaffleModals({
  viewModal,
  activateModal,
  deleteModal,
  onCloseViewModal,
  onCloseActivateModal,
  onCloseDeleteModal,
  onConfirmActivate,
  onConfirmDelete,
  onValidationSuccess,
  currentUserId,
  onEvidenceUploadSuccess,
}: RaffleModalsProps) {
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleActivate = async () => {
    if (!activateModal.raffleId) return;
    try {
      setActivatingId(activateModal.raffleId);
      await onConfirmActivate(activateModal.raffleId);
      onCloseActivateModal();
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.raffleId) return;
    try {
      setDeletingId(deleteModal.raffleId);
      await onConfirmDelete(deleteModal.raffleId);
      onCloseDeleteModal();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* View Modal */}
      {viewModal.isOpen && viewModal.raffle && (
        <div className={styles.modalOverlay} onClick={onCloseViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderNew}>
              <div className={styles.modalHeaderLeft}>
                <h2 className={styles.modalTitleNew}>Detalles de la Oportunidad</h2>
                <p className={styles.modalSubtitle}>Información completa de la oportunidad</p>
              </div>
              <button className={styles.modalCloseBtnNew} onClick={onCloseViewModal} type="button" aria-label="Cerrar">
                <span className={styles.modalCloseX}>×</span>
              </button>
            </div>

            <div className={styles.modalBodyNew}>
              {/* Imagen del producto: se ve completa (contain), sin recortar */}
              <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', position: 'relative', width: '100%', minHeight: '200px', maxHeight: '480px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(viewModal.raffle.thumbnail || viewModal.raffle.product?.mainImage) ? (
                  <Image
                    src={viewModal.raffle.thumbnail || viewModal.raffle.product!.mainImage!}
                    alt={viewModal.raffle.product?.name || 'Producto'}
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', color: '#94a3b8', fontSize: '14px' }}>
                    Sin imagen disponible
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Información del Producto */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Producto
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    {viewModal.raffle.product?.name || 'Sin nombre'}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                    {viewModal.raffle.product?.description || 'Sin descripción'}
                  </p>
                </div>

                {/* Estado */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Estado
                  </h3>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: '#f0f4ff',
                      color: '#6366f1',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '700',
                    }}
                  >
                    {viewModal.raffle.status === 'draft' && 'Borrador'}
                    {viewModal.raffle.status === 'pending_approval' && 'Pendiente'}
                    {viewModal.raffle.status === 'active' && 'Activo'}
                    {viewModal.raffle.status === 'paused' && 'Pausado'}
                    {viewModal.raffle.status === 'sold_out' && 'Agotado'}
                    {viewModal.raffle.status === 'finished' && 'Finalizado'}
                    {viewModal.raffle.status === 'cancelled' && 'Cancelado'}
                    {viewModal.raffle.status === 'rejected' && 'Rechazado'}
                    {!['draft', 'pending_approval', 'active', 'paused', 'sold_out', 'finished', 'cancelled', 'rejected'].includes(viewModal.raffle.status) && String(viewModal.raffle.status)}
                  </span>
                </div>

                {/* Tickets (no se muestra mientras está pendiente de aprobación) */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Tickets
                  </h3>
                  {viewModal.raffle.status === 'draft' || viewModal.raffle.status === 'pending_approval' ? (
                    <p style={{ margin: '0', fontSize: '14px', color: '#94a3b8' }}>—</p>
                  ) : viewModal.raffle.totalTickets != null && viewModal.raffle.totalTickets > 0 ? (
                    <>
                      <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                        {viewModal.raffle.soldTickets} / {viewModal.raffle.totalTickets}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                        {Math.round((viewModal.raffle.soldTickets / viewModal.raffle.totalTickets) * 100)}% vendidos
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                      El número de tickets aún no está definido
                    </p>
                  )}
                </div>

                {/* Valor del Producto (valor declarado por el organizador) */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Valor del Producto
                  </h3>
                  <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                    {viewModal.raffle.product?.value != null
                      ? `S/. ${Math.round(Number(viewModal.raffle.product.value)).toLocaleString('es-PE')}`
                      : '—'}
                  </p>
                </div>

                {/* Delivery */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Delivery
                  </h3>
                  <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                    {viewModal.raffle.product?.pickupInStore
                      ? 'N/A'
                      : viewModal.raffle.product?.deliveryCost != null && viewModal.raffle.product.deliveryCost > 0
                        ? `S/. ${Number(viewModal.raffle.product.deliveryCost).toFixed(2)}`
                        : 'N/A'}
                  </p>
                </div>

                {/* Fecha de Creación */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Creado
                  </h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#0f172a' }}>
                    {new Date(viewModal.raffle.createdAt).toLocaleDateString('es-PE')}
                  </p>
                </div>

                {/* Actualizado */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Actualizado
                  </h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#0f172a' }}>
                    {new Date(viewModal.raffle.updatedAt).toLocaleDateString('es-PE')}
                  </p>
                </div>

                {/* Condiciones Especiales */}
                {viewModal.raffle.specialConditions && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                      Condiciones Especiales
                    </h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#0f172a', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {viewModal.raffle.specialConditions}
                    </p>
                  </div>
                )}
              </div>

              {/* Validar código del ganador (solo sorteos finalizados) */}
              {viewModal.raffle.status === 'finished' && viewModal.raffle.winnerTicketId && (
                <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  {!viewModal.raffle.winnerInfo?.claimedAt ? (
                    <WinnerValidation
                      raffleId={viewModal.raffle.id}
                      onValidationSuccess={(winnerInfo) => {
                        onValidationSuccess?.(winnerInfo);
                      }}
                    />
                  ) : (
                    <>
                      <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <FiCheck style={{ color: '#059669', fontSize: '20px', flexShrink: 0 }} />
                          <span style={{ fontSize: '15px', fontWeight: '700', color: '#065f46' }}>Código del ganador ya validado</span>
                        </div>
                        {viewModal.raffle.winnerInfo.claimedAt && (
                          <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                            Validado el {new Date(viewModal.raffle.winnerInfo.claimedAt).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>

                      {/* Evidencia de entrega: subir o ver ya subida */}
                      {!viewModal.raffle.winnerInfo.deliveryEvidence ? (
                        currentUserId && (
                          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                            <DeliveryEvidenceUpload
                              raffleId={viewModal.raffle.id}
                              currentUserId={currentUserId}
                              onUploadSuccess={(winnerInfo) => {
                                onEvidenceUploadSuccess?.(winnerInfo);
                              }}
                            />
                          </div>
                        )
                      ) : (
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Evidencia de entrega
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {viewModal.raffle.winnerInfo.deliveryEvidence.photoUrl && (
                              <a
                                href={viewModal.raffle.winnerInfo.deliveryEvidence.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'block', maxWidth: '280px' }}
                              >
                                <img
                                  src={viewModal.raffle.winnerInfo.deliveryEvidence.photoUrl}
                                  alt="Evidencia de entrega"
                                  style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                                />
                              </a>
                            )}
                            {viewModal.raffle.winnerInfo.deliveryEvidence.notes && (
                              <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}>
                                {viewModal.raffle.winnerInfo.deliveryEvidence.notes}
                              </p>
                            )}
                            {viewModal.raffle.winnerInfo.deliveryEvidence.uploadedAt && (
                              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                Subido el {new Date(viewModal.raffle.winnerInfo.deliveryEvidence.uploadedAt).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' })}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <button
                  onClick={onCloseViewModal}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate Modal */}
      {activateModal.isOpen && (
        <div className={styles.modalOverlay} onClick={onCloseActivateModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeaderNew}>
              <div className={styles.modalHeaderLeft}>
                <h2 className={styles.modalTitleNew}>Activar Sorteo</h2>
                <p className={styles.modalSubtitle}>Confirma que deseas activar este sorteo</p>
              </div>
              <button className={styles.modalCloseBtnNew} onClick={onCloseActivateModal} type="button" aria-label="Cerrar">
                <span className={styles.modalCloseX}>×</span>
              </button>
            </div>

            <div className={styles.modalBodyNew}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <FiAlertTriangle style={{ fontSize: '24px', color: '#d97706', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#92400e' }}>
                    Activar sorteo
                  </p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#b45309', lineHeight: '1.5' }}>
                    Una vez activado, el sorteo será enviado para revisión y no podrá volver a estado de borrador.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Sorteo a activar
                </p>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  {activateModal.raffleName}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <button
                  onClick={onCloseActivateModal}
                  disabled={activatingId !== null}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'white',
                    color: '#6366f1',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: activatingId !== null ? 0.5 : 1,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleActivate}
                  disabled={activatingId !== null}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: activatingId !== null ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: activatingId !== null ? 0.7 : 1,
                  }}
                >
                  {activatingId !== null ? 'Activando...' : 'Activar Sorteo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className={styles.modalOverlay} onClick={onCloseDeleteModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeaderNew}>
              <div className={styles.modalHeaderLeft}>
                <h2 className={styles.modalTitleNew}>Eliminar Sorteo</h2>
                <p className={styles.modalSubtitle}>Esta acción no se puede deshacer</p>
              </div>
              <button className={styles.modalCloseBtnNew} onClick={onCloseDeleteModal} type="button" aria-label="Cerrar">
                <span className={styles.modalCloseX}>×</span>
              </button>
            </div>

            <div className={styles.modalBodyNew}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', padding: '16px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <FiAlertTriangle style={{ fontSize: '24px', color: '#dc2626', flexShrink: 0 }} />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#7f1d1d' }}>
                    Peligro
                  </p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#991b1b', lineHeight: '1.5' }}>
                    Eliminar este sorteo eliminará todos los datos asociados. Esta acción es irreversible.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                  Sorteo a eliminar
                </p>
                <p style={{ margin: '0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  {deleteModal.raffleName}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <button
                  onClick={onCloseDeleteModal}
                  disabled={deletingId !== null}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'white',
                    color: '#6366f1',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    opacity: deletingId !== null ? 0.5 : 1,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletingId !== null}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: deletingId !== null ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: deletingId !== null ? 0.7 : 1,
                  }}
                >
                  {deletingId !== null ? 'Eliminando...' : 'Eliminar Sorteo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}