'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';
import { Shop } from '@/types/shop';
import { CreateProductDto } from '@/types/product';
import { shopService } from '@/services/shop-service';
import { productService } from '@/services/product-service';
import { uploadService } from '@/services/upload-service';
import { ShopHeader } from '@/components/ShopPanel/ShopHeader';
import { ShopSidebar } from '@/components/ShopPanel/ShopSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import styles from '@/app/panel/panel.module.css';

export default function CreateProductPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProductDto>({
    shopId: '',
    name: '',
    description: '',
    value: 0,
    height: 0,
    width: 0,
    depth: 0,
    category: '',
    mainImage: '',
  });
  const [dimensionErrors, setDimensionErrors] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadShop();
    }
  }, [isAuthenticated, user]);

  const loadShop = async () => {
    setLoadingShop(true);
    try {
      // Buscar tienda por userId en Firestore
      if (!user?.id) {
        setError('Usuario no autenticado');
        return;
      }

      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const shopsRef = collection(db, 'shops');
      const q = query(shopsRef, where('userId', '==', user.id));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const shopDoc = snapshot.docs[0];
        const shopData = shopDoc.data();
        const shop: Shop = {
          id: shopDoc.id,
          userId: shopData.userId || user.id,
          name: shopData.name || '',
          description: shopData.description,
          logo: shopData.logo,
          publicEmail: shopData.publicEmail,
          phone: shopData.phone,
          socialMedia: shopData.socialMedia,
          status: shopData.status || 'pending',
          createdAt: shopData.createdAt?.toDate() || new Date(),
          updatedAt: shopData.updatedAt?.toDate() || new Date(),
        };
        
        setShop(shop);
        setFormData((prev) => ({ ...prev, shopId: shop.id }));
      } else {
        setError('No se encontró tu tienda');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la tienda');
    } finally {
      setLoadingShop(false);
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
    const height = field === 'height' ? numValue : formData.height;
    const width = field === 'width' ? numValue : formData.width;
    const depth = field === 'depth' ? numValue : formData.depth;

    const errors = validateDimensions(height, width, depth);
    setDimensionErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar dimensiones antes de enviar
    const errors = validateDimensions(formData.height, formData.width, formData.depth);
    if (errors.length > 0) {
      setDimensionErrors(errors);
      setError('Por favor corrige los errores en las dimensiones');
      return;
    }

    if (!formData.name || !formData.description || formData.value <= 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      await productService.createProduct(formData);
      router.push('/panel/productos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  const requiresDeposit =
    formData.height > 15 || formData.width > 15 || formData.depth > 15;

  return (
    <ProtectedRoute requiredRole={UserRole.SHOP}>
      <div className={styles.panelContainer}>
        <ShopSidebar isBlocked={shop?.status === 'blocked'} />
        <main className={styles.mainContent}>
          {loadingShop && <div className={styles.alert}>Cargando tienda...</div>}
          {error && !loadingShop && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error}
              <button onClick={loadShop} className={styles.primaryButton} style={{ marginLeft: '10px' }}>
                Reintentar
              </button>
            </div>
          )}
          {shop && (
            <>
              <ShopHeader shop={shop} />
              <div className={styles.raffleDetail}>
                <h1 className={styles.raffleDetailTitle}>Crear nuevo producto</h1>

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
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className={styles.formInput}
                        required
                        placeholder="Ej: iPhone 15 Pro Max"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Descripción <span style={{ color: 'red' }}>*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className={styles.formTextarea}
                        required
                        rows={4}
                        placeholder="Describe el producto en detalle..."
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
                        value={formData.value || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))
                        }
                        className={styles.formInput}
                        required
                        placeholder="0.00"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Categoría (opcional)</label>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className={styles.formInput}
                        placeholder="Ej: Electrónica, Ropa, Hogar..."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Imagen Principal (opcional)</label>
                      <div style={{ marginBottom: '10px' }}>
                        <input
                          type="file"
                          id="productImageFile"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Validar tipo de archivo
                            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
                            if (!allowedTypes.includes(file.type)) {
                              setError('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)');
                              return;
                            }

                            // Validar tamaño (máximo 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              setError('El archivo es demasiado grande. Máximo permitido: 5MB');
                              return;
                            }

                            setError(null);

                            // Subir imagen automáticamente
                            setUploadingImage(true);
                            try {
                              const fileUrl = await uploadService.uploadProductImage(file);
                              const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${fileUrl}`;
                              setFormData((prev) => ({ ...prev, mainImage: fullUrl }));
                            } catch (err: any) {
                              setError(err.response?.data?.message || 'Error al subir la imagen');
                            } finally {
                              setUploadingImage(false);
                            }
                          }}
                          className={styles.formInput}
                          style={{ marginBottom: '10px' }}
                          disabled={uploadingImage}
                        />
                        {uploadingImage && (
                          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Subiendo imagen...
                          </p>
                        )}
                        {formData.mainImage && !uploadingImage && (
                          <div style={{ marginTop: '10px' }}>
                            <img
                              src={formData.mainImage}
                              alt="Preview"
                              style={{
                                maxWidth: '200px',
                                maxHeight: '200px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
                        O ingresa una URL de imagen:
                      </small>
                      <input
                        type="url"
                        value={formData.mainImage || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, mainImage: e.target.value }))
                        }
                        className={styles.formInput}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        style={{ marginTop: '5px' }}
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
                          value={formData.height || ''}
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
                          value={formData.width || ''}
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
                          value={formData.depth || ''}
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
                        <strong>Depósito requerido:</strong> S/. {formData.value.toFixed(2)}
                      </div>
                    )}

                    {!requiresDeposit && formData.height > 0 && formData.width > 0 && formData.depth > 0 && (
                      <div className={styles.ticketCalculation}>
                        ✓ Este producto no requiere depósito de garantía.
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.primaryButton} disabled={loading}>
                      {loading ? 'Creando producto...' : 'Crear producto'}
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => router.push('/panel/productos')}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

