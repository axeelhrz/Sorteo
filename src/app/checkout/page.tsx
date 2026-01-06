'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiCopy, FiCheck, FiX } from 'react-icons/fi';
import { firebasePaymentService, Payment } from '@/services/firebase-payment-service';
import styles from './checkout.module.css';

export const dynamic = 'force-dynamic';

type PaymentMethod = 'yape' | 'plin' | 'dale' | null;

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

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB');
      return;
    }

    setUploadError(null);
    setVoucherFile(file);

    // Crear preview
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
      // Subir voucher y confirmar pago
      await firebasePaymentService.confirmPaymentWithVoucher(
        payment.id,
        voucherFile,
        selectedMethod
      );

      router.push(`/payment-success?paymentId=${payment.id}&pending=true`);
    } catch (err: any) {
      console.error('Error confirming payment:', err);
      setError(err.response?.data?.message || 'Error al confirmar el pago');
      setConfirmingPayment(false);
    }
  };

  const handlePaymentFailure = async () => {
    if (!payment) return;

    try {
      // PASO 8B.2: Registrar fallo de pago
      await firebasePaymentService.failPayment(
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
        <h1 className={styles.title}>Finalizar Compra</h1>
        <p className={styles.subtitle}>Completa tu pago para adquirir tus tickets</p>

        {/* Resumen del pago */}
        <div className={styles.summarySection}>
          <h2 className={styles.sectionTitle}>Resumen de tu compra</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Cantidad de tickets</span>
              <span className={styles.summaryValue}>{payment.ticketQuantity}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Monto total</span>
              <span className={styles.summaryValue}>
                S/. {Number(payment.amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className={styles.paymentMethods}>
          <h2 className={styles.sectionTitle}>Selecciona tu método de pago</h2>
          <p className={styles.methodsSubtitle}>Elige tu billetera digital preferida</p>

          <div className={styles.methodsGrid}>
            {/* YAPE */}
            <button
              className={`${styles.methodCard} ${selectedMethod === 'yape' ? styles.methodCardActive : ''}`}
              onClick={() => setSelectedMethod('yape')}
            >
              <div className={styles.methodIcon}>
                <Image src="/assets/yape-logo.png" alt="YAPE" width={60} height={60} />
              </div>
              <h3 className={styles.methodName}>YAPE</h3>
              <p className={styles.methodDescription}>Pago instantáneo</p>
            </button>

            {/* PLIN */}
            <button
              className={`${styles.methodCard} ${selectedMethod === 'plin' ? styles.methodCardActive : ''}`}
              onClick={() => setSelectedMethod('plin')}
            >
              <div className={styles.methodIcon}>
                <Image src="/assets/plin-logo.png" alt="PLIN" width={60} height={60} />
              </div>
              <h3 className={styles.methodName}>PLIN</h3>
              <p className={styles.methodDescription}>Pago instantáneo</p>
            </button>

            {/* DALE */}
            <button
              className={`${styles.methodCard} ${selectedMethod === 'dale' ? styles.methodCardActive : ''}`}
              onClick={() => setSelectedMethod('dale')}
            >
              <div className={styles.methodIcon}>
                <span className={styles.daleLogo}>DALE</span>
              </div>
              <h3 className={styles.methodName}>DALE</h3>
              <p className={styles.methodDescription}>Pago instantáneo</p>
            </button>
          </div>
        </div>

        {/* Instrucciones de pago */}
        {selectedMethod && (
          <div className={styles.paymentInstructions}>
            <h2 className={styles.sectionTitle}>Instrucciones de pago</h2>
            
            <div className={styles.instructionsContent}>
              <div className={styles.qrSection}>
                <p className={styles.instructionText}>
                  Escanea el código QR con tu app de {selectedMethod.toUpperCase()}
                </p>
                <div className={styles.qrContainer}>
                  {selectedMethod === 'yape' && (
                    <Image 
                      src="/assets/yape.png" 
                      alt="QR YAPE" 
                      width={280} 
                      height={280}
                      className={styles.qrImage}
                    />
                  )}
                  {selectedMethod === 'plin' && (
                    <Image 
                      src="/assets/plin.png" 
                      alt="QR PLIN" 
                      width={280} 
                      height={280}
                      className={styles.qrImage}
                    />
                  )}
                  {selectedMethod === 'dale' && (
                    <div className={styles.qrPlaceholder}>
                      <p>QR de DALE</p>
                      <p className={styles.phoneNumber}>{phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.manualSection}>
                <p className={styles.instructionText}>O envía al número:</p>
                <div className={styles.phoneBox}>
                  <span className={styles.phoneNumber}>{phoneNumber}</span>
                  <button 
                    className={styles.copyButton}
                    onClick={() => copyToClipboard(phoneNumber)}
                  >
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <div className={styles.amountBox}>
                  <span className={styles.amountLabel}>Monto a pagar:</span>
                  <span className={styles.amountValue}>S/. {Number(payment.amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.confirmSection}>
              <div className={styles.voucherUpload}>
                <h3 className={styles.uploadTitle}>Sube tu comprobante de pago</h3>
                <p className={styles.uploadDescription}>
                  Adjunta una captura de pantalla o foto de tu comprobante de pago
                </p>
                
                <div className={styles.uploadArea}>
                  <input
                    type="file"
                    id="voucher"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleVoucherChange}
                    className={styles.fileInput}
                  />
                  <label htmlFor="voucher" className={styles.fileLabel}>
                    {voucherPreview ? (
                      <div className={styles.previewContainer}>
                        <img src={voucherPreview} alt="Comprobante" className={styles.previewImage} />
                        <button
                          type="button"
                          className={styles.changeImageButton}
                          onClick={(e) => {
                            e.preventDefault();
                            setVoucherFile(null);
                            setVoucherPreview(null);
                          }}
                        >
                          Cambiar imagen
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <div className={styles.uploadIcon}>📸</div>
                        <p className={styles.uploadText}>Haz clic para subir tu comprobante</p>
                        <p className={styles.uploadHint}>JPG, PNG o WEBP (máx. 5MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                {uploadError && (
                  <div className={styles.uploadError}>{uploadError}</div>
                )}
              </div>

              <div className={styles.warningBox}>
                <p>⚠️ Importante: Sube una imagen clara de tu comprobante. Nuestro sistema validará automáticamente el monto pagado. Recibirás un correo cuando tu pago sea verificado.</p>
              </div>

              <button
                className={styles.confirmButton}
                onClick={handleConfirmPayment}
                disabled={confirmingPayment || !voucherFile}
              >
                {confirmingPayment ? 'Procesando...' : 'Confirmar pago y enviar comprobante'}
              </button>
            </div>
          </div>
        )}

        {/* Botón de cancelar */}
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={handlePaymentFailure}
          >
            <FiX className={styles.cancelIcon} />
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