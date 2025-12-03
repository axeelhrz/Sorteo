'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin-service';
import styles from '../admin.module.css';

interface AuditLog {
  id: string;
  admin: { id: string; name: string; email: string };
  action: string;
  entityType: string;
  entityId: string;
  previousStatus: string;
  newStatus: string;
  reason: string;
  createdAt: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const limit = 15;

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityTypeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs(limit, page * limit, {
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
      });
      setLogs(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar logs de auditoría');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      raffle_approved: 'Sorteo Aprobado',
      raffle_rejected: 'Sorteo Rechazado',
      raffle_cancelled: 'Sorteo Cancelado',
      shop_status_changed: 'Estado de Tienda Cambiado',
      shop_verified: 'Tienda Verificada',
      shop_blocked: 'Tienda Bloqueada',
      user_suspended: 'Usuario Suspendido',
    };
    return labels[action] || action;
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('approved') || action.includes('verified')) return styles.success;
    if (action.includes('rejected') || action.includes('blocked') || action.includes('cancelled')) return styles.danger;
    if (action.includes('changed')) return styles.warning;
    return '';
  };

  if (loading && logs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando logs de auditoría...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Registro de Auditoría</h2>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className={styles.tableHeader} style={{ marginBottom: '20px' }}>
        <div className={styles.filterContainer}>
          <select
            className={styles.filterSelect}
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todas las acciones</option>
            <option value="raffle_approved">Sorteo Aprobado</option>
            <option value="raffle_rejected">Sorteo Rechazado</option>
            <option value="raffle_cancelled">Sorteo Cancelado</option>
            <option value="shop_verified">Tienda Verificada</option>
            <option value="shop_blocked">Tienda Bloqueada</option>
          </select>

          <select
            className={styles.filterSelect}
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todas las entidades</option>
            <option value="raffle">Sorteo</option>
            <option value="shop">Tienda</option>
            <option value="user">Usuario</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#7f8c8d' }}>No hay registros de auditoría</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Administrador</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Cambio de Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div>
                      <p style={{ margin: '0', fontWeight: '600', color: '#2c3e50' }}>{log.admin.name}</p>
                      <small style={{ color: '#7f8c8d' }}>{log.admin.email}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getActionBadgeColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td>
                    <div>
                      <p style={{ margin: '0', color: '#2c3e50' }}>{log.entityType}</p>
                      <small style={{ color: '#7f8c8d' }}>{log.entityId.substring(0, 8)}...</small>
                    </div>
                  </td>
                  <td>
                    {log.previousStatus && log.newStatus ? (
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#e74c3c' }}>{log.previousStatus}</span>
                        <span style={{ margin: '0 5px', color: '#7f8c8d' }}>→</span>
                        <span style={{ color: '#27ae60' }}>{log.newStatus}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#7f8c8d' }}>N/A</span>
                    )}
                  </td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => {
                          setSelectedLog(log);
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
      {showDetail && selectedLog && (
        <div className={`${styles.modal} ${showDetail ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalles del Registro de Auditoría</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Administrador</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {selectedLog.admin.name} ({selectedLog.admin.email})
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Acción</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  <span className={`${styles.statusBadge} ${getActionBadgeColor(selectedLog.action)}`}>
                    {getActionLabel(selectedLog.action)}
                  </span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Tipo de Entidad</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedLog.entityType}</p>
              </div>

              <div className={styles.formGroup}>
                <label>ID de Entidad</label>
                <p style={{ margin: '5px 0', color: '#2c3e50', wordBreak: 'break-all' }}>{selectedLog.entityId}</p>
              </div>

              {selectedLog.previousStatus && (
                <div className={styles.formGroup}>
                  <label>Estado Anterior</label>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedLog.previousStatus}</p>
                </div>
              )}

              {selectedLog.newStatus && (
                <div className={styles.formGroup}>
                  <label>Nuevo Estado</label>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedLog.newStatus}</p>
                </div>
              )}

              {selectedLog.reason && (
                <div className={styles.formGroup}>
                  <label>Motivo</label>
                  <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedLog.reason}</p>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Fecha y Hora</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
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