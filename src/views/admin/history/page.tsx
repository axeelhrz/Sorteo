'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiList, FiExternalLink, FiFilter } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import Link from 'next/link';
import styles from '@/views/admin/admin.module.css';

interface HistoryItem {
  id: string;
  type: 'compra' | 'pago_organizador';
  date: string;
  amount: number;
  status?: string;
  userName?: string;
  userEmail?: string;
  shopName?: string;
  opportunityName?: string;
  raffleId?: string;
  ticketQuantity?: number;
  paymentEvidenceUrl?: string;
}

export default function AdminHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [shops, setShops] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<'compra' | 'pago_organizador' | ''>('');
  const [shopId, setShopId] = useState('');
  const [userId, setUserId] = useState('');
  const [oportunidad, setOportunidad] = useState('');

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: { tipo?: 'compra' | 'pago_organizador'; shopId?: string; userId?: string; oportunidad?: string } = {};
      if (tipo) filters.tipo = tipo;
      if (shopId) filters.shopId = shopId;
      if (userId) filters.userId = userId;
      if (oportunidad.trim()) filters.oportunidad = oportunidad.trim();
      const res = await adminService.getPaymentHistory(filters);
      setItems(res.items as HistoryItem[]);
      setShops(res.shops);
      setUsers(res.users);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el historial');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  }, [tipo, shopId, userId, oportunidad]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatDate = (v: string | undefined | null) => {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return '—';
    const s = status.toLowerCase();
    if (s === 'completed') return 'Completado';
    if (s === 'pending' || s === 'pending_validation') return 'Pendiente';
    if (s === 'failed') return 'Fallido';
    if (s === 'refunded') return 'Reembolsado';
    return status;
  };

  const clearFilters = () => {
    setTipo('');
    setShopId('');
    setUserId('');
    setOportunidad('');
  };

  const hasActiveFilters = tipo || shopId || userId || oportunidad.trim();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Historial de Compras y Pagos
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Lista unificada de compras de tickets y pagos a organizadores
        </p>
      </div>

      <div className={styles.filterContainer} style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <FiFilter size={18} color="#64748b" />
          <select
            className={styles.filterSelect}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'compra' | 'pago_organizador' | '')}
            style={{ minWidth: '160px' }}
          >
            <option value="">Tipo: Todos</option>
            <option value="compra">Compra (tickets)</option>
            <option value="pago_organizador">Pago a organizador</option>
          </select>
          <select
            className={styles.filterSelect}
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            style={{ minWidth: '180px' }}
            title="Organizador"
          >
            <option value="">Organizador: Todos</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ minWidth: '180px' }}
            title="Usuario"
          >
            <option value="">Usuario: Todos</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <input
            type="text"
            className={styles.filterInput}
            placeholder="Buscar por oportunidad..."
            value={oportunidad}
            onChange={(e) => setOportunidad(e.target.value)}
            style={{ minWidth: '200px' }}
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                color: '#64748b',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '24px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Cargando historial...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e8ecf1' }}>
          <FiList style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }} />
          <h3 style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>No hay registros</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0' }}>
            {hasActiveFilters ? 'No se encontraron resultados con los filtros aplicados.' : 'Aún no hay compras ni pagos registrados.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              style={{ marginTop: '16px', padding: '10px 20px', color: '#667eea', fontWeight: 600, border: 'none', background: 'transparent', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer} style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e8ecf1' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tipo
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Fecha
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Oportunidad
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Usuario / Organizador
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Monto
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Estado / Evidencia
                  </th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e8ecf1' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: item.type === 'compra' ? '#dbeafe' : '#dcfce7',
                        color: item.type === 'compra' ? '#1d4ed8' : '#166534',
                      }}>
                        {item.type === 'compra' ? 'Compra' : 'Pago org.'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px' }}>
                      {formatDate(item.date)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                      {item.opportunityName || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px' }}>
                      {item.type === 'compra' ? (
                        <span title={item.userEmail}>{item.userName || '—'}</span>
                      ) : (
                        <span>{item.shopName || '—'}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>
                      S/. {item.amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {item.type === 'compra' ? (
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{getStatusLabel(item.status)}</span>
                      ) : item.paymentEvidenceUrl ? (
                        <a
                          href={item.paymentEvidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                        >
                          <FiExternalLink size={14} />
                          Ver evidencia
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {item.raffleId && (
                        <Link
                          href={`/sorteos/${item.raffleId}`}
                          style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}
                        >
                          Ver oportunidad
                        </Link>
                      )}
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
