'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shop, ShopStatus } from '@/types/shop';
import { raffleService } from '@/services/raffle-service';
import { productService } from '@/services/product-service';
import { emailService } from '@/services/email-service';
import { useAuthStore } from '@/store/auth-store';
import styles from './shop-panel.module.css';

interface CreateRaffleFormProps {
  shop: Shop;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  value: string;
  organizerWhatsapp: string;
  hasDelivery: boolean;
  deliveryType: 'local' | 'national' | 'international' | '';
  deliveryScope: string;
  deliveryCost: string;
  pickupAddress: string;
  pickupDistrict: string;
  socialNetworks: string;
}

export function CreateRaffleForm({ shop, onSuccess, onCancel }: CreateRaffleFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [specialConditions, setSpecialConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    description: '',
    value: '',
    organizerWhatsapp: shop.phone || '',
    hasDelivery: false,
    deliveryType: '',
    deliveryScope: '',
    deliveryCost: '',
    pickupAddress: '',
    pickupDistrict: '',
    socialNetworks: shop.socialMedia ? Object.values(shop.socialMedia).filter(Boolean).join(', ') : '',
  });

  const handleProductChange = (field: keyof ProductFormData, value: string | boolean | File | null) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!productData.name.trim()) {
      setError('El nombre del producto es obligatorio');
      return;
    }

    if (!productData.description.trim()) {
      setError('La descripción del producto es obligatoria');
      return;
    }

    const value = parseFloat(productData.value);
    if (isNaN(value) || value <= 0) {
      setError('El valor de ticket debe ser mayor a 0');
      return;
    }

    if (!productData.organizerWhatsapp.trim()) {
      setError('El WhatsApp del organizador es obligatorio');
      return;
    }

    // Validar opciones de entrega
    if (productData.hasDelivery) {
      if (!productData.deliveryType) {
        setError('Debes seleccionar el tipo de cobertura de envío');
        return;
      }
      if (productData.deliveryType === 'local' && !productData.deliveryScope.trim()) {
        setError('Debes indicar el alcance del envío local');
        return;
      }
    } else {
      if (!productData.pickupAddress.trim()) {
        setError('Debes indicar la dirección de recojo');
        return;
      }
      if (!productData.pickupDistrict.trim()) {
        setError('Debes indicar el distrito de recojo');
        return;
      }
    }

    if (shop.status === ShopStatus.BLOCKED) {
      setError('Tu organizador está bloqueado y no puede crear sorteos');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear el producto (con imagen principal y opcionales)
      const mainImage = mainImageUrl || '';
      const images = extraImageUrls.length > 0 ? extraImageUrls : undefined;
      const deliveryCostNum = productData.deliveryCost.trim() ? parseFloat(productData.deliveryCost) : undefined;

      let product;
      try {
        product = await productService.createProduct({
          shopId: shop.id,
          name: productData.name.trim(),
          description: productData.description.trim(),
          value,
          mainImage,
          images,
          height: 10,
          width: 10,
          depth: 10,
          hasDelivery: productData.hasDelivery,
          deliveryZones: productData.hasDelivery ? (productData.deliveryType === 'local' ? productData.deliveryScope : productData.deliveryType) : undefined,
          deliveryCost: deliveryCostNum,
          pickupAddress: !productData.hasDelivery ? productData.pickupAddress.trim() : undefined,
          pickupDistrict: !productData.hasDelivery ? productData.pickupDistrict.trim() : undefined,
          pickupInStore: !productData.hasDelivery,
        });
      } catch (productError: any) {
        throw new Error(`Error al crear el producto: ${productError.message}`);
      }

      if (!product || !product.id) {
        throw new Error('El producto no se creó correctamente');
      }

      // 2. Crear el sorteo con el producto recién creado
      const specialConditionsParts = [
        specialConditions.trim(),
        `WhatsApp Organizador: ${productData.organizerWhatsapp}`,
        productData.socialNetworks.trim() ? `Redes sociales: ${productData.socialNetworks.trim()}` : '',
      ].filter(Boolean);
      const specialConditionsText = specialConditionsParts.join('\n');

      let raffle;
      try {
        raffle = await raffleService.createRaffle({
          shopId: shop.id,
          productId: product.id,
          specialConditions: specialConditionsText || undefined,
        });
      } catch (raffleError: any) {
        throw new Error(`Error al crear el sorteo: ${raffleError.message}`);
      }

      if (!raffle || !raffle.id) {
        throw new Error('El sorteo no se creó correctamente');
      }

      // 3. Enviar para aprobación (solicitud en revisión)
      await raffleService.submitForApproval(raffle.id);

      // 4. Enviar correo al organizador: su solicitud está en revisión
      const organizerEmail = user?.email || shop.publicEmail || '';
      if (organizerEmail) {
        await emailService.sendOpportunityUnderReviewEmail({
          email: organizerEmail,
          organizerName: shop.name,
          productName: productData.name.trim(),
          raffleId: raffle.id,
        });
      }

      setSuccess(true);

      // If onSuccess callback is provided (modal mode), call it
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Otherwise redirect (standalone page mode)
        setTimeout(() => {
          router.push(`/dashboard/store`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error creating raffle:', err);
      setError(err.message || 'Error al crear el sorteo y producto');
      setLoading(false);
    }
  };

  if (shop.status === ShopStatus.BLOCKED) {
    return (
      <div className={styles.raffleDetail}>
        <div className={styles.alert + ' ' + styles.alertError}>
          Tu organizador está bloqueado y no puede crear nuevos sorteos. Contacta con soporte para más información.
        </div>
      </div>
    );
  }

  const totalTickets = productData.value ? Math.floor(parseFloat(productData.value) * 2) : 0;

  return (
    <form onSubmit={handleSubmit} className={styles.raffleForm}>
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
      {success && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          ✓ Tu solicitud de oportunidad fue enviada. Recibirás un correo indicando que está en revisión. Redirigiendo...
        </div>
      )}

      <div className={styles.raffleFormSection}>
        <h2 className={styles.raffleFormSectionTitle}>1. Información del producto</h2>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Nombre del producto <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={productData.name}
            onChange={(e) => handleProductChange('name', e.target.value)}
            className={styles.formInput}
            placeholder="Ej: iPhone 15 Pro Max"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Foto(s) del producto
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-start' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '2px dashed #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: uploadingImage ? '#f9fafb' : '#fff' }}>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingImage}
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  setUploadingImage(true);
                  try {
                    for (let i = 0; i < files.length; i++) {
                      const formData = new FormData();
                      formData.append('image', files[i]);
                      const res = await fetch('/api/uploads/products/image', { method: 'POST', body: formData });
                      const data = await res.json();
                      if (data.fileUrl) {
                        if (!mainImageUrl) setMainImageUrl(data.fileUrl);
                        else setExtraImageUrls((prev) => [...prev, data.fileUrl]);
                      }
                    }
                  } catch (err) {
                    setError('Error al subir la imagen');
                  } finally {
                    setUploadingImage(false);
                    e.target.value = '';
                  }
                }}
              />
              {uploadingImage ? 'Subiendo...' : mainImageUrl || extraImageUrls.length ? 'Añadir otra foto' : 'Seleccionar foto(s)'}
            </label>
            {mainImageUrl && (
              <div style={{ position: 'relative' }}>
                <img src={mainImageUrl} alt="Principal" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                <span style={{ fontSize: 10, display: 'block', marginTop: 4 }}>Principal</span>
              </div>
            )}
            {extraImageUrls.map((url, i) => (
              <img key={i} src={url} alt={`Extra ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Descripción del producto <span style={{ color: 'red' }}>*</span>
          </label>
          <textarea
            value={productData.description}
            onChange={(e) => handleProductChange('description', e.target.value)}
            className={styles.formTextarea}
            placeholder="Describe las características del producto..."
            rows={4}
            required
          />
        </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Valor del producto (S/.) <span style={{ color: 'red' }}>*</span>
              </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={productData.value}
            onChange={(e) => handleProductChange('value', e.target.value)}
            className={styles.formInput}
            placeholder="0.00"
            required
          />
          {productData.value && (
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Se generarán {totalTickets} tickets (Valor × 2)
            </small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            WhatsApp del Organizador <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="tel"
            value={productData.organizerWhatsapp}
            onChange={(e) => handleProductChange('organizerWhatsapp', e.target.value)}
            className={styles.formInput}
            placeholder="Ej: +51 999 999 999"
            required
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Para que el admin de TIKETEA pueda comunicarse contigo en caso de ser necesario
          </small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Redes sociales del organizador (opcional)</label>
          <input
            type="text"
            value={productData.socialNetworks}
            onChange={(e) => handleProductChange('socialNetworks', e.target.value)}
            className={styles.formInput}
            placeholder="Ej: Instagram @tienda, Facebook /mitienda"
          />
        </div>
      </div>

      <div className={styles.raffleFormSection}>
        <h2 className={styles.raffleFormSectionTitle}>2. Entrega</h2>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={productData.hasDelivery}
              onChange={(e) => {
                handleProductChange('hasDelivery', e.target.checked);
                if (!e.target.checked) {
                  handleProductChange('deliveryType', '');
                  handleProductChange('deliveryScope', '');
                  handleProductChange('deliveryCost', '');
                }
              }}
              className={styles.formCheckbox}
            />
            Delivery (envío a domicilio)
          </label>
          <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
            Si no marcas, la entrega será por recojo en local.
          </small>
        </div>

        {productData.hasDelivery ? (
          <>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Zonas de cobertura <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={productData.deliveryType}
                onChange={(e) => handleProductChange('deliveryType', e.target.value)}
                className={styles.formSelect}
                required
              >
                <option value="">-- Selecciona una opción --</option>
                <option value="local">Local (indicar alcance)</option>
                <option value="national">Nacional</option>
                <option value="international">Internacional</option>
              </select>
            </div>

            {productData.deliveryType === 'local' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Indicar zonas de cobertura <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={productData.deliveryScope}
                  onChange={(e) => handleProductChange('deliveryScope', e.target.value)}
                  className={styles.formInput}
                  placeholder="Ej: Lima Metropolitana, Callao"
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Costo de delivery (S/.) — opcional</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={productData.deliveryCost}
                onChange={(e) => handleProductChange('deliveryCost', e.target.value)}
                className={styles.formInput}
                placeholder="Ej: 15.00"
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Si indicas un monto, se sumará al valor del producto y se te entregará al finalizar la oportunidad con las evidencias de entrega. Si no indicas monto, el costo de envío va a tu cuenta y recibirás solo el valor del producto.
              </small>
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
              <strong>NOTA:</strong> Si la oportunidad ofrece delivery, el ganador debe brindar una dirección dentro de la zona de cobertura. Si el ganador no puede dar dirección en zona y se coordina recojo en local, el valor indicado como delivery quedará a favor de la plataforma.
            </div>
          </>
        ) : (
          <>
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <strong>📍 Recojo en local</strong> — Indicar dirección de recojo
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Indicar dirección de recojo <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={productData.pickupAddress}
                onChange={(e) => handleProductChange('pickupAddress', e.target.value)}
                className={styles.formInput}
                placeholder="Ej: Av. Javier Prado 123, San Isidro"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Distrito <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                value={productData.pickupDistrict}
                onChange={(e) => handleProductChange('pickupDistrict', e.target.value)}
                className={styles.formInput}
                placeholder="Ej: San Isidro"
                required
              />
            </div>
          </>
        )}
      </div>

      <div className={styles.raffleFormSection}>
        <h2 className={styles.raffleFormSectionTitle}>3. Condiciones especiales del sorteo (opcional)</h2>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Condiciones especiales</label>
          <textarea
            value={specialConditions}
            onChange={(e) => setSpecialConditions(e.target.value)}
            className={styles.formTextarea}
            placeholder="Ej: Envío incluido, garantía de 1 año, etc."
            rows={3}
          />
        </div>
      </div>

      <div style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#374151' }}>
        <strong>NOTA:</strong> El organizador solo puede solicitar la anulación de una oportunidad si aún no hay tickets comprados.
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? 'Enviando solicitud...' : 'Enviar solicitud de oportunidad'}
        </button>
        <button 
          type="button" 
          className={styles.secondaryButton} 
          onClick={() => onCancel ? onCancel() : router.back()} 
          disabled={loading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}