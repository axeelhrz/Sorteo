'use client';

import React, { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';

interface Raffle {
  id: string;
  name?: string;
  status: string;
  createdAt?: any;
  ticketPrice?: number;
  totalTickets?: number;
  soldTickets?: number;
  shop?: { id: string; name: string };
  product?: { id: string; name: string };
}

export default function PendingRafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchRaffles();
  }, [page]);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const result = await adminService.getPendingRaffles(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
      setRaffles(result.data);
      setTotal(result.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar sorteos pendientes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (raffleId: string) => {
    try {
      setActionLoading(true);
      await adminService.approveRaffle(raffleId);
      setRaffles(raffles.filter(r => r.id !== raffleId));
      setTotal(total - 1);
    } catch (err: any) {
      alert('Error al aprobar: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRaffle) return;
    try {
      setActionLoading(true);
      await adminService.rejectRaffle(selectedRaffle.id, rejectReason);
      setRaffles(raffles.filter(r => r.id !== selectedRaffle.id));
      setTotal(total - 1);
      setShowModal(false);
      setRejectReason('');
      setSelectedRaffle(null);
    } catch (err: any) {
      alert('Error al rechazar: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && raffles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Cargando sorteos pendientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
        {error}
      </div>
    );
  }

  if (raffles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>No hay sorteos pendientes de aprobación</p>
      </div>
    );
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Sorteos Pendientes
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Total: {total} sorteos pendientes de aprobación
        </p>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e8ecf1', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e8ecf1' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Producto
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Organizador
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Precio Ticket
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tickets
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((raffle) => (
                <tr key={raffle.id} style={{ borderBottom: '1px solid #e8ecf1', transition: 'background-color 0.2s ease' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                    {raffle.product?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                    {raffle.shop?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                    S/. {raffle.ticketPrice?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                    {raffle.totalTickets || 0}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleApprove(raffle.id)}
                        disabled={actionLoading}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          opacity: actionLoading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!actionLoading) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#059669';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#10b981';
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRaffle(raffle);
                          setShowModal(true);
                        }}
                        disabled={actionLoading}
                        style={{
                          padding: '8px 14px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          opacity: actionLoading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!actionLoading) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#ef4444';
                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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

      {/* Reject Modal */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
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
              Rechazar Sorteo
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
              Por favor, proporciona una razón para rechazar este sorteo. El organizador recibirá una notificación.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Escribe la razón del rechazo..."
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
                onClick={() => setShowModal(false)}
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
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: !rejectReason.trim() || actionLoading ? '#cbd5e1' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !rejectReason.trim() || actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (rejectReason.trim() && !actionLoading) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#ef4444';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {actionLoading ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}