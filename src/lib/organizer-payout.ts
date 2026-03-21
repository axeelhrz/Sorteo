/**
 * Calcula el monto que corresponde al organizador por una oportunidad finalizada.
 * Regla: valor del producto + valor del envío (cuando aplica).
 */

export interface ProductData {
  value?: number;
  deliveryCost?: number;
  hasDelivery?: boolean;
}

/**
 * Retorna el monto que el administrador liquida al organizador por una oportunidad:
 * valor del producto + costo de envío (si hasDelivery).
 */
export function computeOrganizerPayout(product: ProductData | null | undefined): number {
  if (!product) return 0;
  const value = Number(product.value ?? 0);
  const delivery = product.hasDelivery ? Number(product.deliveryCost ?? 0) : 0;
  return value + delivery;
}
