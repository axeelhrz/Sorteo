'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './shop-panel.module.css';

interface ShopSidebarProps {
  isBlocked?: boolean;
}

export function ShopSidebar({ isBlocked = false }: ShopSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        <Link
          href="/dashboard/store"
          className={`${styles.navLink} ${isActive('/dashboard/store') ? styles.active : ''}`}
        >
          📋 Mi organizador
        </Link>

        <Link
          href="/dashboard/store"
          className={`${styles.navLink} ${isActive('/dashboard/store') ? styles.active : ''}`}
        >
          🎲 Mis sorteos
        </Link>

        {!isBlocked && (
          <Link
            href="/dashboard/store"
            className={`${styles.navLink} ${isActive('/dashboard/store') ? styles.active : ''}`}
          >
            ➕ Crear sorteo
          </Link>
        )}
      </nav>
    </aside>
  );
}