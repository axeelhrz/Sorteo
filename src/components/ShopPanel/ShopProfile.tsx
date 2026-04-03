'use client';

import { useState, useEffect } from 'react';
import { Shop, ShopStatus, type SocialMedia } from '@/types/shop';
import { compactSocialMedia, normalizeSocialMediaForForm } from '@/lib/social-media-form';
import { shopService } from '@/services/shop-service';
import styles from './shop-panel.module.css';
import { StatusBadge } from './StatusBadge';

interface ShopProfileProps {
  shop: Shop;
  onUpdate: (shop: Shop) => void;
}

const SOCIAL_FIELDS: { key: keyof SocialMedia; label: string; placeholder: string; type?: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: '@usuario o URL' },
  { key: 'facebook', label: 'Facebook', placeholder: 'Usuario o URL' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: '@usuario o URL' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@usuario o URL' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+51 999 999 999', type: 'tel' },
  { key: 'website', label: 'Sitio web', placeholder: 'https://...', type: 'url' },
];

function shopToFormState(s: Shop): Shop {
  return {
    ...s,
    socialMedia: normalizeSocialMediaForForm(s.socialMedia as unknown),
  };
}

export function ShopProfile({ shop, onUpdate }: ShopProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => shopToFormState(shop));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setFormData(shopToFormState(shop));
  }, [shop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (field: keyof SocialMedia, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...normalizeSocialMediaForForm(prev.socialMedia as unknown),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const socialMedia = compactSocialMedia(formData.socialMedia as SocialMedia);
      const updated = await shopService.updateShop(shop.id, {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        publicEmail: formData.publicEmail,
        phone: formData.phone,
        socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
      });

      setMessage({ type: 'success', text: 'Organizador actualizado correctamente' });
      onUpdate(updated);
      setIsEditing(false);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al actualizar el organizador',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (shop.status) {
      case ShopStatus.PENDING:
        return 'Tu organizador está en revisión. Nos pondremos en contacto pronto.';
      case ShopStatus.BLOCKED:
        return 'Tu organizador ha sido bloqueado. No puedes crear nuevos sorteos.';
      case ShopStatus.VERIFIED:
        return 'Tu organizador está verificado y activo.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.raffleDetail}>
      <div className={styles.raffleDetailHeader}>
        <h1 className={styles.raffleDetailTitle}>Mi organizador</h1>
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
              <div className={styles.raffleDetailItemValue}>
                {(() => {
                  const sm = shop.socialMedia;
                  if (sm && typeof sm === 'object') {
                    const rows = SOCIAL_FIELDS.filter((f) => sm[f.key]).map((f) => (
                      <span key={f.key}>
                        {f.label}: {sm[f.key]}
                      </span>
                    ));
                    const other = sm.other?.trim();
                    if (other) {
                      rows.push(<span key="other">Otras: {other}</span>);
                    }
                    if (rows.length > 0) {
                      return <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{rows}</div>;
                    }
                    return 'No especificado';
                  }
                  if (sm) return String(sm);
                  return 'No especificado';
                })()}
              </div>
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
            <label className={styles.formLabel}>Nombre del organizador</label>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SOCIAL_FIELDS.map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className={styles.formLabel} style={{ fontSize: '13px', marginBottom: '4px' }}>
                    {label}
                  </label>
                  <input
                    type={type || 'text'}
                    value={(formData.socialMedia as SocialMedia)?.[key] ?? ''}
                    onChange={(e) => handleSocialChange(key, e.target.value)}
                    className={styles.formInput}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className={styles.formLabel} style={{ fontSize: '13px', marginBottom: '4px' }}>
                  Otras redes o notas
                </label>
                <textarea
                  value={(formData.socialMedia as SocialMedia)?.other ?? ''}
                  onChange={(e) => handleSocialChange('other', e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Texto libre (ej. varias redes en una sola línea)"
                  rows={3}
                />
              </div>
            </div>
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
                setFormData(shopToFormState(shop));
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