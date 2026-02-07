'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Raffle, RaffleStatus } from '@/types/raffle';
import styles from './RaffleCard.module.css';

interface RaffleCardProps {
  raffle: Raffle;
}

const RaffleCard: React.FC<RaffleCardProps> = ({ raffle }) => {
  // Calcular tickets disponibles y porcentaje vendido
  const availableTickets = raffle.totalTickets - raffle.soldTickets;
  const soldPercentage = raffle.totalTickets > 0 ? (raffle.soldTickets / raffle.totalTickets) * 100 : 0;
  const imageSrc = raffle.thumbnail || raffle.product?.mainImage;

  // Determinar badge según estado
  const getBadgeClass = () => {
    switch (raffle.status) {
      case RaffleStatus.ACTIVE:
        return styles.badgeActive;
      case RaffleStatus.SOLD_OUT:
        return styles.badgeSoldOut;
      case RaffleStatus.FINISHED:
        return styles.badgeFinished;
      default:
        return styles.badgeActive;
    }
  };

  const getBadgeText = () => {
    switch (raffle.status) {
      case RaffleStatus.ACTIVE:
        return 'Activo';
      case RaffleStatus.SOLD_OUT:
        return 'Agotado';
      case RaffleStatus.FINISHED:
        return 'Finalizado';
      default:
        return 'Disponible';
    }
  };

  // Determinar si está disponible para compra
  const isAvailable = raffle.status === RaffleStatus.ACTIVE && availableTickets > 0;

  return (
    <Link href={`/sorteos/${raffle.id}`}>
      <div className={styles.card}>
        {/* Image Container */}
        <div className={styles.imageContainer}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={raffle.product?.name || 'Producto'}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              Sin imagen disponible
            </div>
          )}

          {/* Badge */}
          <div className={`${styles.badge} ${getBadgeClass()}`}>
            {getBadgeText()}
          </div>

          {/* Thumbnail Badge - Show if special conditions exist */}
          {raffle.specialConditions && (
            <div className={styles.thumbnailBadge}>
              Condiciones especiales
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Product Info */}
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>
              {raffle.product?.name || 'Producto sin nombre'}
            </h3>

            {/* Shop Section */}
            <div className={styles.shopSection}>
              <p className={styles.shopName}>
                Por: {raffle.shop?.name || 'Organizador'}
              </p>
            </div>
          </div>

          {/* Value */}
          <div className={styles.value}>
            <span className={styles.valueLabel}>Unidad de participación</span>
            <div className={styles.valueAmount}>
              S/. {raffle.productValue.toFixed(2)}
            </div>
            <span className={styles.ticketInfo}>
              Tickets desde S/. {raffle.productValue.toFixed(2)}
            </span>
          </div>

          {/* Progress Section */}
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Tickets participando</span>
              <span className={styles.progressCount}>
                {raffle.soldTickets} / {raffle.totalTickets}
              </span>
            </div>

            <div className={styles.progressRow}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                />
              </div>
              <span className={styles.progressPercent}>
                {Math.round(soldPercentage)}%
              </span>
            </div>

            <div className={styles.progressFooter}>
              <span className={styles.remainingTickets}>
                Tickets disponibles: {availableTickets}
              </span>
            </div>
          </div>

          {/* CTA Button - span para que Link funcione siempre */}
          <span
            className={styles.ctaButton}
            style={{
              opacity: isAvailable ? 1 : 0.7,
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            {isAvailable ? 'Ver detalles' : 'Ver detalles'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RaffleCard;