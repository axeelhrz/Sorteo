import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ticketAssignmentService } from '@/services/ticket-assignment-service';
import { firebaseRaffleWriteService } from '@/services/firebase-raffle-write-service';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { raffleService } from '@/services/raffle-service';

/**
 * POST /api/admin/raffles/[id]/execute
 * Ejecuta la oportunidad: elige ganador aleatorio, guarda código único, envía emails al ganador y al organizador.
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

    const raffleRef = doc(db, 'raffles', raffleId);
    const raffleSnap = await getDoc(raffleRef);
    if (!raffleSnap.exists()) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 });
    }

    const raffleData = raffleSnap.data();
    const status = raffleData.status;
    const soldTickets = raffleData.soldTickets || 0;
    const totalTickets = raffleData.totalTickets || 0;

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

    const tickets = await ticketAssignmentService.getTicketsForRaffle(raffleId);
    if (!tickets.length) {
      return NextResponse.json(
        { error: 'No hay tickets vendidos para este sorteo' },
        { status: 400 }
      );
    }

    const randomIndex = Math.floor(Math.random() * tickets.length);
    const winningTicket = tickets[randomIndex];

    const userRef = doc(db, 'users', winningTicket.userId);
    const userSnap = await getDoc(userRef);
    const userName = userSnap.exists() ? (userSnap.data()?.name ?? userSnap.data()?.email ?? 'Ganador') : 'Ganador';
    const userEmail = userSnap.exists() ? (userSnap.data()?.email ?? '') : '';

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

    await firebaseRaffleWriteService.executeRaffle(raffleId, {
      winnerTicketId: winningTicket.id,
      winnerInfo,
    });

    await ticketAssignmentService.markTicketAsWinner(winningTicket.id);

    const raffle = await raffleService.getRaffleById(raffleId);
    const productName = raffle.product?.name || 'Premio';
    const productDescription = raffle.product?.description || '';
    const productValue = raffle.productValue ?? 0;
    const shopName = raffle.shop?.name || 'Organizador';
    const shopEmail = raffle.shop?.publicEmail || '';
    const shopPhone = raffle.shop?.phone || '';
    const shopSocialMedia = raffle.shop?.socialMedia;

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

    const organizerEmail = shopEmail || raffle.shop?.publicEmail;
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
  } catch (error: any) {
    console.error('Error executing raffle:', error);
    return NextResponse.json(
      { error: error.message || 'Error al ejecutar la oportunidad' },
      { status: 500 }
    );
  }
}
