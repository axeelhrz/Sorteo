'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiHome, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import Logo from '@/components/Logo';
import styles from './GlobalHeader.module.css';

export default function GlobalHeader() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Logo size="small" showText={false} />
          <span className={styles.logoText}>TIKETEA</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link href="/" className={styles.navLink}>
            <FiHome className={styles.icon} />
            Inicio
          </Link>

          {isAuthenticated && user && (
            <>
              <Link href="/dashboard" className={styles.navLink}>
                <FiUser className={styles.icon} />
                Mi Cuenta
              </Link>

              <button onClick={handleLogout} className={styles.logoutBtn}>
                <FiLogOut className={styles.icon} />
                Cerrar Sesión
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link href="/login" className={styles.navLink}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className={styles.navLink}>
                Registrarse
              </Link>
            </>
          )}
        </nav>

        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}