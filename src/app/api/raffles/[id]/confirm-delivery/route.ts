import { NextRequest, NextResponse } from 'next/server';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { raffleService } from '@/services/raffle-service';

/**
 * POST /api/raffles/[id]/confirm-delivery
 * Confirma la recepción del premio por parte del ganador
 * El ganador confirma que ha recibido el premio correctamente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const body = await request.json();
    const { confirmed, feedback, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'El ID del usuario es requerido' },
        { status: 400 }
      );
    }

    if (confirmed !== true) {
      return NextResponse.json(
        { error: 'Debes confirmar la recepción del premio' },
        { status: 400 }
      );
    }

    // Confirmar la entrega
    const winnerInfo = await winnerVerificationService.confirmDelivery(
      {
        raffleId,
        confirmed: true,
        feedback,
      },
      userId
    );

    // Enviar notificación de confirmación al organizador
    try {
      // Obtener información del sorteo para el email
      const raffle = await raffleService.getRaffleById(raffleId);
      
      // Enviar correo al organizador notificando que el ganador confirmó
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send-delivery-confirmed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: raffle.shop?.publicEmail || 'noreply@tiketea.com',
            name: raffle.shop?.name || 'Organizador',
            raffleTitle: raffle.product?.name || 'Sorteo',
            productName: raffle.product?.name || 'Premio',
            winnerName: winnerInfo.userName || 'Ganador',
          }),
        }
      );

      if (!emailResponse.ok) {
        console.warn('Error sending delivery confirmed email:', emailResponse.statusText);
      } else {
        console.log('✅ Delivery confirmed email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // No fallar la confirmación si hay error en el email
    }

    return NextResponse.json({
      success: true,
      message: 'Recepción confirmada exitosamente',
      winnerInfo,
    });
  } catch (error: any) {
    console.error('Error confirming delivery:', error);
    return NextResponse.json(
      { error: error.message || 'Error al confirmar la recepción' },
      { status: 500 }
    );
  }
}