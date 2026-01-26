'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiBarChart2, FiTag, FiShoppingBag, FiUsers, FiCreditCard, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Resumen', icon: <FiBarChart2 />, href: '/admin' },
  { id: 'raffles', label: 'Sorteos Pendientes', icon: <FiTag />, href: '/admin/raffles/pending' },
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
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/');
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '280px' : '0',
          backgroundColor: '#1e293b',
          color: 'white',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          left: 0,
          top: 0,
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Admin Panel</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Gestión de plataforma</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: 'none',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
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
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <FiLogOut style={{ fontSize: '16px' }} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Bar */}
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
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '24px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

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
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}