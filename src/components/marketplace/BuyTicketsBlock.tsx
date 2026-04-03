'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { firebasePaymentService } from '@/services/firebase-payment-service';
import { formatUsdc, penToUsdc } from '@/lib/pen-usdc-display';
import styles from './BuyTicketsBlock.module.css';

interface BuyTicketsBlockProps {
  raffle: Raffle;
  onPaymentCreated?: (paymentId: string) => void;
}

export const BuyTicketsBlock: React.FC<BuyTicketsBlockProps> = ({
  raffle,
  onPaymentCreated,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  // Calcular tickets disponibles
  const availableTickets = raffle.totalTickets - raffle.soldTickets;
  const pricePerTicket = Number(raffle.productValue);
  const totalPrice = quantity * pricePerTicket;
  const unitUsdc = penToUsdc(pricePerTicket);
  const totalUsdc = penToUsdc(totalPrice);

  // Validaciones de cantidad
  const isQuantityValid = quantity > 0 && quantity <= availableTickets;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setQuantity(Math.max(1, Math.min(value, availableTickets)));
    }
  };

  const handleQuickAdd = (amount: number) => {
    const newQuantity = quantity + amount;
    setQuantity(Math.max(1, Math.min(newQuantity, availableTickets)));
  };

  const handleBuyTickets = async () => {
    if (!isQuantityValid) {
      setError('Cantidad de tickets inválida');
      return;
    }

    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // PASO 5: Crear pago pendiente
      const payment = await firebasePaymentService.createPayment({
        raffleId: raffle.id,
        amount: totalPrice,
        ticketQuantity: quantity,
      });

      // Notificar al componente padre
      if (onPaymentCreated) {
        onPaymentCreated(payment.id);
      }

      // PASO 6: Redirigir a checkout
      router.push(`/checkout?paymentId=${payment.id}`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Error al procesar la compra. Intenta de nuevo.';
      setError(errorMessage);
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className={styles.blockContainer}>
        <div className={styles.messageBox}>
          <p>Inicia sesión para comprar tickets</p>
          <button
            className={styles.loginButton}
            onClick={() => router.push('/login')}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  // Las cuentas de organizador no pueden participar en la compra de tickets (SHOP = ORGANIZER)
  const isOrganizer = user?.role === UserRole.ORGANIZER;
  if (isOrganizer) {
    return (
      <div className={styles.blockContainer}>
        <div className={styles.messageBox}>
          <p>Las cuentas de organizador no pueden comprar tickets. Solo los usuarios pueden participar en sorteos.</p>
        </div>
      </div>
    );
  }

  // Si la oportunidad no está activa
  if (raffle.status !== RaffleStatus.ACTIVE) {
    return (
      <div className={styles.blockContainer}>
        <div className={styles.messageBox}>
          <p>Esta oportunidad no está disponible para compra</p>
        </div>
      </div>
    );
  }

  // Si no hay tickets disponibles
  if (availableTickets <= 0) {
    return (
      <div className={styles.blockContainer}>
        <div className={styles.messageBox}>
          <p>¡Todos los tickets se han vendido!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.blockContainer}>
      <h2 className={styles.title}>Participa</h2>

      {/* Información de disponibilidad */}
      <div className={styles.infoSection}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Tickets disponibles:</span>
          <span className={styles.value}>{availableTickets}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Unidad de participación:</span>
          <span className={styles.valueStack}>
            {unitUsdc != null ? (
              <>
                <span className={styles.value}>{formatUsdc(unitUsdc)}</span>
                <span className={styles.valueRef}>S/. {pricePerTicket.toFixed(2)}</span>
              </>
            ) : (
              <span className={styles.value}>S/. {pricePerTicket.toFixed(2)}</span>
            )}
          </span>
        </div>
      </div>

      {/* Selector de cantidad */}
      <div className={styles.quantitySection}>
        <label htmlFor="quantity" className={styles.label}>
          Cantidad:
        </label>
        <div className={styles.quantityControls}>
          <input
            id="quantity"
            type="number"
            min="1"
            max={availableTickets}
            value={quantity}
            onChange={handleQuantityChange}
            className={styles.quantityInput}
            aria-label="Cantidad de tickets"
          />
          <div className={styles.quickButtons}>
            <button
              className={styles.quickButton}
              onClick={() => handleQuickAdd(1)}
              disabled={quantity >= availableTickets}
            >
              +1
            </button>
            <button
              className={styles.quickButton}
              onClick={() => handleQuickAdd(5)}
              disabled={quantity >= availableTickets}
            >
              +5
            </button>
            <button
              className={styles.quickButton}
              onClick={() => handleQuickAdd(10)}
              disabled={quantity >= availableTickets}
            >
              +10
            </button>
          </div>
        </div>
      </div>

      {/* Cálculo de subtotal */}
      <div className={styles.subtotalSection}>
        <div className={styles.subtotalRow}>
          <span>Subtotal ({quantity} tickets):</span>
          <span className={styles.subtotalValueStack}>
            {totalUsdc != null ? (
              <>
                <span className={styles.subtotalValue}>{formatUsdc(totalUsdc)}</span>
                <span className={styles.subtotalRef}>S/. {totalPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className={styles.subtotalValue}>S/. {totalPrice.toFixed(2)}</span>
            )}
          </span>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Botón de compra */}
      <button
        type="button"
        className={styles.buyButton}
        onClick={handleBuyTickets}
        disabled={!isQuantityValid || loading}
      >
        {loading ? 'Procesando...' : 'Continuar'}
      </button>

      {/* Validación visual */}
      {!isQuantityValid && (
        <p className={styles.validationMessage}>
          Selecciona una cantidad válida (1 - {availableTickets})
        </p>
      )}
    </div>
  );
};