import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

function timestampToIso(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

/**
 * POST /api/raffles/[id]/confirm-organizer-payment
 * El dueño de la tienda confirma haber recibido el depósito registrado por el administrador.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    if (!raffleId) {
      return NextResponse.json({ error: 'ID de sorteo requerido' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado. Inicia sesión e intenta de nuevo.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.slice('Bearer '.length).trim();
    if (!idToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const raffleRef = db.collection('raffles').doc(raffleId);
    const raffleSnap = await raffleRef.get();

    if (!raffleSnap.exists) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 });
    }

    const raffleData = raffleSnap.data()!;
    const status = raffleData.status as string | undefined;
    if (status !== 'finished') {
      return NextResponse.json(
        { error: 'Solo puedes confirmar en oportunidades finalizadas' },
        { status: 400 }
      );
    }

    if (!raffleData.paymentToOrganizerAt) {
      return NextResponse.json(
        { error: 'Aún no hay un pago registrado por la plataforma para esta oportunidad' },
        { status: 400 }
      );
    }

    const shopId = (raffleData.shopId as string) || '';
    if (!shopId) {
      return NextResponse.json({ error: 'Sorteo sin tienda asociada' }, { status: 400 });
    }

    const shopSnap = await db.collection('shops').doc(shopId).get();
    if (!shopSnap.exists) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    const shopUserId = String(shopSnap.data()?.userId || '').trim();
    if (!shopUserId || shopUserId !== uid) {
      return NextResponse.json(
        { error: 'No tienes permiso para confirmar pagos de esta oportunidad' },
        { status: 403 }
      );
    }

    const existing = raffleData.organizerPaymentConfirmedAt;
    if (existing) {
      return NextResponse.json({
        idempotent: true,
        message: 'Ya habías confirmado la recepción de este pago.',
        organizerPaymentConfirmedAt: timestampToIso(existing),
        organizerPaymentConfirmedBy:
          typeof raffleData.organizerPaymentConfirmedBy === 'string'
            ? raffleData.organizerPaymentConfirmedBy
            : undefined,
      });
    }

    await raffleRef.update({
      organizerPaymentConfirmedAt: FieldValue.serverTimestamp(),
      organizerPaymentConfirmedBy: uid,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Recepción del pago confirmada correctamente.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('confirm-organizer-payment:', error);
    return NextResponse.json({ error: 'Error al confirmar la recepción', details: message }, { status: 500 });
  }
}
