'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/admin-service';
import styles from '../admin.module.css';

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
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(
        limit,
        page * limit,
        roleFilter || undefined,
      );
      setUsers(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return styles.danger;
      case 'shop':
        return styles.warning;
      default:
        return '';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'shop':
        return 'Tienda';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Gestión de Usuarios</h2>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className={styles.tableHeader} style={{ marginBottom: '20px' }}>
        <div className={styles.filterContainer}>
          <select
            className={styles.filterSelect}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="shop">Tienda</option>
            <option value="user">Usuario</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ color: '#7f8c8d' }}>No hay usuarios</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => {
                          setSelectedUser(user);
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
      {showDetail && selectedUser && (
        <div className={`${styles.modal} ${showDetail ? styles.open : ''}`}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Detalles del Usuario</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nombre</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedUser.name}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>{selectedUser.email}</p>
              </div>

              <div className={styles.formGroup}>
                <label>Rol</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  <span className={`${styles.statusBadge} ${getRoleBadgeColor(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Fecha de Registro</label>
                <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>

              <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Información Adicional</h4>
                <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '14px' }}>
                  ID: {selectedUser.id}
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