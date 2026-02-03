import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

/**
 * POST /api/raffles/[id]/resend-winner-email
 * Reenvía el correo de notificación al ganador con su código único.
 * Usa Firebase Admin para leer el sorteo y luego llama a send-winner-notification.
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

    const db = getAdminFirestore();
    const raffleSnap = await db.collection('raffles').doc(raffleId).get();
    if (!raffleSnap.exists) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 });
    }

    const raffleData = raffleSnap.data()!;
    const winnerInfo = raffleData.winnerInfo;
    if (!winnerInfo || !winnerInfo.userEmail) {
      return NextResponse.json(
        { error: 'Este sorteo no tiene ganador con correo registrado' },
        { status: 400 }
      );
    }

    const shopId = raffleData.shopId || '';
    const productId = raffleData.productId || '';
    let productName = 'Premio';
    let productDescription = '';
    let productValue = raffleData.productValue ?? 0;
    let shopName = 'Organizador';
    let shopEmail = '';
    let shopPhone = '';
    let shopSocialMedia: unknown = undefined;

    if (productId) {
      const productSnap = await db.collection('products').doc(productId).get();
      if (productSnap.exists) {
        const p = productSnap.data()!;
        productName = p.name || productName;
        productDescription = p.description || '';
        productValue = p.value ?? productValue;
      }
    }
    if (shopId) {
      const shopSnap = await db.collection('shops').doc(shopId).get();
      if (shopSnap.exists) {
        const s = shopSnap.data()!;
        shopName = s.name || shopName;
        shopEmail = s.publicEmail ?? '';
        shopPhone = s.phone ?? '';
        shopSocialMedia = s.socialMedia;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/emails/send-winner-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: winnerInfo.userEmail,
        name: winnerInfo.userName || 'Ganador',
        raffleId,
        raffleTitle: productName,
        productName,
        productDescription,
        productValue,
        ticketNumber: winnerInfo.ticketNumber,
        verificationCode: winnerInfo.verificationCode,
        shopName,
        shopEmail,
        shopPhone,
        shopSocialMedia,
        winDate: (() => {
          const v = raffleData.raffleExecutedAt;
          if (!v) return new Date().toISOString();
          if (typeof v === 'object' && v !== null && 'toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function') {
            return (v as { toDate: () => Date }).toDate().toISOString();
          }
          return new Date(v as string | number).toISOString();
        })(),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || 'Error al reenviar el correo' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Correo reenviado al ganador correctamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al reenviar el correo';
    console.error('Error resending winner email:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
