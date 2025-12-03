'use client';

import { useState } from 'react';
import { ComplaintType } from '@/types/complaint';
import { complaintService } from '@/services/complaint-service';
import styles from './complaints.module.css';

interface CreateComplaintFormProps {
  raffleId?: string;
  shopId?: string;
  paymentId?: string;
  onSuccess?: () => void;
}

export default function CreateComplaintForm({
  raffleId,
  shopId,
  paymentId,
  onSuccess,
}: CreateComplaintFormProps) {
  const [formData, setFormData] = useState({
    type: ComplaintType.PRIZE_NOT_DELIVERED,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const complaintTypeLabels: Record<ComplaintType, string> = {
    [ComplaintType.PRIZE_NOT_DELIVERED]: 'No entrega del premio',
    [ComplaintType.DIFFERENT_PRODUCT]: 'Producto diferente al ofertado',
    [ComplaintType.PURCHASE_PROBLEM]: 'Problema en la compra',
    [ComplaintType.SHOP_BEHAVIOR]: 'Problema con la tienda',
    [ComplaintType.RAFFLE_FRAUD]: 'Fraude o irregularidad',
    [ComplaintType.TECHNICAL_ISSUE]: 'Problema técnico',
    [ComplaintType.PAYMENT_ERROR]: 'Error de pago',
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await complaintService.createComplaint({
        type: formData.type as ComplaintType,
        description: formData.description,
        raffleId,
        shopId,
        paymentId,
      });

      setSuccess(true);
      setFormData({
        type: ComplaintType.PRIZE_NOT_DELIVERED,
        description: '',
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el reclamo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Crear Reclamo</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>Reclamo creado exitosamente</div>}

      <div className={styles.formGroup}>
        <label htmlFor="type">Tipo de Reclamo *</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          {Object.entries(complaintTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Descripción del Problema *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe detalladamente el problema que experimentaste..."
          minLength={10}
          maxLength={5000}
          required
          rows={6}
        />
        <small>{formData.description.length}/5000 caracteres</small>
      </div>

      <button type="submit" disabled={loading} className={styles.submitBtn}>
        {loading ? 'Creando reclamo...' : 'Crear Reclamo'}
      </button>
    </form>
  );
}