'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentService } from '@/services/payment-service';
import { Payment } from '@/types/payment';
import styles from './payment-failed.module.css';

export const dynamic = 'force-dynamic';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('paymentId');

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError('ID de pago no encontrado');
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        const paymentData = await paymentService.getPaymentById(paymentId);
        setPayment(paymentData);
      } catch (err: any) {
        setError('Error al cargar los datos del pago');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleRetry = () => {
    if (payment) {
      router.push(`/checkout?paymentId=${payment.id}`);
    }
  };

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
          <p>{error || 'No se pudo cargar el pago'}</p>
          <button onClick={() => router.push('/sorteos')}>
            Volver a TIKETEA ONLINE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.failedCard}>
        {/* Icono de error */}
        <div className={styles.failedIcon}>✕</div>

        <h1 className={styles.title}>Pago rechazado</h1>

        <p className={styles.subtitle}>
          Tu pago no pudo ser procesado
        </p>

        {/* Razón del fallo */}
        {payment.failureReason && (
          <div className={styles.reasonBox}>
            <p>
              <strong>Razón:</strong> {payment.failureReason}
            </p>
          </div>
        )}

        {/* Información de la compra */}
        <div className={styles.summarySection}>
          <h2>Detalles de tu intento de compra</h2>

          <div className={styles.summaryItem}>
            <span>Cantidad de tickets:</span>
            <span className={styles.value}>{payment.ticketQuantity}</span>
          </div>

          <div className={styles.summaryItem}>
            <span>Monto:</span>
            <span className={styles.value}>
              S/. {Number(payment.amount).toFixed(2)}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span>Fecha del intento:</span>
            <span className={styles.value}>
              {new Date(payment.createdAt).toLocaleDateString('es-PE')}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className={styles.infoBox}>
          <p>
            Tu cantidad de tickets seleccionados se ha mantenido. Puedes
            intentar de nuevo con otro método de pago.
          </p>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={handleRetry}
          >
            Intentar de nuevo
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

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Cargando...</div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}