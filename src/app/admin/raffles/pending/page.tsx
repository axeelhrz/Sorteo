'use client';

import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>
                  Producto
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>
                  Organizador
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>
                  Precio Ticket
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>
                  Tickets
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#64748b', fontSize: '13px' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((raffle) => (
                <tr key={raffle.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontSize: '14px' }}>
                    {raffle.product?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontSize: '14px' }}>
                    {raffle.shop?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontSize: '14px' }}>
                    S/. {raffle.ticketPrice?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#1e293b', fontSize: '14px' }}>
                    {raffle.totalTickets || 0}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleApprove(raffle.id)}
                        disabled={actionLoading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'background-color 0.2s ease',
                          opacity: actionLoading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!actionLoading) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#bbf7d0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#dcfce7';
                        }}
                      >
                        <FiCheckCircle style={{ fontSize: '14px' }} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRaffle(raffle);
                          setShowModal(true);
                        }}
                        disabled={actionLoading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'background-color 0.2s ease',
                          opacity: actionLoading ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!actionLoading) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#fecaca';
                          }
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2';
                        }}
                      >
                        <FiXCircle style={{ fontSize: '14px' }} />
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
              padding: '8px 12px',
              backgroundColor: page === 0 ? '#f1f5f9' : 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              opacity: page === 0 ? 0.5 : 1,
            }}
          >
            <FiChevronLeft /> Anterior
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '8px 12px',
              backgroundColor: page >= totalPages - 1 ? '#f1f5f9' : 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              opacity: page >= totalPages - 1 ? 0.5 : 1,
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
              Rechazar Sorteo
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
              ¿Estás seguro de que deseas rechazar este sorteo? Por favor, proporciona una razón.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Razón del rechazo..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                marginBottom: '16px',
                minHeight: '100px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !rejectReason.trim() || actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: !rejectReason.trim() || actionLoading ? 0.6 : 1,
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