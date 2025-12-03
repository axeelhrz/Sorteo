'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin-service';
import styles from '../admin.module.css';

interface Payment {
  id: string;
  user: { id: string; name: string; email: string };
  raffle: {
    id: string;
    product: { name: string };
    shop: { name: string };
  };
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  ticketQuantity: number;
  externalTransactionId: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
  failedAt: string | null;
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const limit = 15;

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllPayments(
        limit,
        page * limit,
        statusFilter ? { status: statusFilter } : undefined,
      );
      setPayments(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar transacciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      completed: 'Completado',
      failed: 'Fallido',
      refunded: 'Reembolsado',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.success;
      case 'pending':
        return styles.warning;
      case 'failed':
      case 'cancelled':
        return styles.danger;
      case 'refunded':
        return styles.info;
      default:
        return '';
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'N/A';
    const labels: { [key: string]: string } = {
      stripe: 'Stripe',
      mercado_pago: 'Mercado Pago',
      paypal: 'PayPal',
    };
    return labels[method] || method;
  };

  if (loading && payments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando transacciones...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Gestión de Transacciones</h2>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className={styles.tableHeader} style={{ marginBottom: '20px' }}>
        <div className={styles.filterContainer}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#7f8c8d' }}>No hay transacciones registradas</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Sorteo</th>
                <th>Tienda</th>
                <th>Monto</th>
                <th>Tickets</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <div>
                      <p style={{ margin: '0', fontWeight: '600', color: '#2c3e50' }}>{payment.user.name}</p>
                      <small style={{ color: '#7f8c8d' }}>{payment.user.email}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p style={{ margin: '0', color: '#2c3e50' }}>{payment.raffle.product.name}</p>
                      <small style={{ color: '#7f8c8d' }}>ID: {payment.raffle.id.substring(0, 8)}...</small>
                    </div>
                  </td>
                  <td>{payment.raffle.shop.name}</td>
                  <td>
                    <strong style={{ color: '#27ae60' }}>
                      S/. {Number(payment.amount).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td>{payment.ticketQuantity}</td>
                  <td>{getPaymentMethodLabel(payment.paymentMethod)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(payment.createdAt).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => {
                          setSelectedPayment(payment);
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
      {showDetail && selectedPayment && (
        <div className={`${styles.modal} ${showDetail ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalles de la Transacción</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>ID de Transacción</label>
                <p style={{ margin: '5px 0', color: '#2c3e50', wordBreak: 'break-all' }}>{selectedPayment.id}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Usuario</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {selectedPayment.user.name} ({selectedPayment.user.email})
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Sorteo</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedPayment.raffle.product.name}</p>
                <small style={{ color: '#7f8c8d' }}>ID: {selectedPayment.raffle.id}</small>
              </div>

              <div className={styles.formGroup}>
                <label>Tienda</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedPayment.raffle.shop.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Monto</label>
                <p style={{ margin: '5px 0', color: '#27ae60', fontSize: '20px', fontWeight: 'bold' }}>
                  S/. {Number(selectedPayment.amount).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Cantidad de Tickets</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedPayment.ticketQuantity}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Método de Pago</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{getPaymentMethodLabel(selectedPayment.paymentMethod)}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Estado</label>
                <p style={{ margin: '5px 0' }}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeColor(selectedPayment.status)}`}>
                    {getStatusLabel(selectedPayment.status)}
                  </span>
                </p>
              </div>

              {selectedPayment.externalTransactionId && (
                <div className={styles.formGroup}>
                  <label>ID de Transacción Externa</label>
                  <p style={{ margin: '5px 0', color: '#2c3e50', wordBreak: 'break-all' }}>
                    {selectedPayment.externalTransactionId}
                  </p>
                </div>
              )}

              {selectedPayment.failureReason && (
                <div className={styles.formGroup}>
                  <label>Motivo de Fallo</label>
                  <p style={{ margin: '5px 0', color: '#e74c3c' }}>{selectedPayment.failureReason}</p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Fecha de Creación</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {new Date(selectedPayment.createdAt).toLocaleString('es-PE')}
                </p>
              </div>

              {selectedPayment.completedAt && (
                <div className={styles.formGroup}>
                  <label>Fecha de Completado</label>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                    {new Date(selectedPayment.completedAt).toLocaleString('es-PE')}
                  </p>
                </div>
              )}

              {selectedPayment.failedAt && (
                <div className={styles.formGroup}>
                  <label>Fecha de Fallo</label>
                  <p style={{ margin: '5px 0', color: '#e74c3c' }}>
                    {new Date(selectedPayment.failedAt).toLocaleString('es-PE')}
                  </p>
                </div>
              )}
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

