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
  const soldPercentage = (raffle.soldTickets / raffle.totalTickets) * 100;

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
          {raffle.thumbnail ? (
            <Image
              src={raffle.thumbnail}
              alt={raffle.product?.name || 'Raffle'}
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
            {raffle.shop && (
              <div className={styles.shopSection}>
                <p className={styles.shopName}>
                  Por: {raffle.shop.name}
                </p>
              </div>
            )}
          </div>

          {/* Value */}
          <div className={styles.value}>
            <span className={styles.valueLabel}>Valor del premio</span>
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
              <span className={styles.progressLabel}>Venta de tickets</span>
              <span className={styles.progressCount}>
                {raffle.soldTickets} / {raffle.totalTickets}
              </span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(soldPercentage, 100)}%` }}
              />
            </div>

            <div className={styles.progressFooter}>
              <span className={styles.remainingTickets}>
                {availableTickets} disponibles
              </span>
              <span className={styles.progressPercent}>
                {Math.round(soldPercentage)}%
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            className={styles.ctaButton}
            onClick={(e) => {
              e.preventDefault();
              // Navigation is handled by Link wrapper
            }}
            disabled={!isAvailable}
            style={{
              opacity: isAvailable ? 1 : 0.6,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
            }}
          >
            {isAvailable ? 'Ver detalles' : 'No disponible'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default RaffleCard;