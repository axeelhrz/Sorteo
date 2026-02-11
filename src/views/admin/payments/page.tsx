'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiCheck, FiCheckCircle, FiX, FiEye, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import { firebasePaymentService, Payment } from '@/services/firebase-payment-service';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface PaymentWithDetails extends Payment {
  userName?: string;
  userEmail?: string;
  raffleName?: string;
  costPerTicket?: number;
}

export default function AdminPaymentsPage() {
  const { user } = useAdminAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [validating, setValidating] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadPendingPayments();
  }, [page]);

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
            costPerTicket: raffleData.costPerTicket,
          } as PaymentWithDetails;
        })
      );
      
      setPayments(enrichedPayments);
      setTotal(enrichedPayments.length);
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
      
      await adminService.approvePaymentAndAssignTickets(
        selectedPayment.id,
        user.uid
      );
      
      setSuccessMessage('Pago aprobado y tickets asignados exitosamente.');
      setShowSuccessModal(true);
      await loadPendingPayments();
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
      
      await firebasePaymentService.rejectPayment(
        selectedPayment.id,
        user.uid,
        rejectReason
      );
      
      setSuccessMessage('Pago rechazado. El usuario ha sido notificado.');
      setShowSuccessModal(true);
      await loadPendingPayments();
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
    const statusConfig: { [key: string]: { label: string; color: string; bgColor: string } } = {
      pending: { label: 'Pendiente', color: '#FF9800', bgColor: '#FFF3E0' },
      pending_validation: { label: 'En validación', color: '#2196F3', bgColor: '#E3F2FD' },
      completed: { label: 'Completado', color: '#4CAF50', bgColor: '#E8F5E9' },
      failed: { label: 'Fallido', color: '#F44336', bgColor: '#FFEBEE' },
      refunded: { label: 'Reembolsado', color: '#9C27B0', bgColor: '#F3E5F5' },
    };

    const config = statusConfig[status] || { label: status, color: '#757575', bgColor: '#F5F5F5' };
    
    return (
      <span style={{
        backgroundColor: config.bgColor,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
      }}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Cargando compras pendientes...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Aprobar compras de tickets
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Total: {total} compras pendientes de aprobación
        </p>
      </div>

      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e8ecf1' }}>
          <FiCheck style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px' }} />
          <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>No hay compras pendientes</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0' }}>Todas las compras de tickets han sido aprobadas</p>
        </div>
      ) : (
        <>
          {/* Tabla de pagos */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e8ecf1', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e8ecf1' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Usuario
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Sorteo
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Monto
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Método
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Estado
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #e8ecf1', transition: 'background-color 0.2s ease' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '2px' }}>{payment.userName || 'Usuario'}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{payment.userEmail || 'N/A'}</div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                        {payment.raffleName || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>
                        S/. {Number(payment.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                        {payment.paymentMethod?.toUpperCase() || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(payment.status)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          style={{
                            padding: '8px 14px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#5568d3';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#667eea';
                            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                          }}
                        >
                          <FiEye style={{ fontSize: '14px' }} />
                          Revisar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Página {page + 1} de {totalPages || 1}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                style={{
                  padding: '8px 14px',
                  backgroundColor: page === 0 ? '#f1f5f9' : 'white',
                  border: '1px solid #e8ecf1',
                  borderRadius: '6px',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: page === 0 ? '#cbd5e1' : '#475569',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (page > 0) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                    (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                  (e.currentTarget as HTMLElement).style.borderColor = '#e8ecf1';
                }}
              >
                <FiChevronLeft /> Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '8px 14px',
                  backgroundColor: page >= totalPages - 1 ? '#f1f5f9' : 'white',
                  border: '1px solid #e8ecf1',
                  borderRadius: '6px',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: page >= totalPages - 1 ? '#cbd5e1' : '#475569',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (page < totalPages - 1) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                    (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                  (e.currentTarget as HTMLElement).style.borderColor = '#e8ecf1';
                }}
              >
                Siguiente <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && selectedPayment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
              Rechazar Pago
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
              Por favor, proporciona una razón para rechazar este pago. El usuario recibirá una notificación.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ejemplo: El monto del comprobante no coincide con el monto esperado..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e8ecf1',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                marginBottom: '20px',
                minHeight: '100px',
                boxSizing: 'border-box',
                color: '#1e293b',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
                (e.currentTarget as HTMLElement).style.outline = 'none';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e8ecf1';
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectPayment}
                disabled={!rejectReason.trim() || validating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !rejectReason.trim() || validating ? '#cbd5e1' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !rejectReason.trim() || validating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (rejectReason.trim() && !validating) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#ef4444';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {validating ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito (aprobación o rechazo) */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px 24px 24px',
              maxWidth: '380px',
              width: '92%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <FiCheckCircle style={{ fontSize: 56, color: '#059669', marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#0f172a', fontWeight: 700 }}>
              Listo
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 15, lineHeight: 1.5 }}>
              {successMessage}
            </p>
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)',
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de revisión */}
      {selectedPayment && !showRejectModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => setSelectedPayment(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '700px',
              width: '100%',
              boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight: '700' }}>Validar Pago</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                type="button"
                title="Cerrar"
                aria-label="Cerrar"
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  fontSize: '20px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  color: '#334155',
                  padding: '6px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                }}
              >
                ×
              </button>
            </div>

            {/* Información del pago */}
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e8ecf1' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '16px', fontWeight: '700' }}>Información del pago</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Usuario</p>
                  <p style={{ margin: '0', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{selectedPayment.userName}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</p>
                  <p style={{ margin: '0', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sorteo</p>
                  <p style={{ margin: '0', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{selectedPayment.raffleName}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tickets</p>
                  <p style={{ margin: '0', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{selectedPayment.ticketQuantity}</p>
                </div>
                {selectedPayment.costPerTicket != null && (
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unidad de Participación</p>
                    <p style={{ margin: '0', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>S/. {Number(selectedPayment.costPerTicket).toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monto esperado</p>
                  <p style={{ margin: '0', color: '#10b981', fontSize: '16px', fontWeight: '700' }}>S/. {Number(selectedPayment.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Método</p>
                  <p style={{ margin: '0', color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{selectedPayment.paymentMethod?.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Validación OCR */}
            {selectedPayment.ocrProcessed && (
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e8ecf1' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '16px', fontWeight: '700' }}>Resultado OCR</h3>
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e8ecf1' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Monto detectado</p>
                      <p style={{ margin: '0', color: selectedPayment.ocrValid ? '#10b981' : '#ef4444', fontSize: '16px', fontWeight: '700' }}>
                        S/. {selectedPayment.ocrExtractedAmount?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Confianza</p>
                      <p style={{ margin: '0', color: '#1e293b', fontSize: '16px', fontWeight: '700' }}>
                        {selectedPayment.ocrConfidence ? `${(selectedPayment.ocrConfidence * 100).toFixed(0)}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Estado</p>
                      <p style={{ margin: '0', color: selectedPayment.ocrValid ? '#10b981' : '#ef4444', fontSize: '14px', fontWeight: '700' }}>
                        {selectedPayment.ocrValid ? 'Válido' : 'No válido'}
                      </p>
                    </div>
                    {selectedPayment.ocrMessage && (
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Mensaje</p>
                        <p style={{ margin: '0', color: '#1e293b', fontSize: '14px' }}>{selectedPayment.ocrMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comprobante */}
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e8ecf1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '700' }}>Comprobante de pago</h3>
                {selectedPayment.voucherUrl && (
                  <button
                    onClick={() => downloadVoucher(selectedPayment.voucherUrl!)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#5568d3';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#667eea';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <FiDownload style={{ fontSize: '14px' }} />
                    Descargar
                  </button>
                )}
              </div>
              {selectedPayment.voucherUrl ? (
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e8ecf1', maxHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                  <Image
                    src={selectedPayment.voucherUrl}
                    alt="Comprobante"
                    width={600}
                    height={800}
                    style={{ maxWidth: '100%', height: 'auto' }}
                    unoptimized
                  />
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0', textAlign: 'center', padding: '20px' }}>No hay comprobante disponible</p>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={validating}
                type="button"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  border: '2px solid #991b1b',
                  borderRadius: '8px',
                  cursor: validating ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: validating ? 0.6 : 1,
                  boxShadow: '0 2px 4px rgba(185, 28, 28, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!validating) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#991b1b';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(185, 28, 28, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#b91c1c';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(185, 28, 28, 0.3)';
                }}
              >
                <FiX style={{ fontSize: '16px' }} />
                Rechazar
              </button>
              <button
                onClick={handleApprovePayment}
                disabled={validating}
                type="button"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  border: '2px solid #065f46',
                  borderRadius: '8px',
                  cursor: validating ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: validating ? 0.6 : 1,
                  boxShadow: '0 2px 4px rgba(4, 120, 87, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!validating) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#065f46';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(4, 120, 87, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#047857';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(4, 120, 87, 0.3)';
                }}
              >
                <FiCheck style={{ fontSize: '16px' }} />
                {validating ? 'Procesando...' : 'Aprobar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}