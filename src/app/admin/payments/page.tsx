'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiCheck, FiX, FiEye, FiClock, FiAlertCircle, FiDownload } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import { firebasePaymentService, Payment } from '@/services/firebase-payment-service';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/app/panel/panel.module.css';

interface PaymentWithDetails extends Payment {
  userName?: string;
  userEmail?: string;
  raffleName?: string;
}

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [validating, setValidating] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingPayments();
      
      // Enrich payments with user and raffle data
      const enrichedPayments = await Promise.all(
        data.map(async (payment) => {
          const userData = await adminService.getUserData(payment.userId);
          const raffleData = await adminService.getRaffleData(payment.raffleId);
          
          return {
            ...payment,
            userName: userData.name,
            userEmail: userData.email,
            raffleName: raffleData.name,
          } as PaymentWithDetails;
        })
      );
      
      setPayments(enrichedPayments);
    } catch (error) {
      console.error('Error loading pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedPayment || !user) return;

    try {
      setValidating(true);
      
      // Approve payment and assign tickets
      await adminService.approvePaymentAndAssignTickets(
        selectedPayment.id,
        user.uid
      );
      
      alert('✅ Pago aprobado y tickets asignados exitosamente');
      
      // Reload list
      await loadPendingPayments();
      
      // Close modal
      setSelectedPayment(null);
    } catch (error: any) {
      console.error('Error approving payment:', error);
      alert(`Error al aprobar el pago: ${error.message}`);
    } finally {
      setValidating(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment || !user || !rejectReason.trim()) {
      alert('Por favor ingresa un motivo de rechazo');
      return;
    }

    try {
      setValidating(true);
      
      // Reject payment
      await firebasePaymentService.rejectPayment(
        selectedPayment.id,
        user.uid,
        rejectReason
      );
      
      alert('❌ Pago rechazado');
      
      // Reload list
      await loadPendingPayments();
      
      // Close modals
      setSelectedPayment(null);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      alert(`Error al rechazar el pago: ${error.message}`);
    } finally {
      setValidating(false);
    }
  };

  const downloadVoucher = (url: string) => {
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: string } } = {
      pending: { label: 'Pendiente', color: '#FF9800' },
      pending_validation: { label: 'En validación', color: '#2196F3' },
      completed: { label: 'Completado', color: '#4CAF50' },
      failed: { label: 'Fallido', color: '#F44336' },
      refunded: { label: 'Reembolsado', color: '#9C27B0' },
    };

    const config = statusConfig[status] || { label: status, color: '#757575' };
    
    return (
      <span className={styles.badge} style={{ backgroundColor: config.color }}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Cargando pagos pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Validación de Pagos</h1>
        <p className={styles.subtitle}>
          Revisa y valida los pagos con comprobantes subidos por los usuarios
        </p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <FiClock className={styles.statIcon} />
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{payments.length}</div>
            <div className={styles.statLabel}>Pagos pendientes</div>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className={styles.emptyState}>
          <FiCheck className={styles.emptyIcon} />
          <h3>No hay pagos pendientes</h3>
          <p>Todos los pagos han sido validados</p>
        </div>
      ) : (
        <div className={styles.paymentsGrid}>
          {payments.map((payment) => (
            <div key={payment.id} className={styles.paymentCard}>
              <div className={styles.paymentHeader}>
                <div>
                  <h3 className={styles.paymentUser}>{payment.userName || 'Usuario'}</h3>
                  <p className={styles.paymentEmail}>{payment.userEmail || 'N/A'}</p>
                </div>
                {getStatusBadge(payment.status)}
              </div>

              <div className={styles.paymentDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Sorteo:</span>
                  <span className={styles.detailValue}>
                    {payment.raffleName || 'N/A'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tickets:</span>
                  <span className={styles.detailValue}>{payment.ticketQuantity}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Monto:</span>
                  <span className={styles.detailValue}>
                    S/. {Number(payment.amount).toFixed(2)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Método:</span>
                  <span className={styles.detailValue}>
                    {payment.paymentMethod?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>

              {payment.ocrProcessed && (
                <div className={styles.ocrSection}>
                  <div className={styles.ocrHeader}>
                    <FiAlertCircle className={styles.ocrIcon} />
                    <span>Validación OCR</span>
                  </div>
                  <div className={styles.ocrDetails}>
                    <div className={styles.ocrRow}>
                      <span>Monto detectado:</span>
                      <span className={styles.ocrValue}>
                        S/ {payment.ocrExtractedAmount?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className={styles.ocrRow}>
                      <span>Confianza:</span>
                      <span className={styles.ocrValue}>
                        {payment.ocrConfidence ? 
                          `${(payment.ocrConfidence * 100).toFixed(0)}%` : 
                          'N/A'}
                      </span>
                    </div>
                    <div className={styles.ocrRow}>
                      <span>Estado:</span>
                      <span className={payment.ocrValid ? styles.ocrValid : styles.ocrInvalid}>
                        {payment.ocrValid ? '✓ Válido' : '✗ No válido'}
                      </span>
                    </div>
                    {payment.ocrMessage && (
                      <div className={styles.ocrRow}>
                        <span>Mensaje:</span>
                        <span className={styles.ocrValue}>
                          {payment.ocrMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                className={styles.reviewButton}
                onClick={() => setSelectedPayment(payment)}
              >
                <FiEye className={styles.buttonIcon} />
                Revisar comprobante
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && selectedPayment && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.rejectModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Rechazar Pago</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowRejectModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalContent}>
              <p className={styles.rejectWarning}>
                ⚠️ Estás a punto de rechazar este pago. El usuario recibirá un correo con el motivo del rechazo.
              </p>

              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Motivo del rechazo *</h3>
                <textarea
                  className={styles.notesTextarea}
                  placeholder="Ejemplo: El monto del comprobante no coincide con el monto esperado..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  disabled={validating}
                >
                  Cancelar
                </button>
                <button
                  className={styles.confirmRejectButton}
                  onClick={handleRejectPayment}
                  disabled={validating || !rejectReason.trim()}
                >
                  <FiX className={styles.buttonIcon} />
                  {validating ? 'Procesando...' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de revisión */}
      {selectedPayment && !showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPayment(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Validar Pago</h2>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedPayment(null)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Información del pago */}
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Información del pago</h3>
                <div className={styles.modalInfo}>
                  <div className={styles.modalInfoRow}>
                    <span>Usuario:</span>
                    <strong>{selectedPayment.userName}</strong>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>Email:</span>
                    <strong>{selectedPayment.userEmail}</strong>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>Sorteo:</span>
                    <strong>{selectedPayment.raffleName}</strong>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>Tickets:</span>
                    <strong>{selectedPayment.ticketQuantity}</strong>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>Monto esperado:</span>
                    <strong className={styles.expectedAmount}>
                      S/. {Number(selectedPayment.amount).toFixed(2)}
                    </strong>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>Método:</span>
                    <strong>{selectedPayment.paymentMethod?.toUpperCase()}</strong>
                  </div>
                </div>
              </div>

              {/* Validación OCR */}
              {selectedPayment.ocrProcessed && (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Resultado OCR</h3>
                  <div className={styles.ocrResult}>
                    <div className={styles.ocrResultRow}>
                      <span>Monto detectado:</span>
                      <strong className={selectedPayment.ocrValid ? styles.validAmount : styles.invalidAmount}>
                        S/ {selectedPayment.ocrExtractedAmount?.toFixed(2) || 'N/A'}
                      </strong>
                    </div>
                    <div className={styles.ocrResultRow}>
                      <span>Confianza del OCR:</span>
                      <strong>
                        {selectedPayment.ocrConfidence ? 
                          `${(selectedPayment.ocrConfidence * 100).toFixed(0)}%` : 
                          'N/A'}
                      </strong>
                    </div>
                    <div className={styles.ocrResultRow}>
                      <span>Estado:</span>
                      <strong className={selectedPayment.ocrValid ? styles.validAmount : styles.invalidAmount}>
                        {selectedPayment.ocrValid ? '✓ Válido' : '✗ No válido'}
                      </strong>
                    </div>
                    {selectedPayment.ocrMessage && (
                      <div className={styles.ocrResultRow}>
                        <span>Mensaje:</span>
                        <strong>{selectedPayment.ocrMessage}</strong>
                      </div>
                    )}
                    {selectedPayment.ocrProcessedAt && (
                      <div className={styles.ocrResultRow}>
                        <span>Procesado:</span>
                        <strong>
                          {new Date(selectedPayment.ocrProcessedAt).toLocaleString('es-PE')}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comprobante */}
              <div className={styles.modalSection}>
                <div className={styles.voucherHeader}>
                  <h3 className={styles.modalSectionTitle}>Comprobante de pago</h3>
                  {selectedPayment.voucherUrl && (
                    <button
                      className={styles.downloadButton}
                      onClick={() => downloadVoucher(selectedPayment.voucherUrl!)}
                    >
                      <FiDownload />
                      Descargar
                    </button>
                  )}
                </div>
                {selectedPayment.voucherUrl ? (
                  <div className={styles.voucherContainer}>
                    <Image
                      src={selectedPayment.voucherUrl}
                      alt="Comprobante"
                      width={600}
                      height={800}
                      className={styles.voucherImage}
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className={styles.noVoucher}>No hay comprobante disponible</p>
                )}
              </div>

              {/* Acciones */}
              <div className={styles.modalActions}>
                <button
                  className={styles.rejectButton}
                  onClick={() => setShowRejectModal(true)}
                  disabled={validating}
                >
                  <FiX className={styles.buttonIcon} />
                  Rechazar
                </button>
                <button
                  className={styles.approveButton}
                  onClick={handleApprovePayment}
                  disabled={validating}
                >
                  <FiCheck className={styles.buttonIcon} />
                  {validating ? 'Procesando...' : 'Aprobar y asignar tickets'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}