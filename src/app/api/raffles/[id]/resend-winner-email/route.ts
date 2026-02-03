import { NextRequest, NextResponse } from 'next/server';
import { sendWinnerNotificationEmail } from '@/lib/emails/send-winner-notification';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

/**
 * POST /api/raffles/[id]/resend-winner-email
 * Reenvía el correo de notificación al ganador con su código único.
 * Usa Firebase Admin para leer el sorteo y luego llama a send-winner-notification.
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
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
    const winnerInfo = raffleData.winnerInfo as Record<string, unknown> | undefined;
    if (!winnerInfo) {
      return NextResponse.json(
        { error: 'Este sorteo no tiene ganador registrado' },
        { status: 400 }
      );
    }

    // 1) Obtener userId (uid) del ticket ganador. Los tickets guardan userId = uid del comprador (ej. sr3zRicrZrUoSa190BLZEo2IeRY2).
    let winnerUserId = '';
    const rawWinnerTicketId = raffleData.winnerTicketId;
    const winnerTicketId = typeof rawWinnerTicketId === 'string'
      ? rawWinnerTicketId
      : (rawWinnerTicketId && typeof rawWinnerTicketId === 'object' && 'id' in rawWinnerTicketId)
        ? (rawWinnerTicketId as { id: string }).id
        : '';
    if (winnerTicketId) {
      const ticketSnap = await db.collection('tickets').doc(winnerTicketId).get();
      if (ticketSnap.exists) {
        const ticketData = ticketSnap.data() as Record<string, unknown> | undefined;
        const rawUserId = ticketData?.userId ?? ticketData?.user_id;
        // En Firestore userId puede ser string o DocumentReference (reference tiene .id = uid)
        if (typeof rawUserId === 'string' && rawUserId.trim()) {
          winnerUserId = rawUserId.trim();
        } else if (rawUserId && typeof rawUserId === 'object' && 'id' in rawUserId) {
          winnerUserId = String((rawUserId as { id: string }).id);
        }
      }
    }
    if (!winnerUserId) {
      const raw = winnerInfo.userId ?? winnerInfo.user_id;
      winnerUserId = typeof raw === 'string' ? raw : (raw && typeof raw === 'object' && 'id' in raw ? String((raw as { id: string }).id) : '');
    }

    // 2) Email y nombre: prioridad Firebase Auth (correo con el que se registró), luego winnerInfo, luego users/{uid}
    let winnerEmail = String(winnerInfo.userEmail ?? winnerInfo.user_email ?? winnerInfo.email ?? '').trim();
    let winnerName = String(winnerInfo.userName ?? winnerInfo.user_name ?? winnerInfo.name ?? 'Ganador').trim() || 'Ganador';

    if (winnerUserId && winnerUserId.trim().length > 0) {
      try {
        const auth = getAdminAuth();
        const userRecord = await auth.getUser(winnerUserId.trim());
        if (userRecord.email) winnerEmail = userRecord.email;
        if ((!winnerName || winnerName === 'Ganador') && userRecord.displayName) winnerName = userRecord.displayName;
      } catch (authErr) {
        console.warn('Resend winner email: Auth getUser failed for uid', winnerUserId, authErr);
      }
    }

    if (!winnerEmail && winnerUserId) {
      const userSnap = await db.collection('users').doc(winnerUserId).get();
      if (userSnap.exists) {
        const raw = userSnap.data();
        if (raw && typeof raw === 'object') {
          const obj = raw as Record<string, unknown>;
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value !== 'string') continue;
            if (key.toLowerCase().includes('email') || key.toLowerCase().includes('mail')) {
              if (value.includes('@')) {
                winnerEmail = value;
                break;
              }
            }
          }
          if (!winnerName || winnerName === 'Ganador') {
            const nameVal = obj.name ?? obj.displayName ?? obj.userName ?? obj.email;
            if (typeof nameVal === 'string' && nameVal) winnerName = nameVal;
          }
        }
      }
    }

    if (!winnerEmail) {
      return NextResponse.json(
        { error: 'No se encontró correo del ganador. El usuario puede no tener email en su cuenta.' },
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

    const winDate = (() => {
      const v = raffleData.raffleExecutedAt;
      if (!v) return new Date().toISOString();
      if (typeof v === 'object' && v !== null && 'toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function') {
        return (v as { toDate: () => Date }).toDate().toISOString();
      }
      return new Date(v as string | number).toISOString();
    })();

    await sendWinnerNotificationEmail({
      email: winnerEmail,
      name: winnerName,
      raffleId,
      raffleTitle: productName,
      productName,
      productDescription,
      productValue: Number(productValue) || 0,
      ticketNumber: (winnerInfo.ticketNumber ?? winnerInfo.ticket_number ?? 0) as number,
      verificationCode: (winnerInfo.verificationCode ?? winnerInfo.verification_code ?? '') as string,
      shopName,
      shopEmail,
      shopPhone,
      shopSocialMedia,
      winDate,
    });

    return NextResponse.json({
      success: true,
      message: 'Correo reenviado al ganador correctamente',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Error al reenviar el correo';
    console.error('Error resending winner email:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
