'use client';

import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { Raffle } from '@/types/raffle';
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
  isLoading?: boolean;
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
  isLoading = false,
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
                <h2 className={styles.modalTitleNew}>Detalles del Sorteo</h2>
                <p className={styles.modalSubtitle}>Información completa del sorteo</p>
              </div>
              <button className={styles.modalCloseBtnNew} onClick={onCloseViewModal}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBodyNew}>
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
                      textTransform: 'capitalize',
                    }}
                  >
                    {viewModal.raffle.status}
                  </span>
                </div>

                {/* Tickets */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Tickets
                  </h3>
                  <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                    {viewModal.raffle.soldTickets} / {viewModal.raffle.totalTickets}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {Math.round((viewModal.raffle.soldTickets / viewModal.raffle.totalTickets) * 100)}% vendidos
                  </p>
                </div>

                {/* Valor del Ticket */}
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Valor del Ticket
                  </h3>
                  <p style={{ margin: '0', fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                    S/. {viewModal.raffle.productValue.toFixed(2)}
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
              <button className={styles.modalCloseBtnNew} onClick={onCloseActivateModal}>
                <FiX />
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
              <button className={styles.modalCloseBtnNew} onClick={onCloseDeleteModal}>
                <FiX />
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