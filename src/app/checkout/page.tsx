'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentService } from '@/services/payment-service';
import { Payment } from '@/types/payment';
import styles from './checkout.module.css';

export const dynamic = 'force-dynamic';

function CheckoutContent() {
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
        setError('Error al cargar el pago');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleStripePayment = async () => {
    if (!payment) return;

    try {
      // PASO 6: Aquí se integraría Stripe
      // Por ahora, simulamos un pago exitoso
      console.log('Iniciando pago con Stripe...');

      // Simular confirmación de pago
      setTimeout(async () => {
        try {
          await paymentService.confirmPayment({
            paymentId: payment.id,
            externalTransactionId: `stripe_${Date.now()}`,
            paymentMethod: 'stripe' as any,
          });

          // PASO 8A.6: Redirigir a página de éxito
          router.push(`/payment-success?paymentId=${payment.id}`);
        } catch (err) {
          console.error('Error confirming payment:', err);
          setError('Error al confirmar el pago');
        }
      }, 2000);
    } catch (err) {
      setError('Error al procesar el pago');
      console.error(err);
    }
  };

  const handleMercadoPagoPayment = async () => {
    if (!payment) return;

    try {
      // PASO 6: Aquí se integraría Mercado Pago
      console.log('Iniciando pago con Mercado Pago...');

      // Simular confirmación de pago
      setTimeout(async () => {
        try {
          await paymentService.confirmPayment({
            paymentId: payment.id,
            externalTransactionId: `mp_${Date.now()}`,
            paymentMethod: 'mercado_pago' as any,
          });

          // PASO 8A.6: Redirigir a página de éxito
          router.push(`/payment-success?paymentId=${payment.id}`);
        } catch (err) {
          console.error('Error confirming payment:', err);
          setError('Error al confirmar el pago');
        }
      }, 2000);
    } catch (err) {
      setError('Error al procesar el pago');
      console.error(err);
    }
  };

  const handlePaymentFailure = async () => {
    if (!payment) return;

    try {
      // PASO 8B.2: Registrar fallo de pago
      await paymentService.failPayment(
        payment.id,
        'Pago rechazado por el usuario'
      );

      // PASO 8B.3: Redirigir a página de fallo
      router.push(`/payment-failed?paymentId=${payment.id}`);
    } catch (err) {
      console.error('Error failing payment:', err);
      setError('Error al procesar el rechazo del pago');
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
          <button onClick={() => router.back()}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.checkoutCard}>
        <h1 className={styles.title}>Checkout</h1>

        {/* Resumen del pago */}
        <div className={styles.summarySection}>
          <h2>Resumen de tu compra</h2>
          <div className={styles.summaryItem}>
            <span>Cantidad de tickets:</span>
            <span className={styles.value}>{payment.ticketQuantity}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Monto total:</span>
            <span className={styles.value}>
              S/. {Number(payment.amount).toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span>Moneda:</span>
            <span className={styles.value}>{payment.currency}</span>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className={styles.paymentMethods}>
          <h2>Selecciona un método de pago</h2>

          <div className={styles.methodCard}>
            <div className={styles.methodHeader}>
              <h3>Tarjeta de Crédito / Débito</h3>
              <p className={styles.methodDescription}>
                Paga de forma segura con Stripe
              </p>
            </div>
            <button
              className={styles.payButton}
              onClick={handleStripePayment}
            >
              Pagar con Stripe
            </button>
          </div>

          <div className={styles.methodCard}>
            <div className={styles.methodHeader}>
              <h3>Mercado Pago</h3>
              <p className={styles.methodDescription}>
                Paga con tu cuenta de Mercado Pago
              </p>
            </div>
            <button
              className={styles.payButton}
              onClick={handleMercadoPagoPayment}
            >
              Pagar con Mercado Pago
            </button>
          </div>
        </div>

        {/* Botón de cancelar */}
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={handlePaymentFailure}
          >
            Cancelar compra
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Cargando...</div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}