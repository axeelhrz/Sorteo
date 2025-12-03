'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/panel/panel.module.css';

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
          href="/panel/tienda"
          className={`${styles.navLink} ${isActive('/panel/tienda') ? styles.active : ''}`}
        >
          📋 Mi tienda
        </Link>

        <Link
          href="/panel/productos"
          className={`${styles.navLink} ${isActive('/panel/productos') ? styles.active : ''}`}
        >
          📦 Mis productos
        </Link>

        <Link
          href="/panel/sorteos"
          className={`${styles.navLink} ${isActive('/panel/sorteos') ? styles.active : ''}`}
        >
          🎲 Mis sorteos
        </Link>

        {!isBlocked && (
          <Link
            href="/panel/sorteos/crear"
            className={`${styles.navLink} ${isActive('/panel/sorteos/crear') ? styles.active : ''}`}
          >
            ➕ Crear sorteo
          </Link>
        )}
      </nav>
    </aside>
  );
}