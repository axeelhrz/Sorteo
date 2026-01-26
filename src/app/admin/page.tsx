'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiShoppingBag, FiClock, FiPlay, FiTag, FiCreditCard, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { adminService } from '@/services/admin-service';

interface DashboardStats {
  users: { total: number };
  shops: { total: number; pending: number; verified: number; blocked: number };
  raffles: {
    pending: number;
    active: number;
    finished: number;
    cancelled: number;
    rejected: number;
  };
  tickets: { totalSold: number };
  payments: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    totalRevenue: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Cargando estadísticas...</p>
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

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '32px', fontWeight: '700' }}>
          Panel de Administración
        </h1>
        <p style={{ margin: '0', color: '#64748b', fontSize: '16px' }}>
          Bienvenido. Aquí puedes gestionar toda la plataforma
        </p>
      </div>

      {/* Acciones Rápidas - Tareas Pendientes */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>
          ⚡ Acciones Rápidas
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Sorteos Pendientes */}
          {stats && stats.raffles && stats.raffles.pending > 0 && (
            <div
              onClick={() => navigateTo('/admin/raffles/pending')}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                border: '2px solid #FFA500',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 16px rgba(255, 165, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <FiClock style={{ fontSize: '24px', color: '#FFA500' }} />
                <span style={{ backgroundColor: '#FFA500', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                  {stats.raffles.pending}
                </span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                Sorteos Pendientes
              </h3>
              <p style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>
                Requieren aprobación
              </p>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', color: '#FFA500', fontSize: '13px', fontWeight: '600' }}>
                Revisar <FiArrowRight style={{ marginLeft: '4px' }} />
              </div>
            </div>
          )}

          {/* Pagos Pendientes */}
          {stats && stats.payments && stats.payments.pending > 0 && (
            <div
              onClick={() => navigateTo('/admin/payments')}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                border: '2px solid #2196F3',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 16px rgba(33, 150, 243, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <FiCreditCard style={{ fontSize: '24px', color: '#2196F3' }} />
                <span style={{ backgroundColor: '#2196F3', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                  {stats.payments.pending}
                </span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                Pagos Pendientes
              </h3>
              <p style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>
                Esperando validación
              </p>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', color: '#2196F3', fontSize: '13px', fontWeight: '600' }}>
                Validar <FiArrowRight style={{ marginLeft: '4px' }} />
              </div>
            </div>
          )}

          {/* Organizadores Pendientes */}
          {stats && stats.shops && stats.shops.pending > 0 && (
            <div
              onClick={() => navigateTo('/admin/shops')}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                border: '2px solid #9C27B0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 16px rgba(156, 39, 176, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <FiShoppingBag style={{ fontSize: '24px', color: '#9C27B0' }} />
                <span style={{ backgroundColor: '#9C27B0', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                  {stats.shops.pending}
                </span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                Organizadores Pendientes
              </h3>
              <p style={{ margin: '0', color: '#64748b', fontSize: '13px' }}>
                Requieren verificación
              </p>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', color: '#9C27B0', fontSize: '13px', fontWeight: '600' }}>
                Verificar <FiArrowRight style={{ marginLeft: '4px' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>
          📊 Estadísticas Generales
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Usuarios */}
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FiUsers style={{ fontSize: '24px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Usuarios</h3>
            </div>
            <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
              {stats?.users.total || 0}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Registrados</p>
          </div>

          {/* Organizadores */}
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FiShoppingBag style={{ fontSize: '24px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Organizadores</h3>
            </div>
            <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
              {stats?.shops.total || 0}
            </p>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              <div>✓ Verificados: {stats?.shops.verified || 0}</div>
              <div>⏳ Pendientes: {stats?.shops.pending || 0}</div>
            </div>
          </div>

          {/* Sorteos */}
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FiTag style={{ fontSize: '24px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Sorteos</h3>
            </div>
            <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
              {(stats?.raffles.pending || 0) + (stats?.raffles.active || 0) + (stats?.raffles.finished || 0)}
            </p>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              <div>▶ Activos: {stats?.raffles.active || 0}</div>
              <div>✓ Finalizados: {stats?.raffles.finished || 0}</div>
            </div>
          </div>

          {/* Tickets */}
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FiTag style={{ fontSize: '24px', color: '#27ae60' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Tickets</h3>
            </div>
            <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>
              {stats?.tickets.totalSold || 0}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Vendidos</p>
          </div>

          {/* Pagos */}
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FiCreditCard style={{ fontSize: '24px', color: '#667eea' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Pagos</h3>
            </div>
            <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
              {stats?.payments.total || 0}
            </p>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              <div>✓ Completados: {stats?.payments.completed || 0}</div>
              <div>⏳ Pendientes: {stats?.payments.pending || 0}</div>
            </div>
          </div>

          {/* Ingresos */}
          <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FiDollarSign style={{ fontSize: '24px', color: '#27ae60' }} />
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Ingresos</h3>
            </div>
            <p style={{ margin: '0', fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>
              S/. {(stats?.payments.totalRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Total acumulado</p>
          </div>
        </div>
      </div>

      {/* Gestión Rápida */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>
          🔧 Gestión Rápida
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            onClick={() => navigateTo('/admin/raffles/pending')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
              (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiTag style={{ color: '#667eea' }} />
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Sorteos Pendientes</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Aprobar o rechazar</p>
          </button>

          <button
            onClick={() => navigateTo('/admin/raffles/active')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
              (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiPlay style={{ color: '#27ae60' }} />
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Sorteos Activos</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Ejecutar o cancelar</p>
          </button>

          <button
            onClick={() => navigateTo('/admin/payments')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
              (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiCreditCard style={{ color: '#2196F3' }} />
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Validar Pagos</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Revisar comprobantes</p>
          </button>

          <button
            onClick={() => navigateTo('/admin/shops')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
              (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiShoppingBag style={{ color: '#9C27B0' }} />
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Organizadores</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Verificar y gestionar</p>
          </button>

          <button
            onClick={() => navigateTo('/admin/users')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
              (e.currentTarget as HTMLElement).style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FiUsers style={{ color: '#667eea' }} />
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Usuarios</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Ver y filtrar</p>
          </button>
        </div>
      </div>
    </div>
  );
}