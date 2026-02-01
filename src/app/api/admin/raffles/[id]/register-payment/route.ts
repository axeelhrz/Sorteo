import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { firebaseRaffleWriteService } from '@/services/firebase-raffle-write-service';
import { raffleService } from '@/services/raffle-service';

/**
 * POST /api/admin/raffles/[id]/register-payment
 * Registra el pago al organizador: actualiza el sorteo con evidencia y envía email al organizador.
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

    const body = await request.json().catch(() => ({}));
    const { paymentEvidenceUrl } = body;
    if (!paymentEvidenceUrl || typeof paymentEvidenceUrl !== 'string') {
      return NextResponse.json(
        { error: 'paymentEvidenceUrl es requerido' },
        { status: 400 }
      );
    }

    const raffleRef = doc(db, 'raffles', raffleId);
    const raffleSnap = await getDoc(raffleRef);
    if (!raffleSnap.exists()) {
      return NextResponse.json({ error: 'Sorteo no encontrado' }, { status: 404 });
    }

    const raffleData = raffleSnap.data();
    const status = raffleData.status;
    if (status !== 'finished') {
      return NextResponse.json(
        { error: 'Solo se puede registrar pago en sorteos finalizados' },
        { status: 400 }
      );
    }

    if (raffleData.paymentToOrganizerAt) {
      return NextResponse.json(
        { error: 'El pago al organizador ya fue registrado para esta oportunidad' },
        { status: 400 }
      );
    }

    await firebaseRaffleWriteService.registerPaymentToOrganizer(raffleId, {
      paymentEvidenceUrl,
    });

    const raffle = await raffleService.getRaffleById(raffleId);
    const productName = raffle.product?.name || 'Premio';
    const shopName = raffle.shop?.name || 'Organizador';
    const organizerEmail = raffle.shop?.publicEmail;
    const soldTickets = raffle.soldTickets || 0;
    const productValue = raffle.productValue ?? 0;
    const amountPaid = productValue * soldTickets;

    if (organizerEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${baseUrl}/api/emails/send-organizer-payment-done`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: organizerEmail,
            organizerName: shopName,
            raffleId,
            productName,
            amountPaid,
            paymentEvidenceUrl,
          }),
        });
      } catch (e) {
        console.error('Error sending organizer payment done email:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pago al organizador registrado y correo enviado.',
    });
  } catch (error: any) {
    console.error('Error registering payment to organizer:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar el pago' },
      { status: 500 }
    );
  }
}
