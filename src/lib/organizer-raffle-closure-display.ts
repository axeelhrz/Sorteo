import type { Raffle } from '@/types/raffle';
import { RaffleStatus } from '@/types/raffle';

/**
 * Fases de cierre alineadas con el admin (`getClosureStatus` en finished/page):
 * finalizado → paymentToOrganizerAt + confirmación del organizador; pago_pendiente → entrega acreditada; ejecutado → resto.
 */
export type OrganizerClosureTone =
  | 'closed'
  | 'awaiting_payment'
  | 'action_required'
  | 'waiting_external'
  | 'in_progress';

export interface OrganizerClosureDisplay {
  headline: string;
  detail?: string;
  tone: OrganizerClosureTone;
}

export function getOrganizerClosureDisplay(raffle: Raffle): OrganizerClosureDisplay | null {
  if (raffle.status !== RaffleStatus.FINISHED) {
    return null;
  }

  if (raffle.paymentToOrganizerAt) {
    if (!raffle.organizerPaymentConfirmedAt) {
      return {
        headline: 'Pago registrado',
        detail:
          'Confirma en Ganancias que recibiste el depósito cuando corresponda. Puedes ver la evidencia en el historial de depósitos.',
        tone: 'action_required',
      };
    }
    return {
      headline: 'Cobro registrado',
      detail: 'El cierre administrativo de esta oportunidad está completo.',
      tone: 'closed',
    };
  }

  const wi = raffle.winnerInfo;
  const deliveryDone = Boolean(wi?.deliveryConfirmedAt || wi?.deliveryEvidence?.photoUrl);
  if (deliveryDone) {
    return {
      headline: 'Pendiente de cobro',
      detail: 'La plataforma registrará tu pago cuando corresponda.',
      tone: 'awaiting_payment',
    };
  }

  if (!wi || !raffle.winnerTicketId) {
    return {
      headline: 'En proceso post-sorteo',
      detail: 'Abre el detalle para revisar los siguientes pasos.',
      tone: 'action_required',
    };
  }

  if (wi.deliveryStatus === 'pending' && !wi.claimedAt) {
    return {
      headline: 'Pendiente: validar código del ganador',
      tone: 'action_required',
    };
  }

  if (
    (wi.deliveryStatus === 'contacted' || wi.deliveryStatus === 'in_delivery') &&
    !wi.deliveryEvidence
  ) {
    return {
      headline: 'Pendiente: subir evidencia de entrega',
      tone: 'action_required',
    };
  }

  if (wi.deliveryStatus === 'delivered') {
    return {
      headline: 'Esperando confirmación del ganador',
      tone: 'waiting_external',
    };
  }

  return {
    headline: 'En proceso post-sorteo',
    tone: 'in_progress',
  };
}
