'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiBell, FiUser, FiSettings, FiLock, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAuthStore } from '@/store/auth-store';
import styles from './user-panel-header.module.css';

export default function UserPanelHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [notificationCount, ] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Aquí se podría cargar el conteo de notificaciones
    // Por ahora es un placeholder
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>Mi Panel</h1>
        </div>

        <div className={styles.rightSection}>
          {/* Notificaciones */}
          <button className={styles.notificationBtn}>
            <FiBell />
            {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
          </button>

          {/* Menú de usuario */}
          <div className={styles.userMenu}>
            <button
              className={styles.userButton}
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className={styles.userName}>{user?.name}</span>
              <FiChevronDown className={styles.chevron} />
            </button>

            {showMenu && (
              <div className={styles.dropdown}>
                <a href="/user-panel/profile" className={styles.dropdownItem}>
                  <FiUser className={styles.dropdownIcon} />
                  Mi Perfil
                </a>
                <a href="/user-panel/profile?tab=preferences" className={styles.dropdownItem}>
                  <FiSettings className={styles.dropdownIcon} />
                  Preferencias
                </a>
                <a href="/user-panel/profile?tab=security" className={styles.dropdownItem}>
                  <FiLock className={styles.dropdownIcon} />
                  Seguridad
                </a>
                <hr className={styles.divider} />
                <button
                  onClick={handleLogout}
                  className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                >
                  <FiLogOut className={styles.dropdownIcon} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}