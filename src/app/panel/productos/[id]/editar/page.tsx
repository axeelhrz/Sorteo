'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { Shop } from '@/types/shop';
import { Product, UpdateProductDto } from '@/types/product';
import { shopService } from '@/services/shop-service';
import { productService } from '@/services/product-service';
import { ShopHeader } from '@/components/ShopPanel/ShopHeader';
import { ShopSidebar } from '@/components/ShopPanel/ShopSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/app/panel/panel.module.css';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user, isAuthenticated } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateProductDto>({});
  const [dimensionErrors, setDimensionErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user && productId) {
      loadData();
    }
  }, [isAuthenticated, user, productId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [shopData, productData] = await Promise.all([
        shopService.getMyShop(),
        productService.getProductById(productId),
      ]);

      setShop(shopData);
      setProduct(productData);

      // Validar que el producto pertenece a la tienda
      if (productData.shopId !== shopData.id) {
        setError('Este producto no pertenece a tu tienda');
        return;
      }

      // Inicializar formulario con datos del producto
      setFormData({
        name: productData.name,
        description: productData.description,
        value: productData.value,
        height: productData.height,
        width: productData.width,
        depth: productData.depth,
        category: productData.category,
        mainImage: productData.mainImage,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  const validateDimensions = (height: number, width: number, depth: number): string[] => {
    const errors: string[] = [];
    const MAX_DIMENSION = 15;

    if (height <= 0) errors.push('La altura debe ser mayor a 0');
    if (width <= 0) errors.push('El ancho debe ser mayor a 0');
    if (depth <= 0) errors.push('La profundidad debe ser mayor a 0');

    if (height > MAX_DIMENSION) errors.push(`La altura no puede exceder ${MAX_DIMENSION}cm`);
    if (width > MAX_DIMENSION) errors.push(`El ancho no puede exceder ${MAX_DIMENSION}cm`);
    if (depth > MAX_DIMENSION) errors.push(`La profundidad no puede exceder ${MAX_DIMENSION}cm`);

    return errors;
  };

  const handleDimensionChange = (field: 'height' | 'width' | 'depth', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [field]: numValue }));

    // Validar dimensiones en tiempo real
    const height = field === 'height' ? numValue : formData.height || product?.height || 0;
    const width = field === 'width' ? numValue : formData.width || product?.width || 0;
    const depth = field === 'depth' ? numValue : formData.depth || product?.depth || 0;

    const errors = validateDimensions(height, width, depth);
    setDimensionErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar dimensiones antes de enviar
    const height = formData.height || product?.height || 0;
    const width = formData.width || product?.width || 0;
    const depth = formData.depth || product?.depth || 0;

    const errors = validateDimensions(height, width, depth);
    if (errors.length > 0) {
      setDimensionErrors(errors);
      setError('Por favor corrige los errores en las dimensiones');
      return;
    }

    setLoading(true);

    try {
      await productService.updateProduct(productId, formData);
      router.push('/panel/productos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      // Nota: El backend no tiene endpoint de delete, solo deactivate
      await productService.deactivateProduct(productId);
      router.push('/panel/productos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el producto');
      setLoading(false);
    }
  };

  const currentHeight = formData.height !== undefined ? formData.height : product?.height || 0;
  const currentWidth = formData.width !== undefined ? formData.width : product?.width || 0;
  const currentDepth = formData.depth !== undefined ? formData.depth : product?.depth || 0;
  const currentValue = formData.value !== undefined ? formData.value : product?.value || 0;

  const requiresDeposit = currentHeight > 15 || currentWidth > 15 || currentDepth > 15;

  if (loadingData) {
    return (
      <ProtectedRoute requiredRole={UserRole.SHOP}>
        <div className={styles.panelContainer}>
          <ShopSidebar />
          <main className={styles.mainContent}>
            <div className={styles.alert}>Cargando datos...</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!product || !shop) {
    return (
      <ProtectedRoute requiredRole={UserRole.SHOP}>
        <div className={styles.panelContainer}>
          <ShopSidebar />
          <main className={styles.mainContent}>
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error || 'Producto no encontrado'}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={UserRole.SHOP}>
      <div className={styles.panelContainer}>
        <ShopSidebar isBlocked={shop?.status === 'blocked'} />
        <main className={styles.mainContent}>
          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error}
              <button onClick={loadData} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
                Reintentar
              </button>
            </div>
          )}
          <ShopHeader shop={shop} />
          <div className={styles.raffleDetail}>
            <h1 className={styles.raffleDetailTitle}>Editar producto</h1>

            <form onSubmit={handleSubmit} className={styles.raffleForm}>
              {/* Información básica */}
              <div className={styles.raffleFormSection}>
                <h2 className={styles.raffleFormSectionTitle}>Información básica</h2>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Nombre del producto <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || product.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Descripción <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    value={formData.description || product.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className={styles.formTextarea}
                    required
                    rows={4}
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
                    value={formData.value !== undefined ? formData.value : product.value}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))
                    }
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Categoría (opcional)</label>
                  <input
                    type="text"
                    value={formData.category !== undefined ? formData.category : product.category || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>URL de imagen principal (opcional)</label>
                  <input
                    type="url"
                    value={formData.mainImage !== undefined ? formData.mainImage : product.mainImage || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mainImage: e.target.value }))
                    }
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* Dimensiones */}
              <div className={styles.raffleFormSection}>
                <h2 className={styles.raffleFormSectionTitle}>
                  Dimensiones (en centímetros) <span style={{ color: 'red' }}>*</span>
                </h2>
                <p className={styles.formHelpText}>
                  Máximo permitido: 15cm por cada dimensión. Si alguna dimensión excede este
                  límite, se requerirá un depósito de garantía.
                </p>

                <div className={styles.dimensionsGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Altura (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="15"
                      value={currentHeight}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                      className={
                        dimensionErrors.some((e) => e.includes('altura') || e.includes('Alto'))
                          ? `${styles.formInput} ${styles.formInputError}`
                          : styles.formInput
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ancho (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="15"
                      value={currentWidth}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      className={
                        dimensionErrors.some((e) => e.includes('ancho') || e.includes('Ancho'))
                          ? `${styles.formInput} ${styles.formInputError}`
                          : styles.formInput
                      }
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Profundidad (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="15"
                      value={currentDepth}
                      onChange={(e) => handleDimensionChange('depth', e.target.value)}
                      className={
                        dimensionErrors.some((e) => e.includes('profundidad') || e.includes('Profundidad'))
                          ? `${styles.formInput} ${styles.formInputError}`
                          : styles.formInput
                      }
                      required
                    />
                  </div>
                </div>

                {dimensionErrors.length > 0 && (
                  <div className={styles.alert + ' ' + styles.alertError}>
                    <strong>Errores en las dimensiones:</strong>
                    <ul style={{ margin: '10px 0 0 20px' }}>
                      {dimensionErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {requiresDeposit && dimensionErrors.length === 0 && (
                  <div className={styles.depositWarning}>
                    ⚠️ Este producto requiere un depósito de garantía porque excede las
                    dimensiones máximas permitidas (15×15×15 cm).
                    <br />
                    <strong>Depósito requerido:</strong> S/. {currentValue.toFixed(2)}
                  </div>
                )}

                {!requiresDeposit && currentHeight > 0 && currentWidth > 0 && currentDepth > 0 && (
                  <div className={styles.ticketCalculation}>
                    ✓ Este producto no requiere depósito de garantía.
                  </div>
                )}
              </div>

              {/* Estado actual */}
              <div className={styles.raffleFormSection}>
                <h2 className={styles.raffleFormSectionTitle}>Estado actual</h2>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estado</label>
                  <div className={styles.statusBadge} style={{ display: 'inline-block', marginTop: '10px' }}>
                    {product.status}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Requiere depósito</label>
                  <div style={{ marginTop: '10px' }}>
                    {product.requiresDeposit ? '✓ Sí' : '✗ No'}
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.primaryButton} disabled={loading}>
                  {loading ? 'Guardando cambios...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => router.push('/panel/productos')}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDelete}
                  disabled={loading}
                  style={{ marginLeft: 'auto' }}
                >
                  Eliminar producto
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}




