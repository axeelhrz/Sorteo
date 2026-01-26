'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiBarChart2, FiTag, FiShoppingBag, FiUsers, FiLogOut } from 'react-icons/fi';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const TABS: TabItem[] = [
  { id: 'overview', label: 'Resumen', icon: <FiBarChart2 />, href: '/admin' },
  { id: 'raffles-pending', label: 'Sorteos Pendientes', icon: <FiTag />, href: '/admin/raffles/pending' },
  { id: 'raffles-active', label: 'Sorteos Activos', icon: <FiTag />, href: '/admin/raffles/active' },
  { id: 'raffles-finished', label: 'Sorteos Finalizados', icon: <FiTag />, href: '/admin/raffles/finished' },
  { id: 'shops', label: 'Organizadores', icon: <FiShoppingBag />, href: '/admin/shops' },
  { id: 'users', label: 'Usuarios', icon: <FiUsers />, href: '/admin/users' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/');
    }
  };

  const getActiveTab = () => {
    if (pathname === '/admin') return 'overview';
    if (pathname.includes('/raffles/pending')) return 'raffles-pending';
    if (pathname.includes('/raffles/active')) return 'raffles-active';
    if (pathname.includes('/raffles/finished')) return 'raffles-finished';
    if (pathname.includes('/shops')) return 'shops';
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/payments')) return 'payments';
    return 'overview';
  };

  const activeTab = getActiveTab();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e8ecf1',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Panel de Administración
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Gestión integral de la plataforma
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              {user?.name || 'Administrador'}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Acceso total
            </p>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 18px',
              border: 'none',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#e2e8f0';
              (e.currentTarget as HTMLElement).style.color = '#1e293b';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9';
              (e.currentTarget as HTMLElement).style.color = '#475569';
            }}
          >
            <FiLogOut style={{ fontSize: '16px' }} />
            Salir
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e8ecf1',
          padding: '0 32px',
          display: 'flex',
          gap: '0',
          overflowX: 'auto',
          position: 'sticky',
          top: '88px',
          zIndex: 99,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            style={{
              padding: '14px 18px',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#667eea' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              position: 'relative',
              marginBottom: '0',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.color = '#1e293b';
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.color = '#64748b';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center', opacity: activeTab === tab.id ? 1 : 0.6 }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page Content */}
      <div style={{ padding: '32px' }}>
        {children}
      </div>
    </div>
  );
}