'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { SocialMediaLinks } from '@/components/SocialMediaLinks';
import styles from './RaffleCard.module.css';

interface RaffleCardProps {
  raffle: Raffle;
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const router = useRouter();
  const progressPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;
  const remainingTickets = raffle.totalTickets - raffle.soldTickets;
  const ticketPrice = Number(raffle.productValue) / raffle.totalTickets;

  const getStatusBadge = () => {
    switch (raffle.status) {
      case RaffleStatus.ACTIVE:
        return (
          <span className={`${styles.badge} ${styles.badgeActive}`}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}></span>
              Activo
            </span>
          </span>
        );
      case RaffleStatus.SOLD_OUT:
        return <span className={`${styles.badge} ${styles.badgeSoldOut}`}>Agotado</span>;
      case RaffleStatus.FINISHED:
        return <span className={`${styles.badge} ${styles.badgeFinished}`}>Finalizado</span>;
      default:
        return null;
    }
  };

  const handleCardClick = () => {
    router.push(`/sorteos/${raffle.id}`);
  };

  // Determinar qué imagen mostrar (miniatura del sorteo o imagen del producto)
  const displayImage = raffle.thumbnail || raffle.product?.mainImage;

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Image Container */}
      <div className={styles.imageContainer}>
        {displayImage ? (
          <Image
            src={displayImage}
            alt={raffle.product?.name || 'Sorteo'}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>Sin imagen</span>
          </div>
        )}
        {getStatusBadge()}
        
        {/* Thumbnail Badge */}
        {raffle.thumbnail && (
          <div className={styles.thumbnailBadge}>
            <span>Imagen destacada</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className={styles.content}>
        {/* Product Info */}
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{raffle.product?.name || 'Producto'}</h3>
          <div className={styles.shopInfo}>
            <p className={styles.shopName}>{raffle.shop?.name || 'Organizador'}</p>
            
            {/* Social Media Links */}
            {raffle.shop?.socialMedia && (
              <div className={styles.socialMediaContainer} onClick={(e) => e.stopPropagation()}>
                <SocialMediaLinks 
                  socialMedia={raffle.shop.socialMedia} 
                  size="small"
                  variant="colored"
                />
              </div>
            )}
          </div>
        </div>

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
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {raffle.status === RaffleStatus.ACTIVE ? 'Ver oportunidad' : 'Ver detalles'}
            <FiArrowRight size={16} style={{ transition: 'transform 0.2s ease' }} />
          </span>
        </button>
      </div>
    </div>
  );
}