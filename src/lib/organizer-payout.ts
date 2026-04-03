/**
 * Calcula el monto que corresponde al organizador por una oportunidad finalizada.
 * Regla: valor del producto + valor del envío (cuando aplica).
 */

import { RaffleStatus, type Raffle } from '@/types/raffle';

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

/**
 * Oportunidad lista para que el admin liquide al organizador (coherente con getClosureStatus del panel admin:
 * pago pendiente = entrega acreditada, sin pago registrado).
 */
export function isOrganizerPayoutEligible(raffle: Raffle): boolean {
  if (raffle.status !== RaffleStatus.FINISHED) return false;
  if (raffle.paymentToOrganizerAt) return false;
  const wi = raffle.winnerInfo;
  return Boolean(wi?.deliveryConfirmedAt || wi?.deliveryEvidence?.photoUrl);
}
