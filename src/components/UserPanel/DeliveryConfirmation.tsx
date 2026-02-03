'use client';

import { useState } from 'react';
import { FiCheck, FiAlertTriangle, FiClock, FiImage } from 'react-icons/fi';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { WinnerInfo } from '@/types/raffle';
import styles from './delivery-confirmation.module.css';

interface DeliveryConfirmationProps {
  raffleId: string;
  winnerInfo: WinnerInfo;
  userId: string;
  onConfirmSuccess?: () => void;
}

export function DeliveryConfirmation({
  raffleId,
  winnerInfo,
  userId,
  onConfirmSuccess,
}: DeliveryConfirmationProps) {
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!confirm('¿Confirmas que has recibido el premio correctamente?')) {
      return;
    }

    setLoading(true);

    try {
      await winnerVerificationService.confirmDelivery(
        {
          raffleId,
          confirmed: true,
        },
        userId
      );

      alert('✅ Recepción confirmada exitosamente. ¡Gracias por participar!');
      
      if (onConfirmSuccess) {
        onConfirmSuccess();
      }
    } catch (error: any) {
      alert(error.message || 'Error al confirmar la recepción');
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const getDaysRemaining = () => {
    if (!winnerInfo.deliveryDeadline) return null;
    
    const deadline = winnerInfo.deliveryDeadline instanceof Date
      ? winnerInfo.deliveryDeadline
      : new Date(winnerInfo.deliveryDeadline);
    
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isExpired = daysRemaining !== null && daysRemaining < 0;
  const isUrgent = daysRemaining !== null && daysRemaining <= 2 && daysRemaining > 0;

  // Si ya está confirmado
  if (winnerInfo.deliveryStatus === 'confirmed') {
    return (
      <div className={styles.container}>
        <div className={styles.confirmedBanner}>
          <FiCheck className={styles.confirmedIcon} />
          <div>
            <h3 className={styles.confirmedTitle}>Entrega Confirmada</h3>
            <p className={styles.confirmedText}>
              Has confirmado la recepción del premio el{' '}
              {winnerInfo.deliveryConfirmedAt &&
                new Date(winnerInfo.deliveryConfirmedAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
            </p>
          </div>
        </div>

        {winnerInfo.deliveryEvidence && (
          <div className={styles.evidenceSection}>
            <h4 className={styles.evidenceTitle}>Evidencia de Entrega</h4>
            <div className={styles.evidenceGrid}>
              <div
                className={styles.evidenceImage}
                onClick={() => openImageModal(winnerInfo.deliveryEvidence!.photoUrl)}
              >
                <img
                  src={winnerInfo.deliveryEvidence.photoUrl}
                  alt="Evidencia principal"
                />
                <div className={styles.imageOverlay}>
                  <FiImage />
                  <span>Ver imagen</span>
                </div>
              </div>

              {winnerInfo.deliveryEvidence.additionalPhotos?.map((photo, index) => (
                <div
                  key={index}
                  className={styles.evidenceImage}
                  onClick={() => openImageModal(photo)}
                >
                  <img src={photo} alt={`Evidencia adicional ${index + 1}`} />
                  <div className={styles.imageOverlay}>
                    <FiImage />
                    <span>Ver imagen</span>
                  </div>
                </div>
              ))}
            </div>

            {winnerInfo.deliveryEvidence.notes && (
              <div className={styles.evidenceNotes}>
                <strong>Notas del organizador:</strong>
                <p>{winnerInfo.deliveryEvidence.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Si no hay evidencia aún
  if (!winnerInfo.deliveryEvidence) {
    return (
      <div className={styles.container}>
        <div className={styles.pendingBanner}>
          <FiClock className={styles.pendingIcon} />
          <div>
            <h3 className={styles.pendingTitle}>Esperando Entrega</h3>
            <p className={styles.pendingText}>
              El organizador aún no ha subido la evidencia de entrega del premio.
              Te notificaremos cuando esté disponible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar evidencia y opción de confirmar
  return (
    <div className={styles.container}>
      {/* Deadline Warning */}
      {!isExpired && daysRemaining !== null && (
        <div className={`${styles.deadlineBanner} ${isUrgent ? styles.deadlineUrgent : ''}`}>
          <FiAlertTriangle className={styles.deadlineIcon} />
          <div>
            <h4 className={styles.deadlineTitle}>
              {isUrgent ? '⚠️ Tiempo Limitado' : 'Plazo de Confirmación'}
            </h4>
            <p className={styles.deadlineText}>
              Tienes {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} para confirmar la
              recepción del premio. Si no confirmas, se dará por confirmada automáticamente.
            </p>
          </div>
        </div>
      )}

      {isExpired && (
        <div className={styles.expiredBanner}>
          <FiAlertTriangle className={styles.expiredIcon} />
          <div>
            <h4 className={styles.expiredTitle}>Plazo Vencido</h4>
            <p className={styles.expiredText}>
              El plazo de confirmación ha expirado. La entrega se confirmará automáticamente.
            </p>
          </div>
        </div>
      )}

      {/* Evidencia de Entrega */}
      <div className={styles.evidenceSection}>
        <h3 className={styles.sectionTitle}>Evidencia de Entrega</h3>
        <p className={styles.sectionSubtitle}>
          El organizador ha subido evidencia de la entrega del premio
        </p>

        <div className={styles.evidenceGrid}>
          <div
            className={styles.evidenceImage}
            onClick={() => openImageModal(winnerInfo.deliveryEvidence!.photoUrl)}
          >
            <img
              src={winnerInfo.deliveryEvidence.photoUrl}
              alt="Evidencia principal"
            />
            <div className={styles.imageOverlay}>
              <FiImage />
              <span>Ver imagen</span>
            </div>
          </div>

          {winnerInfo.deliveryEvidence.additionalPhotos?.map((photo, index) => (
            <div
              key={index}
              className={styles.evidenceImage}
              onClick={() => openImageModal(photo)}
            >
              <img src={photo} alt={`Evidencia adicional ${index + 1}`} />
              <div className={styles.imageOverlay}>
                <FiImage />
                <span>Ver imagen</span>
              </div>
            </div>
          ))}
        </div>

        {winnerInfo.deliveryEvidence.notes && (
          <div className={styles.evidenceNotes}>
            <strong>Notas del organizador:</strong>
            <p>{winnerInfo.deliveryEvidence.notes}</p>
          </div>
        )}

        <div className={styles.evidenceInfo}>
          <p>
            <strong>Subido el:</strong>{' '}
            {new Date(winnerInfo.deliveryEvidence.uploadedAt).toLocaleString('es-PE', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
      </div>

      {/* Confirmación */}
      <div className={styles.confirmSection}>
        <h3 className={styles.confirmTitle}>¿Has recibido tu premio?</h3>
        <p className={styles.confirmText}>
          Si has recibido el premio correctamente, por favor confírmalo haciendo clic en el botón
          de abajo. Si tienes algún problema, puedes abrir un reclamo.
        </p>

        <div className={styles.buttonGroup}>
          <button
            onClick={handleConfirm}
            className={styles.confirmButton}
            disabled={loading || isExpired}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Confirmando...
              </>
            ) : (
              <>
                <FiCheck />
                Confirmar Recepción
              </>
            )}
          </button>

          <button
            onClick={() => {
              window.location.href = `/user-panel/support?raffleId=${raffleId}`;
            }}
            className={styles.complaintButton}
            disabled={loading}
          >
            Reportar Problema
          </button>
        </div>
      </div>

      {/* Modal de Imagen */}
      {showImageModal && selectedImage && (
        <div className={styles.modal} onClick={closeImageModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeImageModal}>
              ×
            </button>
            <img src={selectedImage} alt="Evidencia ampliada" className={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
  );
}