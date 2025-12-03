'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiTag, 
  FiAward, 
  FiFileText, 
  FiBell, 
  FiMessageCircle, 
  FiUser 
} from 'react-icons/fi';
import styles from './user-panel-sidebar.module.css';

interface UserPanelSidebarProps {
  activeSection?: string;
}

export default function UserPanelSidebar({  }: UserPanelSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const menuItems = [
    {
      label: 'Inicio',
      icon: FiHome,
      href: '/user-panel',
      id: 'dashboard',
    },
    {
      label: 'Mis Participaciones',
      icon: FiTag,
      href: '/user-panel/participations',
      id: 'participations',
    },
    {
      label: 'Sorteos Ganados',
      icon: FiAward,
      href: '/user-panel/won-raffles',
      id: 'won-raffles',
    },
    {
      label: 'Historial de Compras',
      icon: FiFileText,
      href: '/user-panel/purchase-history',
      id: 'purchase-history',
    },
    {
      label: 'Notificaciones',
      icon: FiBell,
      href: '/user-panel/notifications',
      id: 'notifications',
    },
    {
      label: 'Centro de Soporte',
      icon: FiMessageCircle,
      href: '/user-panel/support',
      id: 'support',
    },
    {
      label: 'Mi Perfil',
      icon: FiUser,
      href: '/user-panel/profile',
      id: 'profile',
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.title}>Mi Panel</h2>
      </div>

      <nav className={styles.menu}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.menuItem} ${
                isActive(item.id) ? styles.active : ''
              }`}
            >
              <IconComponent className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <p className={styles.footerText}>
          ¿Necesitas ayuda? Contacta con nuestro equipo de soporte.
        </p>
      </div>
    </aside>
  );
}