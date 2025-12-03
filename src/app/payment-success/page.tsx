'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentService } from '@/services/payment-service';
import { raffleService } from '@/services/raffle-service';
import { Payment } from '@/types/payment';
import { Raffle } from '@/types/raffle';
import styles from './payment-success.module.css';

export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('paymentId');

  const [payment, setPayment] = useState<Payment | null>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError('ID de pago no encontrado');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Obtener datos del pago
        const paymentData = await paymentService.getPaymentById(paymentId);
        setPayment(paymentData);

        // Obtener datos del sorteo
        if (paymentData.raffleId) {
          const raffleData = await raffleService.getRaffleById(
            paymentData.raffleId
          );
          setRaffle(raffleData);
        }
      } catch (err: any) {
        setError('Error al cargar los datos de la compra');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paymentId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Cargando...</div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1>Error</h1>
          <p>{error || 'No se pudo cargar la compra'}</p>
          <button onClick={() => router.push('/sorteos')}>
            Volver a TIKETEA ONLINE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        {/* Icono de éxito */}
        <div className={styles.successIcon}>✓</div>

        <h1 className={styles.title}>¡Compra completada!</h1>

        <p className={styles.subtitle}>
          Tu pago ha sido procesado exitosamente
        </p>

        {/* Resumen de compra */}
        <div className={styles.summarySection}>
          <h2>Resumen de tu compra</h2>

          {raffle && (
            <div className={styles.summaryItem}>
              <span>Sorteo:</span>
              <span className={styles.value}>
                {raffle.product?.name || 'Producto'}
              </span>
            </div>
          )}

          <div className={styles.summaryItem}>
            <span>Cantidad de tickets:</span>
            <span className={styles.value}>{payment.ticketQuantity}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Monto pagado:</span>
            <span className={styles.value}>
              S/. {Number(payment.amount).toFixed(2)}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span>Fecha de compra:</span>
            <span className={styles.value}>
              {new Date(payment.createdAt).toLocaleDateString('es-PE')}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span>ID de transacción:</span>
            <span className={styles.value}>{payment.externalTransactionId}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className={styles.infoBox}>
          <p>
            Se ha enviado un email de confirmación a tu correo electrónico con
            los detalles de tu compra y tus números de tickets.
          </p>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={() => router.push('/panel/sorteos')}
          >
            Ver mis sorteos
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => router.push('/sorteos')}
          >
            Volver a TIKETEA ONLINE
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Cargando...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}