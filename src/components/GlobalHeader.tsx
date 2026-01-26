'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { FiLogOut, FiUser, FiMenu, FiX, FiShoppingBag, FiHelpCircle, FiFileText } from 'react-icons/fi';
import Logo from '@/components/Logo';
import styles from './GlobalHeader.module.css';

export default function GlobalHeader() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Handle hydration
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoWrapper}>
            <Logo size="small" showText={false} imageSize={36} />
          </div>
          <span className={styles.logoText}>TIKETEA</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link href="/sorteos" className={styles.navLink} onClick={closeMenu}>
            <span className={styles.navLinkContent}>
              <FiShoppingBag className={styles.icon} />
              <span>Oportunidades</span>
            </span>
          </Link>

          <Link href="/faq" className={styles.navLink} onClick={closeMenu}>
            <span className={styles.navLinkContent}>
              <FiHelpCircle className={styles.icon} />
              <span>Preguntas</span>
            </span>
          </Link>

          <Link href="/legal/terms" className={styles.navLink} onClick={closeMenu}>
            <span className={styles.navLinkContent}>
              <FiFileText className={styles.icon} />
              <span>Legal</span>
            </span>
          </Link>

          {isHydrated && isAuthenticated && user && (
            <Link href="/dashboard" className={styles.navLink} onClick={closeMenu}>
              <span className={styles.navLinkContent}>
                <FiUser className={styles.icon} />
                <span>Mi Cuenta</span>
              </span>
            </Link>
          )}

          {/* Versión móvil - dentro del menú */}
          {isHydrated && isAuthenticated && user && (
            <button onClick={handleLogout} className={`${styles.logoutBtn} ${styles.logoutBtnMobile}`}>
              <span className={styles.navLinkContent}>
                <FiLogOut className={styles.icon} />
                <span>Salir</span>
              </span>
            </button>
          )}

          {isHydrated && !isAuthenticated && (
            <div className={`${styles.authButtons} ${styles.authButtonsMobile}`}>
              <Link href="/login" className={styles.loginButton} onClick={closeMenu}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className={styles.registerButton} onClick={closeMenu}>
                Registrarse
              </Link>
            </div>
          )}
        </nav>

        {/* Versión desktop - a la derecha */}
        <div className={styles.rightSection}>
          {isHydrated && isAuthenticated && user ? (
            <button onClick={handleLogout} className={`${styles.logoutBtn} ${styles.logoutBtnDesktop}`}>
              <span className={styles.navLinkContent}>
                <FiLogOut className={styles.icon} />
                <span>Salir</span>
              </span>
            </button>
          ) : isHydrated ? (
            <div className={`${styles.authButtons} ${styles.authButtonsDesktop}`}>
              <Link href="/login" className={styles.loginButton} onClick={closeMenu}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className={styles.registerButton} onClick={closeMenu}>
                Registrarse
              </Link>
            </div>
          ) : null}

          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && <div className={styles.overlay} onClick={closeMenu} />}
    </header>
  );
}