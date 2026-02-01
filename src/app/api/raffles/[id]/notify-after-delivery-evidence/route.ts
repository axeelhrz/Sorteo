import { NextRequest, NextResponse } from 'next/server';
import { raffleService } from '@/services/raffle-service';
import { winnerVerificationService } from '@/services/winner-verification-service';

/**
 * POST /api/raffles/[id]/notify-after-delivery-evidence
 * Tras subir evidencia de entrega: envía correo al ganador (evidencia disponible)
 * y al organizador (proceso a la espera de confirmación del ganador).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const raffle = await raffleService.getRaffleById(raffleId);
    const winnerInfo = await winnerVerificationService.getWinnerInfo(raffleId);

    if (!winnerInfo) {
      return NextResponse.json(
        { error: 'No hay información del ganador para este sorteo' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const productName = raffle.product?.name || 'Premio';
    const organizerName = raffle.shop?.name || 'Organizador';
    const organizerEmail = raffle.shop?.publicEmail;

    if (winnerInfo.userEmail) {
      try {
        await fetch(`${baseUrl}/api/emails/send-delivery-evidence-uploaded`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: winnerInfo.userEmail,
            name: winnerInfo.userName || 'Ganador',
            raffleTitle: productName,
            productName,
            organizerName,
            daysToConfirm: 7,
          }),
        });
      } catch (e) {
        console.error('Error sending delivery evidence uploaded to winner:', e);
      }
    }

    if (organizerEmail) {
      try {
        await fetch(`${baseUrl}/api/emails/send-organizer-delivery-awaiting-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: organizerEmail,
            organizerName,
            raffleId,
            productName,
          }),
        });
      } catch (e) {
        console.error('Error sending organizer delivery awaiting confirmation:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error notifying after delivery evidence:', error);
    return NextResponse.json(
      { error: error.message || 'Error al enviar notificaciones' },
      { status: 500 }
    );
  }
}
