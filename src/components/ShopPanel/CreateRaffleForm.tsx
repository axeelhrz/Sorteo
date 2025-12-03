'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { Shop, ShopStatus } from '@/types/shop';
import { raffleService } from '@/services/raffle-service';
import { productService } from '@/services/product-service';
import styles from '@/app/panel/panel.module.css';

interface CreateRaffleFormProps {
  shop: Shop;
}

export function CreateRaffleForm({ shop }: CreateRaffleFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [specialConditions, setSpecialConditions] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [shop.id]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productService.getActiveProductsByShop(shop.id);
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct) {
      setError('Debes seleccionar un producto');
      return;
    }

    if (shop.status === ShopStatus.BLOCKED) {
      setError('Tu tienda está bloqueada y no puede crear sorteos');
      return;
    }

    setLoading(true);

    try {
      const raffle = await raffleService.createRaffle({
        shopId: shop.id,
        productId: selectedProduct.id,
        specialConditions: specialConditions || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/panel/sorteos/${raffle.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el sorteo');
    } finally {
      setLoading(false);
    }
  };

  if (shop.status === ShopStatus.BLOCKED) {
    return (
      <div className={styles.raffleDetail}>
        <div className={styles.alert + ' ' + styles.alertError}>
          Tu tienda está bloqueada y no puede crear nuevos sorteos. Contacta con soporte para más información.
        </div>
      </div>
    );
  }

  if (loadingProducts) {
    return <div className={styles.alert}>Cargando productos...</div>;
  }

  if (products.length === 0) {
    return (
      <div className={styles.raffleDetail}>
        <div className={styles.alert + ' ' + styles.alertWarning}>
          No tienes productos activos. Crea un producto antes de crear un sorteo.
        </div>
      </div>
    );
  }

  const totalTickets = selectedProduct ? Math.floor(Number(selectedProduct.value) * 2) : 0;

  return (
    <form onSubmit={handleSubmit} className={styles.raffleForm}>
      {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
      {success && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          ✓ Sorteo creado exitosamente. Redirigiendo...
        </div>
      )}

      <div className={styles.raffleFormSection}>
        <h2 className={styles.raffleFormSectionTitle}>1. Selecciona un producto</h2>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Producto</label>
          <select
            value={selectedProduct?.id || ''}
            onChange={(e) => handleProductChange(e.target.value)}
            className={styles.formSelect}
            required
          >
            <option value="">-- Selecciona un producto --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - S/. {Number(product.value).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProduct && (
        <>
          <div className={styles.raffleFormSection}>
            <h2 className={styles.raffleFormSectionTitle}>2. Información del producto</h2>

            <div className={styles.dimensionsGrid}>
              <div className={styles.dimensionInfo}>
                <div className={styles.dimensionLabel}>Altura</div>
                <div className={styles.dimensionValue}>{Number(selectedProduct.height).toFixed(1)} cm</div>
              </div>
              <div className={styles.dimensionInfo}>
                <div className={styles.dimensionLabel}>Ancho</div>
                <div className={styles.dimensionValue}>{Number(selectedProduct.width).toFixed(1)} cm</div>
              </div>
              <div className={styles.dimensionInfo}>
                <div className={styles.dimensionLabel}>Profundidad</div>
                <div className={styles.dimensionValue}>{Number(selectedProduct.depth).toFixed(1)} cm</div>
              </div>
            </div>

            {selectedProduct.requiresDeposit && (
              <div className={styles.depositWarning}>
                ⚠️ Este producto requiere un depósito de garantía. El depósito será retenido hasta que se complete el
                sorteo.
              </div>
            )}

            {!selectedProduct.requiresDeposit && (
              <div className={styles.ticketCalculation}>
                ✓ Este producto no requiere depósito de garantía.
              </div>
            )}
          </div>

          <div className={styles.raffleFormSection}>
            <h2 className={styles.raffleFormSectionTitle}>3. Cálculo de tickets</h2>

            <div className={styles.ticketCalculation}>
              <div>Valor del producto: S/. {Number(selectedProduct.value).toFixed(2)}</div>
              <div>Fórmula: Valor × 2 = Total de tickets</div>
              <div className={styles.ticketCalculationValue}>{totalTickets} tickets</div>
            </div>
          </div>

          <div className={styles.raffleFormSection}>
            <h2 className={styles.raffleFormSectionTitle}>4. Condiciones especiales (opcional)</h2>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Condiciones especiales del sorteo</label>
              <textarea
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                className={styles.formTextarea}
                placeholder="Ej: Envío incluido, garantía de 1 año, etc."
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
              onClick={() => router.back()}
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </form>
  );
}