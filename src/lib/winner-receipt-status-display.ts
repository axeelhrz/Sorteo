import type { WinnerInfo } from '@/types/raffle';

export type WinnerReceiptPhase =
  | 'completed'
  | 'pending_confirmation'
  | 'in_progress'
  | 'awaiting_delivery'
  | 'unknown';

export interface WinnerReceiptStatusDisplay {
  phase: WinnerReceiptPhase;
  /** Línea principal del estado (badge / título). */
  title: string;
  /** Texto secundario opcional (plazo, aclaración). */
  subtitle?: string;
  /** Sufijo de clase CSS (ej. `phaseCompleted` → `.deliveryBadge.phaseCompleted`). */
  badgeClass: string;
}

function deadlineSubtitle(winnerInfo: WinnerInfo): string | undefined {
  const raw = winnerInfo.deliveryDeadline;
  if (!raw) return undefined;
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return undefined;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return 'Si no confirmaste a tiempo, puede haberse dado por recibida automáticamente.';
  }
  if (diffDays === 0) {
    return 'Confirma la recepción hoy si ya tienes el premio en tus manos.';
  }
  return `Plazo para confirmar: ${d.toLocaleDateString('es-PE', { dateStyle: 'long' })}.`;
}

/**
 * Estado del premio para el ganador: distingue cierre (confirmed) vs entregado pendiente de confirmar (delivered).
 */
export function getWinnerReceiptStatusDisplay(
  winnerInfo: WinnerInfo | null | undefined
): WinnerReceiptStatusDisplay {
  if (!winnerInfo) {
    return {
      phase: 'unknown',
      title: 'Ganador',
      subtitle: 'Cargando estado del premio…',
      badgeClass: 'phaseUnknown',
    };
  }

  const { deliveryStatus } = winnerInfo;

  if (deliveryStatus === 'confirmed') {
    return {
      phase: 'completed',
      title: 'Premio recibido',
      subtitle: 'Recepción confirmada. Flujo completado.',
      badgeClass: 'phaseCompleted',
    };
  }

  if (deliveryStatus === 'delivered') {
    return {
      phase: 'pending_confirmation',
      title: 'Confirma la recepción',
      subtitle: deadlineSubtitle(winnerInfo),
      badgeClass: 'phasePendingConfirmation',
    };
  }

  if (deliveryStatus === 'contacted' || deliveryStatus === 'in_delivery') {
    return {
      phase: 'in_progress',
      title: 'Entrega en curso',
      subtitle: 'El organizador está gestionando la entrega de tu premio.',
      badgeClass: 'phaseInProgress',
    };
  }

  if (deliveryStatus === 'pending') {
    return {
      phase: 'awaiting_delivery',
      title: 'Coordinación pendiente',
      subtitle:
        'El organizador validará tu código y coordinará la entrega. Te avisaremos cuando haya novedades.',
      badgeClass: 'phaseAwaitingDelivery',
    };
  }

  return {
    phase: 'unknown',
    title: 'Ganador',
    badgeClass: 'phaseUnknown',
  };
}
