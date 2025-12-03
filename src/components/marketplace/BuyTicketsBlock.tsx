'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/payment-service';
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
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular tickets disponibles
  const availableTickets = raffle.totalTickets - raffle.soldTickets;
  const pricePerTicket = Number(raffle.productValue);
  const totalPrice = quantity * pricePerTicket;

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

    setLoading(true);
    setError(null);

    try {
      // PASO 5: Crear pago pendiente
      const payment = await paymentService.createPayment({
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

  // Si el sorteo no está activo
  if (raffle.status !== RaffleStatus.ACTIVE) {
    return (
      <div className={styles.blockContainer}>
        <div className={styles.messageBox}>
          <p>Este sorteo no está disponible para compra</p>
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
      <h2 className={styles.title}>Compra tus tickets</h2>

      {/* Información de disponibilidad */}
      <div className={styles.infoSection}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Tickets disponibles:</span>
          <span className={styles.value}>{availableTickets}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Precio por ticket:</span>
          <span className={styles.value}>S/. {pricePerTicket.toFixed(2)}</span>
        </div>
      </div>

      {/* Selector de cantidad */}
      <div className={styles.quantitySection}>
        <label htmlFor="quantity" className={styles.label}>
          Cantidad de tickets:
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
          <span className={styles.subtotalValue}>
            S/. {totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Botón de compra */}
      <button
        className={styles.buyButton}
        onClick={handleBuyTickets}
        disabled={!isQuantityValid || loading}
      >
        {loading ? 'Procesando...' : 'Continuar con la compra'}
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