'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiCheck, FiX, FiEye, FiClock, FiAlertCircle } from 'react-icons/fi';
import { paymentService } from '@/services/payment-service';
import { Payment } from '@/types/payment';
import styles from './payments.module.css';

interface PaymentWithDetails extends Payment {
  user?: {
    name: string;
    email: string;
  };
  raffle?: {
    id: string;
    product?: {
      name: string;
    };
  };
  voucherUrl?: string;
  ocrValidation?: {
    detectedAmount?: number;
    confidence?: number;
    isValid?: boolean;
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPendingPayments();
      setPayments(data as PaymentWithDetails[]);
    } catch (error) {
      console.error('Error loading pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePayment = async (paymentId: string, approved: boolean) => {
    try {
      setValidating(true);
      await paymentService.validatePayment(paymentId, approved, validationNotes);
      
      // Recargar lista
      await loadPendingPayments();
      
      // Cerrar modal
      setSelectedPayment(null);
      setValidationNotes('');
    } catch (error) {
      console.error('Error validating payment:', error);
      alert('Error al validar el pago');
    } finally {
      setValidating(false);
    }
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
                  <h3 className={styles.paymentUser}>{payment.user?.name || 'Usuario'}</h3>
                  <p className={styles.paymentEmail}>{payment.user?.email}</p>
                </div>
                {getStatusBadge(payment.status)}
              </div>

              <div className={styles.paymentDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Sorteo:</span>
                  <span className={styles.detailValue}>
                    {payment.raffle?.product?.name || 'N/A'}
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

              {payment.ocrValidation && (
                <div className={styles.ocrSection}>
                  <div className={styles.ocrHeader}>
                    <FiAlertCircle className={styles.ocrIcon} />
                    <span>Validación OCR</span>
                  </div>
                  <div className={styles.ocrDetails}>
                    <div className={styles.ocrRow}>
                      <span>Monto detectado:</span>
                      <span className={styles.ocrValue}>
                        S/. {payment.ocrValidation.detectedAmount?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className={styles.ocrRow}>
                      <span>Confianza:</span>
                      <span className={styles.ocrValue}>
                        {payment.ocrValidation.confidence ? 
                          `${(payment.ocrValidation.confidence * 100).toFixed(0)}%` : 
                          'N/A'}
                      </span>
                    </div>
                    <div className={styles.ocrRow}>
                      <span>Estado:</span>
                      <span className={payment.ocrValidation.isValid ? styles.ocrValid : styles.ocrInvalid}>
                        {payment.ocrValidation.isValid ? '✓ Válido' : '✗ No válido'}
                      </span>
                    </div>
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

      {/* Modal de revisión */}
      {selectedPayment && (
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
                    <strong>{selectedPayment.user?.name}</strong>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>Email:</span>
                    <strong>{selectedPayment.user?.email}</strong>
                  </div>
                  <div className={styles.modalInfoRow}>
                    <span>Sorteo:</span>
                    <strong>{selectedPayment.raffle?.product?.name}</strong>
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
              {selectedPayment.ocrValidation && (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Resultado OCR</h3>
                  <div className={styles.ocrResult}>
                    <div className={styles.ocrResultRow}>
                      <span>Monto detectado:</span>
                      <strong className={selectedPayment.ocrValidation.isValid ? styles.validAmount : styles.invalidAmount}>
                        S/. {selectedPayment.ocrValidation.detectedAmount?.toFixed(2) || 'N/A'}
                      </strong>
                    </div>
                    <div className={styles.ocrResultRow}>
                      <span>Confianza del OCR:</span>
                      <strong>
                        {selectedPayment.ocrValidation.confidence ? 
                          `${(selectedPayment.ocrValidation.confidence * 100).toFixed(0)}%` : 
                          'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Comprobante */}
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Comprobante de pago</h3>
                {selectedPayment.voucherUrl ? (
                  <div className={styles.voucherContainer}>
                    <Image
                      src={selectedPayment.voucherUrl}
                      alt="Comprobante"
                      width={600}
                      height={400}
                      className={styles.voucherImage}
                    />
                  </div>
                ) : (
                  <p className={styles.noVoucher}>No hay comprobante disponible</p>
                )}
              </div>

              {/* Notas de validación */}
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Notas (opcional)</h3>
                <textarea
                  className={styles.notesTextarea}
                  placeholder="Agrega notas sobre esta validación..."
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Acciones */}
              <div className={styles.modalActions}>
                <button
                  className={styles.rejectButton}
                  onClick={() => handleValidatePayment(selectedPayment.id, false)}
                  disabled={validating}
                >
                  <FiX className={styles.buttonIcon} />
                  {validating ? 'Procesando...' : 'Rechazar'}
                </button>
                <button
                  className={styles.approveButton}
                  onClick={() => handleValidatePayment(selectedPayment.id, true)}
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