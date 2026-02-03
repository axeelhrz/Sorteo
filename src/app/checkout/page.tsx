'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiCopy, FiCheck, FiX, FiUpload, FiCheckCircle } from 'react-icons/fi';
import { firebasePaymentService, Payment } from '@/services/firebase-payment-service';
import styles from './checkout.module.css';

export const dynamic = 'force-dynamic';

type PaymentMethod = 'yape' | 'plin' | null;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('paymentId');

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError('ID de pago no encontrado');
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        const paymentData = await firebasePaymentService.getPaymentById(paymentId);
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

  const phoneNumber = '984908819';

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
    if (!payment || !selectedMethod) {
      setError('Selecciona un método de pago');
      return;
    }

    if (!voucherFile) {
      setError('Debes subir el comprobante de pago');
      return;
    }

    setConfirmingPayment(true);
    setError(null);

    try {
      // Subir comprobante vía API del mismo origen para evitar CORS con Firebase Storage
      const formData = new FormData();
      formData.append('voucher', voucherFile);
      formData.append('paymentId', payment.id);
      formData.append('paymentMethod', selectedMethod);
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
      setError(err instanceof Error ? err.message : 'Error al confirmar el pago');
      setConfirmingPayment(false);
    }
  };

  const handlePaymentFailure = async () => {
    if (!payment) return;

    try {
      await firebasePaymentService.failPayment(
        payment.id,
        'Pago rechazado por el usuario'
      );

      router.push(`/payment-failed?paymentId=${payment.id}`);
    } catch (err) {
      console.error('Error failing payment:', err);
      setError('Error al procesar el rechazo del pago');
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando información del pago...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h1>Error al cargar el pago</h1>
          <p>{error || 'No se pudo cargar la información del pago'}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.checkoutContainer}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.mainTitle}>Finalizar Compra</h1>
          <p className={styles.mainSubtitle}>
            Completa tu pago de forma rápida y segura
          </p>
        </div>

        {/* Purchase Summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.cardTitle}>Resumen de compra</h2>
          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Tickets</span>
              <span className={styles.summaryValue}>{payment.ticketQuantity} unidades</span>
            </div>
            <div className={styles.summaryDivider}></div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Total a pagar</span>
              <span className={styles.summaryTotal}>S/ {Number(payment.amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className={styles.paymentMethodsCard}>
          <h2 className={styles.cardTitle}>Método de pago</h2>
          <p className={styles.cardSubtitle}>Selecciona tu billetera digital</p>
          
          <div className={styles.methodsContainer}>
            <button
              className={`${styles.methodButton} ${selectedMethod === 'yape' ? styles.methodActive : ''}`}
              onClick={() => setSelectedMethod('yape')}
            >
              <div className={styles.methodLogo}>
                <Image src="/assets/yape-logo.png" alt="YAPE" width={48} height={48} />
              </div>
              <span className={styles.methodName}>YAPE</span>
              {selectedMethod === 'yape' && (
                <div className={styles.methodCheck}>
                  <FiCheckCircle />
                </div>
              )}
            </button>

            <button
              className={`${styles.methodButton} ${selectedMethod === 'plin' ? styles.methodActive : ''}`}
              onClick={() => setSelectedMethod('plin')}
            >
              <div className={styles.methodLogo}>
                <Image src="/assets/plin-logo.png" alt="PLIN" width={48} height={48} />
              </div>
              <span className={styles.methodName}>PLIN</span>
              {selectedMethod === 'plin' && (
                <div className={styles.methodCheck}>
                  <FiCheckCircle />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Payment Instructions */}
        {selectedMethod && (
          <>
            <div className={styles.instructionsCard}>
              <h2 className={styles.cardTitle}>Realiza tu pago</h2>
              
              <div className={styles.instructionsLayout}>
                {/* QR Code Section */}
                <div className={styles.qrSection}>
                  <div className={styles.qrHeader}>
                    <h3 className={styles.qrTitle}>Escanea el código QR</h3>
                    <p className={styles.qrSubtitle}>
                      Abre tu app de {selectedMethod.toUpperCase()} y escanea
                    </p>
                  </div>
                  
                  <div className={styles.qrWrapper}>
                    {selectedMethod === 'yape' && (
                      <img 
                        src="/assets/yape.png" 
                        alt="QR YAPE" 
                        className={styles.qrCode}
                      />
                    )}
                    {selectedMethod === 'plin' && (
                      <img 
                        src="/assets/plin.png" 
                        alt="QR PLIN" 
                        className={styles.qrCode}
                      />
                    )}
                  </div>
                </div>

                {/* Manual Payment Section */}
                <div className={styles.manualSection}>
                  <div className={styles.manualHeader}>
                    <h3 className={styles.manualTitle}>O paga manualmente</h3>
                    <p className={styles.manualSubtitle}>Envía al siguiente número</p>
                  </div>

                  <div className={styles.phoneCard}>
                    <span className={styles.phoneLabel}>Número de celular</span>
                    <div className={styles.phoneRow}>
                      <span className={styles.phoneValue}>{phoneNumber}</span>
                      <button 
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(phoneNumber)}
                        title="Copiar número"
                      >
                        {copied ? <FiCheck /> : <FiCopy />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.amountCard}>
                    <span className={styles.amountLabel}>Monto exacto</span>
                    <span className={styles.amountValue}>S/ {Number(payment.amount).toFixed(2)}</span>
                  </div>

                  <div className={styles.infoBox}>
                    <p>💡 Asegúrate de enviar el monto exacto para evitar demoras en la verificación</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Upload */}
            <div className={styles.voucherCard}>
              <h2 className={styles.cardTitle}>Comprobante de pago</h2>
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
                <strong>⚠️ Importante:</strong> Asegúrate de que el comprobante sea legible y muestre claramente el monto y la fecha de la transacción.
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
                    Confirmar pago
                  </>
                )}
              </button>

              <button
                className={styles.cancelBtn}
                onClick={handlePaymentFailure}
                disabled={confirmingPayment}
              >
                <FiX />
                Cancelar compra
              </button>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                {error}
              </div>
            )}
          </>
        )}
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