'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { Raffle, RaffleStatus } from '@/types/raffle';
import styles from './RaffleCard.module.css';

interface RaffleCardProps {
  raffle: Raffle;
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;
  const remainingTickets = raffle.totalTickets - raffle.soldTickets;
  const ticketPrice = Number(raffle.productValue) / raffle.totalTickets;

  const getStatusBadge = () => {
    switch (raffle.status) {
      case RaffleStatus.ACTIVE:
        return <span className={`${styles.badge} ${styles.badgeActive}`}>Activo</span>;
      case RaffleStatus.SOLD_OUT:
        return <span className={`${styles.badge} ${styles.badgeSoldOut}`}>Agotado</span>;
      case RaffleStatus.FINISHED:
        return <span className={`${styles.badge} ${styles.badgeFinished}`}>Finalizado</span>;
      default:
        return null;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case 'facebook':
        return <FaFacebook />;
      case 'instagram':
        return <FaInstagram />;
      case 'twitter':
        return <FaTwitter />;
      case 'whatsapp':
        return <FaWhatsapp />;
      default:
        return null;
    }
  };

  return (
    <Link href={`/sorteos/${raffle.id}`}>
      <div className={styles.card}>
        {/* Image Container */}
        <div className={styles.imageContainer}>
          {raffle.product?.mainImage ? (
            <Image
              src={raffle.product.mainImage}
              alt={raffle.product.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>Sin imagen</span>
            </div>
          )}
          {getStatusBadge()}
        </div>

        {/* Content Container */}
        <div className={styles.content}>
          {/* Product Info */}
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>{raffle.product?.name || 'Producto'}</h3>
            <p className={styles.shopName}>{raffle.shop?.name || 'Tienda'}</p>
          </div>

          {/* Social Networks */}
          {raffle.shop && (raffle.shop as any).socialNetworks && Object.keys((raffle.shop as any).socialNetworks).length > 0 && (
            <div className={styles.socialNetworks}>
              {Object.entries((raffle.shop as any).socialNetworks).map(([platform, url]: [string, any]) => 
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    onClick={(e) => e.stopPropagation()}
                    title={platform}
                  >
                    {getSocialIcon(platform)}
                  </a>
                ) : null
              )}
            </div>
          )}

          {/* Value */}
          <div className={styles.value}>
            <span className={styles.valueLabel}>Valor de Ticket</span>
            <span className={styles.valueAmount}>S/ {ticketPrice.toFixed(2)}</span>
          </div>

          {/* Progress Section */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Tickets vendidos</span>
              <span className={styles.progressPercent}>{Math.round(progressPercentage)}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className={styles.progressFooter}>
              <span className={styles.progressCount}>
                {raffle.soldTickets} de {raffle.totalTickets}
              </span>
              <span className={styles.remainingTickets}>
                {remainingTickets > 0
                  ? `${remainingTickets} disponibles`
                  : 'Agotado'}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button className={styles.ctaButton}>
            {raffle.status === RaffleStatus.ACTIVE ? 'Ver oportunidad' : 'Ver detalles'}
          </button>
        </div>
      </div>
    </Link>
  );
}