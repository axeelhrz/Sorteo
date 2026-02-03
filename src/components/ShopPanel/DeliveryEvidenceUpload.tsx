'use client';

import { useState } from 'react';
import { FiUpload, FiX, FiImage, FiCheck } from 'react-icons/fi';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { WinnerInfo } from '@/types/raffle';
import styles from './delivery-evidence-upload.module.css';

/** Sube una imagen de evidencia de entrega vía API (Firebase Admin Storage). Evita 403 en el cliente. */
async function uploadDeliveryEvidenceImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/uploads/delivery-evidence', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data?.error as string) || 'Error al subir la imagen');
  }
  const data = await res.json();
  return data.fileUrl as string;
}

interface DeliveryEvidenceUploadProps {
  raffleId: string;
  currentUserId: string;
  onUploadSuccess?: (winnerInfo: WinnerInfo) => void;
}

export function DeliveryEvidenceUpload({
  raffleId,
  currentUserId,
  onUploadSuccess,
}: DeliveryEvidenceUploadProps) {
  const [mainPhoto, setMainPhoto] = useState<File | null>(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [additionalPhotoPreviews, setAdditionalPhotoPreviews] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      setMainPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + additionalPhotos.length > 3) {
      alert('Puedes subir máximo 3 fotos adicionales');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`La imagen ${file.name} supera los 5MB`);
        return false;
      }
      return true;
    });

    setAdditionalPhotos([...additionalPhotos, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMainPhoto = () => {
    setMainPhoto(null);
    setMainPhotoPreview(null);
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
    setAdditionalPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mainPhoto) {
      alert('Debes subir al menos una foto de la entrega');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // 1. Subir foto principal (vía API con Firebase Admin Storage para evitar 403)
      const mainPhotoUrl = await uploadDeliveryEvidenceImage(mainPhoto);

      // 2. Subir fotos adicionales
      const additionalPhotoUrls: string[] = [];
      for (const photo of additionalPhotos) {
        const url = await uploadDeliveryEvidenceImage(photo);
        additionalPhotoUrls.push(url);
      }

      // 3. Guardar evidencia en Firestore
      const winnerInfo = await winnerVerificationService.uploadDeliveryEvidence(
        {
          raffleId,
          photoUrl: mainPhotoUrl,
          notes: notes.trim() || undefined,
          additionalPhotos: additionalPhotoUrls.length > 0 ? additionalPhotoUrls : undefined,
        },
        currentUserId
      );

      // 4. Enviar correos: al ganador (evidencia disponible) y al organizador (espera confirmación del ganador)
      try {
        await fetch(`/api/raffles/${raffleId}/notify-after-delivery-evidence`, { method: 'POST' });
      } catch (e) {
        console.error('Error sending delivery notifications:', e);
      }

      setSuccess(true);

      if (onUploadSuccess) {
        onUploadSuccess(winnerInfo);
      }

      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setMainPhoto(null);
        setMainPhotoPreview(null);
        setAdditionalPhotos([]);
        setAdditionalPhotoPreviews([]);
        setNotes('');
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      alert(error.message || 'Error al subir la evidencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Subir Evidencia de Entrega</h3>
        <p className={styles.subtitle}>
          Sube fotografías que demuestren la entrega del premio al ganador
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Foto Principal */}
        <div className={styles.section}>
          <label className={styles.label}>
            Foto de la Entrega <span className={styles.required}>*</span>
          </label>
          <p className={styles.hint}>
            Foto principal que muestre la entrega del premio (máx. 5MB)
          </p>

          {!mainPhotoPreview ? (
            <label className={styles.uploadArea}>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainPhotoChange}
                className={styles.fileInput}
                disabled={loading}
              />
              <FiUpload className={styles.uploadIcon} />
              <span className={styles.uploadText}>
                Haz clic para seleccionar una imagen
              </span>
              <span className={styles.uploadHint}>
                JPG, PNG o WEBP (máx. 5MB)
              </span>
            </label>
          ) : (
            <div className={styles.photoPreview}>
              <img src={mainPhotoPreview} alt="Vista previa" className={styles.previewImage} />
              <button
                type="button"
                onClick={removeMainPhoto}
                className={styles.removeButton}
                disabled={loading}
              >
                <FiX />
              </button>
            </div>
          )}
        </div>

        {/* Fotos Adicionales */}
        <div className={styles.section}>
          <label className={styles.label}>
            Fotos Adicionales <span className={styles.optional}>(Opcional)</span>
          </label>
          <p className={styles.hint}>
            Puedes agregar hasta 3 fotos adicionales (máx. 5MB cada una)
          </p>

          {additionalPhotos.length < 3 && (
            <label className={styles.uploadAreaSmall}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalPhotosChange}
                className={styles.fileInput}
                disabled={loading}
              />
              <FiImage className={styles.uploadIconSmall} />
              <span className={styles.uploadTextSmall}>
                Agregar más fotos ({additionalPhotos.length}/3)
              </span>
            </label>
          )}

          {additionalPhotoPreviews.length > 0 && (
            <div className={styles.additionalPhotosGrid}>
              {additionalPhotoPreviews.map((preview, index) => (
                <div key={index} className={styles.photoPreviewSmall}>
                  <img src={preview} alt={`Adicional ${index + 1}`} className={styles.previewImageSmall} />
                  <button
                    type="button"
                    onClick={() => removeAdditionalPhoto(index)}
                    className={styles.removeButtonSmall}
                    disabled={loading}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notas */}
        <div className={styles.section}>
          <label htmlFor="notes" className={styles.label}>
            Notas <span className={styles.optional}>(Opcional)</span>
          </label>
          <p className={styles.hint}>
            Agrega detalles sobre la entrega, lugar, fecha, etc.
          </p>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Premio entregado el 15 de diciembre con el organizador. El ganador estaba muy contento..."
            className={styles.textarea}
            rows={4}
            maxLength={500}
            disabled={loading}
          />
          <p className={styles.charCount}>
            {notes.length}/500 caracteres
          </p>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !mainPhoto || success}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Subiendo evidencia...
            </>
          ) : success ? (
            <>
              <FiCheck />
              ¡Evidencia subida exitosamente!
            </>
          ) : (
            <>
              <FiUpload />
              Subir Evidencia
            </>
          )}
        </button>

        {success && (
          <div className={styles.successMessage}>
            <FiCheck className={styles.successIcon} />
            <div>
              <h4 className={styles.successTitle}>¡Evidencia subida correctamente!</h4>
              <p className={styles.successText}>
                El ganador tiene 7 días para confirmar la recepción del premio.
                Si no confirma en ese plazo, se dará por confirmada automáticamente.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}