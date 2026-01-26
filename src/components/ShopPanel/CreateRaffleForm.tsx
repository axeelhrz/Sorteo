'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shop, ShopStatus } from '@/types/shop';
import { raffleService } from '@/services/raffle-service';
import { productService } from '@/services/product-service';
import styles from '@/app/panel/panel.module.css';

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
  pickupAddress: string;
  pickupDistrict: string;
}

export function CreateRaffleForm({ shop, onSuccess, onCancel }: CreateRaffleFormProps) {
  const router = useRouter();
  const [specialConditions, setSpecialConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    description: '',
    value: '',
    organizerWhatsapp: shop.phone || '',
    hasDelivery: false,
    deliveryType: '',
    deliveryScope: '',
    pickupAddress: '',
    pickupDistrict: '',
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
      // 1. Crear el producto sin imagen
      let product;
      try {
        product = await productService.createProduct({
          shopId: shop.id,
          name: productData.name.trim(),
          description: productData.description.trim(),
          value,
          mainImage: '', // Sin imagen
          height: 10, // Valores por defecto
          width: 10,
          depth: 10,
        });
      } catch (productError: any) {
        throw new Error(`Error al crear el producto: ${productError.message}`);
      }

      if (!product || !product.id) {
        throw new Error('El producto no se creó correctamente');
      }

      // 2. Crear el sorteo con el producto recién creado
      const specialConditionsText = [
        specialConditions.trim(),
        `WhatsApp Organizador: ${productData.organizerWhatsapp}`,
      ]
        .filter(Boolean)
        .join('\n');

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

      setSuccess(true);
      
      // If onSuccess callback is provided (modal mode), call it
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Otherwise redirect (standalone page mode)
        setTimeout(() => {
          router.push(`/panel/sorteos/${raffle.id}`);
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
          ✓ Producto y sorteo creados exitosamente. Redirigiendo...
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
                Valor de Ticket (S/.) <span style={{ color: 'red' }}>*</span>
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
            Para que el equipo de TIKETEA pueda comunicarse en caso de ser necesario
          </small>
        </div>
      </div>

      <div className={styles.raffleFormSection}>
        <h2 className={styles.raffleFormSectionTitle}>2. Opciones de entrega</h2>

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
                }
              }}
              className={styles.formCheckbox}
            />
            ¿Incluye envío?
          </label>
        </div>

        {productData.hasDelivery ? (
          <>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Cobertura de envío <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={productData.deliveryType}
                onChange={(e) => handleProductChange('deliveryType', e.target.value)}
                className={styles.formSelect}
                required
              >
                <option value="">-- Selecciona una opción --</option>
                <option value="local">Local (Indicar alcance)</option>
                <option value="national">Nacional</option>
                <option value="international">Internacional (Solo productos digitales)</option>
              </select>
            </div>

            {productData.deliveryType === 'local' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Alcance del envío local <span style={{ color: 'red' }}>*</span>
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
          </>
        ) : (
          <>
            <div
              style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
              }}
            >
              <strong>📍 Recojo con organizador</strong>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Dirección de recojo <span style={{ color: 'red' }}>*</span>
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

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          {loading ? 'Creando sorteo...' : 'Crear sorteo'}
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