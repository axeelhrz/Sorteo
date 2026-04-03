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

export function penToUsdc(pen: number): number | null {
  const rate = solesPerUsdc();
  if (rate == null) return null;
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
