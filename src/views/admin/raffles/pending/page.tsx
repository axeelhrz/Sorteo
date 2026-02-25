'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';

/** Costo por ticket por defecto según valor del producto: 0-50 → S/1, 50.01-100 → S/2, 100.1+ → S/5 */
function defaultCostPerTicket(productValue: number): number {
  if (productValue <= 50) return 1;
  if (productValue <= 100) return 2;
  return 5;
}

/** Número de tickets por defecto: floor((valor producto + costo delivery) * ratio / costo por ticket) */
function defaultNumberOfTickets(
  productValue: number,
  deliveryCost: number,
  ratio: number,
  costPerTicket: number
): number {
  const totalBase = productValue + (deliveryCost || 0);
  if (costPerTicket <= 0) return 0;
  return Math.floor((totalBase * ratio) / costPerTicket);
}

interface Raffle {
  id: string;
  status: string;
  productValue?: number;
  totalTickets?: number;
  soldTickets?: number;
  specialConditions?: string;
  thumbnail?: string;
  createdAt?: any;
  shop?: { id: string; name: string; publicEmail?: string; phone?: string };
  product?: {
    id: string;
    name: string;
    description?: string;
    value?: number;
    hasDelivery?: boolean;
    deliveryZones?: string;
    deliveryCost?: number;
    pickupAddress?: string;
    pickupDistrict?: string;
    mainImage?: string;
  };
}

export default function PendingRafflesPage() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Campos editables por admin al aprobar
  const [costPerTicket, setCostPerTicket] = useState(1);
  const [ratio, setRatio] = useState(2);
  const [numberOfTickets, setNumberOfTickets] = useState(0);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchRaffles();
  }, [page]);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const result = await adminService.getPendingRaffles(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
      setRaffles(result.data as Raffle[]);
      setTotal(result.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar sorteos pendientes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (raffle: Raffle) => {
    const productValue = Number(raffle.product?.value ?? raffle.productValue ?? 0);
    const deliveryCost = Number(raffle.product?.deliveryCost ?? 0);
    const defaultUnit = defaultCostPerTicket(productValue);
    const defaultTickets = defaultNumberOfTickets(productValue, deliveryCost, 2, defaultUnit);

    setSelectedRaffle(raffle);
    setCostPerTicket(defaultUnit);
    setRatio(2);
    setNumberOfTickets(defaultTickets);
    setShowApproveModal(true);
  };

  const openRejectModal = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Recalcular número de tickets cuando el admin cambia costo o ratio
  useEffect(() => {
    if (!selectedRaffle || !showApproveModal) return;
    const productValue = Number(selectedRaffle.product?.value ?? selectedRaffle.productValue ?? 0);
    const deliveryCost = Number(selectedRaffle.product?.deliveryCost ?? 0);
    const n = costPerTicket > 0 ? defaultNumberOfTickets(productValue, deliveryCost, ratio, costPerTicket) : 0;
    setNumberOfTickets(n);
  }, [costPerTicket, ratio, selectedRaffle, showApproveModal]);

  const handleApprove = async () => {
    if (!selectedRaffle) return;
    if (numberOfTickets < 1) {
      alert('El número de tickets debe ser al menos 1.');
      return;
    }
    try {
      setActionLoading(true);
      await adminService.approveRaffle(selectedRaffle.id, {
        costPerTicket,
        totalTickets: numberOfTickets,
      });
      setRaffles(raffles.filter((r) => r.id !== selectedRaffle.id));
      setTotal(total - 1);
      setShowApproveModal(false);
      setSelectedRaffle(null);
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
      setRaffles(raffles.filter((r) => r.id !== selectedRaffle.id));
      setTotal(total - 1);
      setShowRejectModal(false);
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

  const modalStyles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(6px)',
    },
    box: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: 0,
      maxWidth: '520px',
      width: '92%',
      maxHeight: '90vh',
      overflowY: 'auto' as const,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    input: {
      width: '100%',
      padding: '12px 14px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '15px',
      boxSizing: 'border-box' as const,
      marginTop: '6px',
      transition: 'border-color 0.2s',
    },
    label: { display: 'block', fontWeight: 600, color: '#64748b', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
    sectionTitle: { margin: 0, color: '#0f172a', fontSize: '15px', fontWeight: 700 },
    row: { marginBottom: '18px' },
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' }}>
          Aprobar Oportunidad
        </h2>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          Revisa las solicitudes de los organizadores. Puedes variar unidad de participación, ratio y número de tickets antes de aprobar.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e8ecf1', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e8ecf1' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ID oportunidad
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Producto
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Organizador
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {raffles.map((raffle) => (
                <tr
                  key={raffle.id}
                  style={{ borderBottom: '1px solid #e8ecf1' }}
                >
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '13px', fontFamily: 'monospace' }}>
                    {raffle.id}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                    {raffle.product?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                    {raffle.shop?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openApproveModal(raffle)}
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
                        }}
                      >
                        Aprobar / Variar
                      </button>
                      <button
                        onClick={() => openRejectModal(raffle)}
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
              fontSize: '13px',
              fontWeight: '600',
              color: page === 0 ? '#cbd5e1' : '#475569',
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
              fontSize: '13px',
              fontWeight: '600',
              color: page >= totalPages - 1 ? '#cbd5e1' : '#475569',
            }}
          >
            Siguiente <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Modal Aprobar / Variar */}
      {showApproveModal && selectedRaffle && (
        <div style={modalStyles.overlay} onClick={() => setShowApproveModal(false)}>
          <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700 }}>
                Aprobar oportunidad
              </h3>
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                ID: {selectedRaffle.id}
              </p>
            </div>

            {/* Imagen del producto */}
            {(selectedRaffle.product?.mainImage || selectedRaffle.thumbnail) && (
              <div style={{ padding: '16px 24px 0', marginBottom: '8px' }}>
                <p style={{ ...modalStyles.sectionTitle, marginBottom: '10px' }}>Imagen del producto</p>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', maxWidth: '320px', maxHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src={selectedRaffle.product?.mainImage || selectedRaffle.thumbnail!}
                    alt={selectedRaffle.product?.name || 'Producto'}
                    width={320}
                    height={240}
                    style={{ width: '100%', height: 'auto', maxHeight: '240px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            {/* Datos ingresados por el organizador */}
            <div style={{ padding: '20px 24px' }}>
              <p style={{ ...modalStyles.sectionTitle, marginBottom: '12px' }}>Datos del organizador</p>
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <div style={modalStyles.row}>
                  <span style={modalStyles.label}>Producto</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                    {selectedRaffle.product?.name || 'N/A'}
                  </p>
                </div>
                {selectedRaffle.product?.description && (
                  <div style={modalStyles.row}>
                    <span style={modalStyles.label}>Descripción</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569', lineHeight: 1.4 }}>
                      {selectedRaffle.product.description}
                    </p>
                  </div>
                )}
                <div style={modalStyles.row}>
                  <span style={modalStyles.label}>Valor producto (organizador)</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 600, color: '#059669' }}>
                    S/. {(Math.round(Number(selectedRaffle.product?.value ?? 0) * 100) / 100).toFixed(2)}
                  </p>
                </div>
                <div style={modalStyles.row}>
                  <span style={modalStyles.label}>Entrega</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569' }}>
                    {selectedRaffle.product?.hasDelivery
                      ? `Delivery — Zonas: ${selectedRaffle.product.deliveryZones || 'N/A'} · Costo: S/. ${Number(selectedRaffle.product.deliveryCost ?? 0).toFixed(2)}`
                      : `Recojo: ${selectedRaffle.product?.pickupAddress || 'N/A'}, ${selectedRaffle.product?.pickupDistrict || ''}`}
                  </p>
                </div>
                {selectedRaffle.specialConditions && (
                  <div style={modalStyles.row}>
                    <span style={modalStyles.label}>Condiciones especiales</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>{selectedRaffle.specialConditions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Definir aprobación: valores iniciales = organizador, editables por admin */}
            <div style={{ padding: '0 24px 24px' }}>
              <p style={{ ...modalStyles.sectionTitle, marginBottom: '14px' }}>Aprobación</p>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={modalStyles.label}>Unidad de participación (S/.) — valor por ticket</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={costPerTicket}
                    onChange={(e) => setCostPerTicket(parseFloat(e.target.value) || 0)}
                    style={modalStyles.input}
                  />
                  <small style={{ display: 'block', marginTop: '6px', color: '#94a3b8', fontSize: '12px' }}>
                    Lo que vale cada ticket. Por defecto según valor del producto: 0-50 → S/1, 50.01-100 → S/2, 100.1+ → S/5. Puedes modificarlo.
                  </small>
                </div>
                <div>
                  <label style={modalStyles.label}>Ratio</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={ratio}
                    onChange={(e) => setRatio(parseFloat(e.target.value) || 0)}
                    style={modalStyles.input}
                  />
                </div>
                <div>
                  <label style={modalStyles.label}>Número de tickets</label>
                  <input
                    type="number"
                    min="1"
                    value={numberOfTickets}
                    onChange={(e) => setNumberOfTickets(parseInt(e.target.value, 10) || 0)}
                    style={modalStyles.input}
                  />
                  <small style={{ display: 'block', marginTop: '6px', color: '#94a3b8', fontSize: '12px' }}>
                    (valor producto + delivery) × ratio / valor por ticket ≈ número de tickets
                  </small>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowApproveModal(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading || numberOfTickets < 1}
                style={{
                  padding: '12px 24px',
                  backgroundColor: numberOfTickets < 1 ? '#cbd5e1' : '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: actionLoading || numberOfTickets < 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow: numberOfTickets >= 1 ? '0 2px 8px rgba(5, 150, 105, 0.35)' : 'none',
                }}
              >
                {actionLoading ? 'Aprobando...' : 'Aprobar oportunidad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {showRejectModal && selectedRaffle && (
        <div style={modalStyles.overlay} onClick={() => setShowRejectModal(false)}>
          <div style={modalStyles.box} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '20px', fontWeight: '700' }}>
              Rechazar oportunidad
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
              Indica el motivo del rechazo. El organizador recibirá una notificación.
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
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
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
