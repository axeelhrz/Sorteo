'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiCopy, FiMail } from 'react-icons/fi';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { WinnerInfo } from '@/types/raffle';
import styles from './winner-validation.module.css';

interface WinnerValidationProps {
  raffleId: string;
  onValidationSuccess?: (winnerInfo: WinnerInfo) => void;
}

export function WinnerValidation({ raffleId, onValidationSuccess }: WinnerValidationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    winnerInfo?: WinnerInfo;
  } | null>(null);

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setValidationResult({
        valid: false,
        message: 'Por favor ingresa un código de verificación',
      });
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      const result = await winnerVerificationService.validateWinnerCode({
        raffleId,
        verificationCode: code.trim(),
      });

      setValidationResult(result);

      if (result.valid && result.winnerInfo && onValidationSuccess) {
        onValidationSuccess(result.winnerInfo);
      }
    } catch (error: any) {
      setValidationResult({
        valid: false,
        message: error.message || 'Error al validar el código',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (validationResult?.winnerInfo?.verificationCode) {
      navigator.clipboard.writeText(validationResult.winnerInfo.verificationCode);
      alert('Código copiado al portapapeles');
    }
  };

  const formatCode = (value: string) => {
    // Remover caracteres no alfanuméricos
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Formatear en grupos de 4
    const parts = [];
    for (let i = 0; i < cleaned.length && i < 12; i += 4) {
      parts.push(cleaned.substring(i, i + 4));
    }
    
    return parts.join('-');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
  };

  const handleResendEmail = async () => {
    setResendMessage(null);
    setResendLoading(true);
    try {
      const baseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || '';
      const res = await fetch(`${baseUrl}/api/raffles/${raffleId}/resend-winner-email`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendMessage({ type: 'success', text: 'Correo reenviado al ganador correctamente.' });
      } else {
        const errMsg =
          (data && typeof data.error === 'string' && data.error) ||
          `Error del servidor (${res.status}). Revisa la consola o la configuración de EmailJS.`;
        setResendMessage({ type: 'error', text: errMsg });
      }
    } catch (err) {
      setResendMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al reenviar el correo' });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Validar Código del Ganador</h3>
        <p className={styles.subtitle}>
          El ganador debe proporcionarte el código único que recibió por correo electrónico
        </p>
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={resendLoading}
          className={styles.resendButton}
          title="Reenviar correo al ganador con su código"
        >
          {resendLoading ? (
            <>
              <span className={styles.spinner} />
              Reenviando...
            </>
          ) : (
            <>
              <FiMail />
              Reenviar correo al ganador
            </>
          )}
        </button>
        {resendMessage && (
          <p className={resendMessage.type === 'success' ? styles.resendSuccess : styles.resendError}>
            {resendMessage.text}
          </p>
        )}
      </div>

      <form onSubmit={handleValidateCode} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="verification-code" className={styles.label}>
            Código de Verificación
          </label>
          <input
            id="verification-code"
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="XXXX-XXXX-XXXX"
            maxLength={14}
            className={styles.input}
            disabled={loading}
            autoComplete="off"
          />
          <p className={styles.hint}>
            Formato: 4 grupos de 4 caracteres separados por guiones
          </p>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !code.trim()}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Validando...
            </>
          ) : (
            <>
              <FiCheck />
              Validar Código
            </>
          )}
        </button>
      </form>

      {validationResult && (
        <div
          className={`${styles.result} ${
            validationResult.valid ? styles.resultSuccess : styles.resultError
          }`}
        >
          <div className={styles.resultIcon}>
            {validationResult.valid ? (
              <FiCheck className={styles.iconSuccess} />
            ) : (
              <FiX className={styles.iconError} />
            )}
          </div>
          <div className={styles.resultContent}>
            <h4 className={styles.resultTitle}>
              {validationResult.valid ? '✅ Código Válido' : '❌ Código Inválido'}
            </h4>
            <p className={styles.resultMessage}>{validationResult.message}</p>

            {validationResult.valid && validationResult.winnerInfo && (
              <div className={styles.winnerInfo}>
                <h5 className={styles.winnerInfoTitle}>Información del Ganador</h5>
                
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ticket Ganador:</span>
                    <span className={styles.infoValue}>
                      #{validationResult.winnerInfo.ticketNumber}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Código:</span>
                    <span className={styles.infoValue}>
                      {validationResult.winnerInfo.verificationCode}
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className={styles.copyButton}
                        title="Copiar código"
                      >
                        <FiCopy />
                      </button>
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Estado:</span>
                    <span className={styles.infoValue}>
                      {validationResult.winnerInfo.deliveryStatus === 'pending' && '⏳ Pendiente'}
                      {validationResult.winnerInfo.deliveryStatus === 'contacted' && '✅ Contactado'}
                      {validationResult.winnerInfo.deliveryStatus === 'in_delivery' && '📦 En Entrega'}
                      {validationResult.winnerInfo.deliveryStatus === 'delivered' && '✅ Entregado'}
                      {validationResult.winnerInfo.deliveryStatus === 'confirmed' && '✅ Confirmado'}
                    </span>
                  </div>

                  {validationResult.winnerInfo.notifiedAt && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Notificado:</span>
                      <span className={styles.infoValue}>
                        {new Date(validationResult.winnerInfo.notifiedAt).toLocaleString('es-PE', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}

                  {validationResult.winnerInfo.claimedAt && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Validado:</span>
                      <span className={styles.infoValue}>
                        {new Date(validationResult.winnerInfo.claimedAt).toLocaleString('es-PE', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.nextSteps}>
                  <FiAlertCircle className={styles.nextStepsIcon} />
                  <div>
                    <h6 className={styles.nextStepsTitle}>Próximos Pasos:</h6>
                    <ol className={styles.nextStepsList}>
                      <li>Coordina con el ganador la entrega del premio</li>
                      <li>Realiza la entrega del premio</li>
                      <li>Toma fotografías como evidencia de la entrega</li>
                      <li>Sube la evidencia en la plataforma</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}