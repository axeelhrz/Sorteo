import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { RaffleStatus } from '@/types/raffle';

interface TicketDoc {
  id: string;
  raffleId: string;
  userId: string;
  ticketNumber: number;
  status: string;
}

/**
 * POST /api/admin/raffles/[id]/execute
 * Ejecuta la oportunidad: elige ganador aleatorio, guarda código único, envía emails al ganador y al organizador.
 * Usa Firebase Admin SDK para evitar errores de permisos en el servidor.
 */
export async function POST(
  _request: NextRequest,
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
    const status = raffleData.status;
    const soldTickets = raffleData.soldTickets || 0;
    const totalTickets = raffleData.totalTickets || 0;
    const shopId = raffleData.shopId || '';
    const productId = raffleData.productId || '';

    if (status !== 'active') {
      return NextResponse.json(
        { error: 'Solo se puede ejecutar un sorteo activo' },
        { status: 400 }
      );
    }

    if (soldTickets < totalTickets) {
      return NextResponse.json(
        { error: 'Se debe completar el mínimo de tickets vendidos (todos) para ejecutar' },
        { status: 400 }
      );
    }

    const ticketsSnap = await db
      .collection('tickets')
      .where('raffleId', '==', raffleId)
      .where('status', '==', 'active')
      .get();

    const tickets: TicketDoc[] = ticketsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        raffleId: data.raffleId,
        userId: data.userId,
        ticketNumber: data.ticketNumber,
        status: data.status || 'active',
      };
    });

    if (!tickets.length) {
      return NextResponse.json(
        { error: 'No hay tickets vendidos para este sorteo' },
        { status: 400 }
      );
    }

    const randomIndex = Math.floor(Math.random() * tickets.length);
    const winningTicket = tickets[randomIndex];

    const userSnap = await db.collection('users').doc(winningTicket.userId).get();
    const userData = userSnap.exists ? userSnap.data() : null;
    const userName = userData?.name ?? userData?.email ?? 'Ganador';
    const userEmail = userData?.email ?? '';

    const verificationCode = winnerVerificationService.generateVerificationCode();

    const winnerInfo = {
      userId: winningTicket.userId,
      userName,
      userEmail,
      ticketId: winningTicket.id,
      ticketNumber: winningTicket.ticketNumber,
      verificationCode,
      notifiedAt: new Date(),
      deliveryStatus: 'pending' as const,
    };

    await db.collection('raffles').doc(raffleId).update({
      winnerTicketId: winningTicket.id,
      winnerInfo,
      status: RaffleStatus.FINISHED,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      raffleExecutedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('tickets').doc(winningTicket.id).update({
      status: 'winner',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    let productName = 'Premio';
    let productDescription = '';
    let productValue = raffleData.productValue ?? 0;
    let shopName = 'Organizador';
    let shopEmail = '';

    if (productId) {
      const productSnap = await db.collection('products').doc(productId).get();
      if (productSnap.exists) {
        const p = productSnap.data()!;
        productName = p.name || productName;
        productDescription = p.description || '';
        productValue = p.value ?? productValue;
      }
    }
    let shopPhone = '';
    let shopSocialMedia: unknown = undefined;
    if (shopId) {
      const shopSnap = await db.collection('shops').doc(shopId).get();
      if (shopSnap.exists) {
        const s = shopSnap.data()!;
        shopName = s.name || shopName;
        shopEmail = s.publicEmail ?? shopEmail;
        shopPhone = s.phone ?? '';
        shopSocialMedia = s.socialMedia;
      }
    }

    if (userEmail) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send-winner-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            name: userName,
            raffleId,
            raffleTitle: productName,
            productName,
            productDescription,
            productValue,
            ticketNumber: winningTicket.ticketNumber,
            verificationCode,
            shopName,
            shopEmail,
            shopPhone,
            shopSocialMedia,
            winDate: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error('Error sending winner notification email:', e);
      }
    }

    const organizerEmail = shopEmail;
    if (organizerEmail) {
      try {
        const amountOrganizer = productValue * soldTickets;
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send-organizer-raffle-finished`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: organizerEmail,
            organizerName: shopName,
            raffleId,
            productName,
            winningTicketNumber: winningTicket.ticketNumber,
            winnerUserName: userName,
            amountToReceive: amountOrganizer,
            verificationCode,
          }),
        });
      } catch (e) {
        console.error('Error sending organizer raffle finished email:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Oportunidad ejecutada. Ganador elegido y correos enviados.',
      winnerTicketId: winningTicket.id,
      winnerTicketNumber: winningTicket.ticketNumber,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al ejecutar la oportunidad';
    console.error('Error executing raffle:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
