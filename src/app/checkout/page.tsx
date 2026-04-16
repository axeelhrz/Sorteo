'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCopy, FiCheck, FiX, FiUpload, FiCheckCircle } from 'react-icons/fi';
import { firebasePaymentService, Payment } from '@/services/firebase-payment-service';
import { publicRaffleService } from '@/services/public-raffle-service';
import { Raffle } from '@/types/raffle';
import { formatUsdc, penToUsdc, resolveSolesPerUsdc } from '@/lib/pen-usdc-display';
import styles from './checkout.module.css';

export const dynamic = 'force-dynamic';

/** Único método de pago en checkout: criptomoneda */
const CHECKOUT_PAYMENT_METHOD = 'crypto' as const;
const CRYPTO_WALLET_ADDRESS = 'Gx9g45pNsENwczo197GTFgJrh6BN3pEZKqiEAfPZ453m';
const CRYPTO_QR_PATH = '/assets/QR-cripto.png';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('paymentId');

  const [payment, setPayment] = useState<Payment | null>(null);
  const [checkoutRaffle, setCheckoutRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const confirmInFlightRef = useRef(false);

  useEffect(() => {
    if (!paymentId) {
      setError('ID de participación no encontrado');
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        const paymentData = await firebasePaymentService.getPaymentById(paymentId);
        setPayment(paymentData);
      } catch (err: any) {
        setError('Error al cargar la participación');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  useEffect(() => {
    if (!payment?.raffleId) {
      setCheckoutRaffle(null);
      return;
    }
    let cancelled = false;
    publicRaffleService
      .getRaffleById(payment.raffleId)
      .then((r) => {
        if (!cancelled) setCheckoutRaffle(r);
      })
      .catch(() => {
        if (!cancelled) setCheckoutRaffle(null);
      });
    return () => {
      cancelled = true;
    };
  }, [payment?.raffleId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB');
      return;
    }

    setUploadError(null);
    setVoucherFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPayment = async () => {
    if (!payment) {
      return;
    }

    if (!voucherFile) {
      setError('Debes subir el comprobante de participación');
      return;
    }

    if (confirmInFlightRef.current) {
      return;
    }
    confirmInFlightRef.current = true;
    setConfirmingPayment(true);
    setError(null);

    try {
      // Subir comprobante vía API del mismo origen para evitar CORS con Firebase Storage
      const formData = new FormData();
      formData.append('voucher', voucherFile);
      formData.append('paymentId', payment.id);
      formData.append('paymentMethod', CHECKOUT_PAYMENT_METHOD);
      formData.append('amount', String(payment.amount ?? 0));
      formData.append('ticketQuantity', String(payment.ticketQuantity ?? 1));

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/payments/confirm-with-voucher', {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.details || data.error || `Error ${res.status}`;
        throw new Error(msg);
      }

      router.push(`/payment-success?paymentId=${payment.id}&pending=true`);
    } catch (err: unknown) {
      console.error('Error confirming payment:', err);
      setError(err instanceof Error ? err.message : 'Error al confirmar la participación');
      setConfirmingPayment(false);
      confirmInFlightRef.current = false;
    }
  };

  const handlePaymentFailure = async () => {
    if (!payment) return;

    try {
      await firebasePaymentService.failPayment(
        payment.id,
        'Participación rechazada por el usuario'
      );

      router.push(`/payment-failed?paymentId=${payment.id}`);
    } catch (err) {
      console.error('Error failing payment:', err);
      setError('Error al procesar el rechazo de la participación');
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando información de la participación...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Error al cargar la participación</h1>
          <p>{error || 'No se pudo cargar la información de la participación'}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  const amountPen = Number(payment.amount);
  const amountUsdc = penToUsdc(amountPen, checkoutRaffle?.solesPerUsdcAtApproval);
  const rateConfigured = resolveSolesPerUsdc(checkoutRaffle?.solesPerUsdcAtApproval) != null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.checkoutContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>Finalizar Participación</h1>
          <p className={styles.mainSubtitle}>
            Completa tu participación de forma rápida y segura
          </p>
        </div>

        {/* Purchase Summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.cardTitle}>Resumen de participación</h2>
          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Tickets</span>
              <span className={styles.summaryValue}>{payment.ticketQuantity} unidades</span>
            </div>
            <div className={styles.summaryDivider}></div>
            {amountUsdc != null ? (
              <>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Total a enviar (USDC)</span>
                  <span className={styles.summaryTotal}>{formatUsdc(amountUsdc)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Referencia en soles</span>
                  <span className={styles.summaryValue}>S/ {amountPen.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Total a pagar</span>
                <span className={styles.summaryTotal}>S/ {amountPen.toFixed(2)}</span>
              </div>
            )}
            {!rateConfigured ? (
              <p className={styles.summaryRateNote}>
                Sin tipo de cambio (ni en la oportunidad ni en la plataforma): se muestra solo el monto en soles.
              </p>
            ) : null}
          </div>
        </div>

        {/* Método único: criptomoneda */}
        <div className={styles.paymentMethodsCard}>
          <h2 className={styles.cardTitle}>Método de participación</h2>
          <p className={styles.cardSubtitle}>
            Pago único con criptomoneda: escanea el QR o copia la dirección de wallet
          </p>
        </div>

        {/* Instrucciones de pago */}
        <>
            <div className={styles.instructionsCard}>
              <h2 className={styles.cardTitle}>Realiza tu participación</h2>
              
              <div className={styles.instructionsLayout}>
                <div className={styles.qrSection}>
                  <div className={styles.qrHeader}>
                    <h3 className={styles.qrTitle}>Código QR de la wallet</h3>
                    <p className={styles.qrSubtitle}>
                      Escanea con tu wallet o exchange compatible (red Solana) y envía el equivalente al monto de referencia
                    </p>
                  </div>
                  
                  <div className={styles.qrWrapper}>
                    <img
                      src={CRYPTO_QR_PATH}
                      alt="QR wallet criptomoneda"
                      className={styles.qrCode}
                    />
                  </div>
                </div>

                <div className={styles.manualSection}>
                  <div className={styles.manualHeader}>
                    <h3 className={styles.manualTitle}>Dirección de wallet</h3>
                    <p className={styles.manualSubtitle}>Copia y pega en tu app si prefieres no usar el QR</p>
                  </div>

                  <div className={styles.phoneCard}>
                    <span className={styles.phoneLabel}>Wallet (Solana)</span>
                    <div className={`${styles.phoneRow} ${styles.walletRow}`}>
                      <span className={`${styles.phoneValue} ${styles.walletValue}`}>{CRYPTO_WALLET_ADDRESS}</span>
                      <button 
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(CRYPTO_WALLET_ADDRESS)}
                        title="Copiar dirección"
                      >
                        {copied ? <FiCheck /> : <FiCopy />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.amountCard}>
                    {amountUsdc != null ? (
                      <>
                        <span className={styles.amountLabel}>Monto a enviar (USDC)</span>
                        <span className={styles.amountValue}>{formatUsdc(amountUsdc)}</span>
                        <span className={styles.amountRefLabel}>Referencia en soles</span>
                        <span className={styles.amountRefValue}>S/ {amountPen.toFixed(2)}</span>
                        <p className={styles.amountRateHint}>
                          {checkoutRaffle?.solesPerUsdcAtApproval != null
                            ? 'Tipo de cambio guardado al aprobar la oportunidad (soles por 1 USDC), no es cotización en tiempo real.'
                            : 'Tipo de cambio configurado por la plataforma (soles por 1 USDC), no es cotización en tiempo real.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className={styles.amountLabel}>Monto de referencia (soles)</span>
                        <span className={styles.amountValue}>S/ {amountPen.toFixed(2)}</span>
                      </>
                    )}
                  </div>

                  <div className={styles.infoBox}>
                    <p>
                      Envía la cantidad en USDC indicada arriba cuando el tipo de cambio esté configurado; si no, usa el monto en soles como referencia y envía el equivalente en tu wallet.
                      El comprobante debe ser legible (captura del envío, hash o detalle de la transacción).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Upload */}
            <div className={styles.voucherCard}>
              <h2 className={styles.cardTitle}>Comprobante de participación</h2>
              <p className={styles.cardSubtitle}>
                Sube una captura de pantalla de tu comprobante
              </p>

              <div className={styles.uploadContainer}>
                <input
                  type="file"
                  id="voucher-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleVoucherChange}
                  className={styles.fileInput}
                />
                
                {!voucherPreview ? (
                  <label htmlFor="voucher-upload" className={styles.uploadLabel}>
                    <div className={styles.uploadContent}>
                      <div className={styles.uploadIconWrapper}>
                        <FiUpload />
                      </div>
                      <h3 className={styles.uploadTitle}>Subir comprobante</h3>
                      <p className={styles.uploadHint}>
                        Haz clic o arrastra tu imagen aquí
                      </p>
                      <span className={styles.uploadFormats}>
                        JPG, PNG o WEBP (máx. 5MB)
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className={styles.previewWrapper}>
                    <img 
                      src={voucherPreview} 
                      alt="Comprobante" 
                      className={styles.previewImg} 
                    />
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => {
                        setVoucherFile(null);
                        setVoucherPreview(null);
                      }}
                    >
                      <FiX /> Cambiar imagen
                    </button>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className={styles.errorAlert}>
                  {uploadError}
                </div>
              )}

              <div className={styles.warningAlert}>
                <strong>⚠️ Importante:</strong> El comprobante debe mostrar de forma clara el envío a esta wallet, fecha y monto o identificador de la transacción.
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionsContainer}>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirmPayment}
                disabled={confirmingPayment || !voucherFile}
              >
                {confirmingPayment ? (
                  <>
                    <div className={styles.btnSpinner}></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Confirmar participación
                  </>
                )}
              </button>

              <button
                className={styles.cancelBtn}
                onClick={handlePaymentFailure}
                disabled={confirmingPayment}
              >
                <FiX />
                Cancelar participación
              </button>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                {error}
              </div>
            )}
        </>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className={styles.pageWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}