'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiExternalLink } from 'react-icons/fi';
import { adminService, type RafflesListResponse } from '@/services/admin-service';
import Link from 'next/link';

interface Raffle {
  id: string;
  shop: { id: string; name: string };
  product: { id: string; name: string };
  productValue: number;
  totalTickets: number;
  soldTickets: number;
  paymentToOrganizerAt?: string | Date;
  paymentEvidenceUrl?: string;
}

export default function AdminPaymentsToOrganizersPage() {
  const [payments, setPayments] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getFinishedRaffles(500, 0) as RafflesListResponse;
      const { data } = result;
      const withPayment = data.filter(
        (r: any) => r.paymentToOrganizerAt != null
      ) as Raffle[];
      setPayments(withPayment);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los pagos');
      console.error('Error loading payments to organizers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (v: string | Date | undefined | null) => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estimatedAmount = (r: Raffle) => {
    const revenue = r.soldTickets * r.productValue;
    return revenue;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Cargando pagos a organizadores...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Pagos a Organizadores
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Listado de pagos realizados a organizadores por oportunidades finalizadas
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '24px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e8ecf1' }}>
          <FiDollarSign style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }} />
          <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>No hay pagos registrados</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0' }}>
            Los pagos a organizadores se registran al subir la evidencia en cada oportunidad finalizada.
          </p>
          <Link href="/dashboard/admin" style={{ display: 'inline-block', marginTop: '16px', color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
            Ir a Sorteos Finalizados →
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e8ecf1', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e8ecf1' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Oportunidad
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Organizador
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Fecha de pago
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Monto (est.)
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Evidencia
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #e8ecf1' }}>
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                      {r.product?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                      {r.shop?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px' }}>
                      {formatDate(r.paymentToOrganizerAt)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>
                      S/. {estimatedAmount(r).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {r.paymentEvidenceUrl ? (
                        <a
                          href={r.paymentEvidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <FiExternalLink size={14} />
                          Ver
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <Link
                        href={`/sorteos/${r.id}`}
                        style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}
                      >
                        Ver oportunidad
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
