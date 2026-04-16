/**
 * Conversión de presentación PEN → USDC usando NEXT_PUBLIC_SOLES_PER_USDC
 * (soles por 1 USDC). Los montos en Firestore siguen en soles.
 */

export function solesPerUsdc(): number | null {
  const raw = process.env.NEXT_PUBLIC_SOLES_PER_USDC;
  if (raw == null || String(raw).trim() === '') return null;
  const n = Number(String(raw).trim().replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Tasa a usar para PEN→USDC: la guardada en el sorteo al aprobar, o la del env. */
export function resolveSolesPerUsdc(raffleRate?: number | null): number | null {
  if (raffleRate != null && Number.isFinite(raffleRate) && raffleRate > 0) {
    return raffleRate;
  }
  return solesPerUsdc();
}

/**
 * @param rateOverride Soles por 1 USDC (p. ej. `raffle.solesPerUsdcAtApproval`). Si es válido, se usa en lugar del env.
 */
export function penToUsdc(pen: number, rateOverride?: number | null): number | null {
  const fromOverride =
    rateOverride != null &&
    Number.isFinite(Number(rateOverride)) &&
    Number(rateOverride) > 0
      ? Number(rateOverride)
      : null;
  const rate = fromOverride ?? solesPerUsdc();
  if (rate == null || rate <= 0) return null;
  const v = Number(pen) / rate;
  if (!Number.isFinite(v)) return null;
  return v;
}

export function formatUsdc(value: number): string {
  const s = value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  return `${s} USDC`;
}

/** Texto para columnas admin: unidad en USDC (ticket guardado o conversión desde PEN). */
export type ParticipationUnitAdminDisplay = {
  /** `formatUsdc(...)` o `null` si no hay tasa/USDC disponible */
  usdcFormatted: string | null;
  /** Precio por ticket en soles (referencia) */
  solesTicketLine: string;
};

export function participationUnitAdminDisplay(input: {
  ticketUnitUsdc?: number | null;
  productValue: number;
  solesPerUsdcAtApproval?: number | null;
}): ParticipationUnitAdminDisplay {
  const pen = Number(input.productValue);
  const solesTicketLine = `S/. ${Number.isFinite(pen) ? pen.toFixed(2) : '0.00'}`;

  const rawUnit = input.ticketUnitUsdc;
  if (rawUnit != null && Number.isFinite(Number(rawUnit)) && Number(rawUnit) > 0) {
    return { usdcFormatted: formatUsdc(Number(rawUnit)), solesTicketLine };
  }

  const fromPen = penToUsdc(pen, input.solesPerUsdcAtApproval);
  if (fromPen != null) {
    return { usdcFormatted: formatUsdc(fromPen), solesTicketLine };
  }

  return { usdcFormatted: null, solesTicketLine };
}
