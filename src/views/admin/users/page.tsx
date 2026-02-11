'use client';

import React, { useEffect, useState } from 'react';
import { FiEye, FiUsers } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';
import styles from '@/views/admin/admin.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = (await adminService.getAllUsers(
        limit,
        page * limit,
        { role: 'user' },
      )) as { data: User[]; total: number };
      setUsers(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return styles.userRoleAdmin;
    if (r === 'organizer' || r === 'shop') return styles.userRoleOrganizer;
    return styles.userRoleUser;
  };

  const getRoleLabel = (role: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 'Administrador';
    if (r === 'organizer' || r === 'shop') return 'Organizador';
    if (r === 'user') return 'Usuario';
    return role || 'Usuario';
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.tableContainer} style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div className={styles.userSpinner} />
        <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', fontWeight: 700 }}>
          Gestión de Usuarios
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Solo usuarios con rol Usuario (participantes que pueden comprar tickets).
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className={styles.tableContainer} style={{ padding: '56px 24px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
          <FiUsers style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: 18, fontWeight: 600 }}>No hay usuarios</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>No se encontraron usuarios con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className={styles.tableContainer} style={{ borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de registro</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className={styles.userName}>{user.name}</span>
                    </td>
                    <td>
                      <span className={styles.userEmail}>{user.email}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getRoleBadgeClass(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>
                      {new Date(user.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionButtons} style={{ justifyContent: 'flex-end' }}>
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetail(true);
                          }}
                          title="Ver detalles"
                        >
                          <FiEye size={14} />
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination} style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
            <button
              className={styles.paginationBtn}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              ← Anterior
            </button>
            <span style={{ padding: '8px 16px', fontSize: 14, color: '#64748b' }}>
              Página {page + 1} de {Math.max(1, Math.ceil(total / limit))}
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
      {showDetail && selectedUser && (
        <div className={`${styles.modal} ${styles.open}`}>
          <div className={styles.modalContent} style={{ borderRadius: 16, maxWidth: 440 }}>
            <div className={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Detalles del usuario</h2>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Nombre</label>
                <p style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: 16, fontWeight: 600 }}>{selectedUser.name}</p>
              </div>
              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
                <p style={{ margin: '6px 0 0 0', color: '#334155', fontSize: 14 }}>{selectedUser.email}</p>
              </div>
              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Rol</label>
                <p style={{ margin: '8px 0 0 0' }}>
                  <span className={`${styles.statusBadge} ${getRoleBadgeClass(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </p>
              </div>
              <div className={styles.formGroup}>
                <label style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Fecha de registro</label>
                <p style={{ margin: '6px 0 0 0', color: '#334155', fontSize: 14 }}>
                  {new Date(selectedUser.createdAt).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginTop: 20, border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>ID</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{selectedUser.id}</p>
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
