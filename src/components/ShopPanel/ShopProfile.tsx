'use client';

import { useState, useEffect } from 'react';
import { Shop, ShopStatus } from '@/types/shop';
import { shopService } from '@/services/shop-service';
import styles from '@/app/panel/panel.module.css';
import { StatusBadge } from './StatusBadge';

interface ShopProfileProps {
  shop: Shop;
  onUpdate: (shop: Shop) => void;
}

export function ShopProfile({ shop, onUpdate }: ShopProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(shop);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setFormData(shop);
  }, [shop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updated = await shopService.updateShop(shop.id, {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        publicEmail: formData.publicEmail,
        phone: formData.phone,
        socialMedia: formData.socialMedia,
      });

      setMessage({ type: 'success', text: 'Tienda actualizada correctamente' });
      onUpdate(updated);
      setIsEditing(false);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar la tienda',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (shop.status) {
      case ShopStatus.PENDING:
        return 'Tu tienda está en revisión. Nos pondremos en contacto pronto.';
      case ShopStatus.BLOCKED:
        return 'Tu tienda ha sido bloqueada. No puedes crear nuevos sorteos.';
      case ShopStatus.VERIFIED:
        return 'Tu tienda está verificada y activa.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.raffleDetail}>
      <div className={styles.raffleDetailHeader}>
        <h1 className={styles.raffleDetailTitle}>Mi tienda</h1>
        <StatusBadge status={shop.status} />
      </div>

      {getStatusMessage() && (
        <div
          className={`${styles.alert} ${
            shop.status === ShopStatus.BLOCKED ? styles.alertError : styles.alertInfo
          }`}
        >
          {getStatusMessage()}
        </div>
      )}

      {message && (
        <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {message.text}
        </div>
      )}

      {!isEditing ? (
        <div>
          <div className={styles.raffleDetailGrid}>
            <div className={styles.raffleDetailItem}>
              <div className={styles.raffleDetailItemLabel}>Nombre</div>
              <div className={styles.raffleDetailItemValue}>{shop.name}</div>
            </div>
            <div className={styles.raffleDetailItem}>
              <div className={styles.raffleDetailItemLabel}>Email público</div>
              <div className={styles.raffleDetailItemValue}>{shop.publicEmail || 'No especificado'}</div>
            </div>
            <div className={styles.raffleDetailItem}>
              <div className={styles.raffleDetailItemLabel}>Teléfono</div>
              <div className={styles.raffleDetailItemValue}>{shop.phone || 'No especificado'}</div>
            </div>
            <div className={styles.raffleDetailItem}>
              <div className={styles.raffleDetailItemLabel}>Redes sociales</div>
              <div className={styles.raffleDetailItemValue}>{shop.socialMedia || 'No especificado'}</div>
            </div>
          </div>

          {shop.description && (
            <div className={styles.raffleDetailSection}>
              <div className={styles.raffleDetailSectionTitle}>Descripción</div>
              <p>{shop.description}</p>
            </div>
          )}

          {shop.status !== ShopStatus.BLOCKED && (
            <button className={styles.primaryButton} onClick={() => setIsEditing(true)}>
              ✏️ Editar información
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.profileForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre de la tienda</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Logo (URL)</label>
            <input
              type="url"
              name="logo"
              value={formData.logo || ''}
              onChange={handleChange}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email público</label>
            <input
              type="email"
              name="publicEmail"
              value={formData.publicEmail || ''}
              onChange={handleChange}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Redes sociales</label>
            <input
              type="text"
              name="socialMedia"
              value={formData.socialMedia || ''}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="@usuario o enlace"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.primaryButton} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setIsEditing(false);
                setFormData(shop);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}