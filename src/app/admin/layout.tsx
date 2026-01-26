'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiBarChart2, FiTag, FiShoppingBag, FiUsers, FiCreditCard, FiLogOut } from 'react-icons/fi';

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
  { id: 'payments', label: 'Pagos', icon: <FiCreditCard />, href: '/admin/payments' },
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          Panel de Administración
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              {user?.name}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Administrador
            </p>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              border: 'none',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2';
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
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          position: 'sticky',
          top: '72px',
          zIndex: 99,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#667eea' : '#64748b',
              borderBottom: activeTab === tab.id ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '500',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.color = '#1e293b';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.color = '#64748b';
              }
            }}
          >
            <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page Content */}
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}