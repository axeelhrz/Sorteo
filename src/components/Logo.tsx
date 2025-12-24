'use client';

import Image from 'next/image';
import Link from 'next/link';
import logoImage from '@/assets/logo.png';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  href?: string;
  imageSize?: number;
}

export default function Logo({ size = 'medium', showText = true, className = '', href = '/', imageSize }: LogoProps) {
  const getImageSize = () => {
    if (imageSize) return imageSize;
    return size === 'small' ? 40 : size === 'medium' ? 60 : 80;
  };

  const imgSize = getImageSize();

  const logoContent = (
    <div className={`${styles.logo} ${styles[size]} ${className}`}>
      <Image
        src={logoImage}
        alt="TIKETEA ONLINE"
        width={imgSize}
        height={imgSize}
        className={styles.logoImage}
        priority
      />
      {showText && <span className={styles.logoText}>TIKETEA ONLINE</span>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.logoLink}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}