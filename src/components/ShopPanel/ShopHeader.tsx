'use client';

import { Shop } from '@/types/shop';
import styles from '@/app/panel/panel.module.css';

interface ShopHeaderProps {
  shop: Shop;
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  return (
    <div className={styles.shopHeader}>
      <div className={styles.shopHeaderContent}>
        {shop.logo && (
          <img src={shop.logo} alt={shop.name} className={styles.shopLogo} />
        )}
        <div className={styles.shopHeaderInfo}>
          <h1 className={styles.shopName}>{shop.name}</h1>
          <p className={styles.shopDescription}>{shop.description}</p>
        </div>
      </div>
    </div>
  );
}