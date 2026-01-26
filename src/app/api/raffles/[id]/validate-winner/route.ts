import { NextRequest, NextResponse } from 'next/server';
import { winnerVerificationService } from '@/services/winner-verification-service';
import { raffleService } from '@/services/raffle-service';

/**
 * POST /api/raffles/[id]/validate-winner
 * Valida el código único del ganador
 * El organizador ingresa el código para validar al ganador
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const body = await request.json();
    const { verificationCode } = body;

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'El código de verificación es requerido' },
        { status: 400 }
      );
    }

    // Validar el código del ganador
    const result = await winnerVerificationService.validateWinnerCode({
      raffleId,
      verificationCode,
    });

    if (!result.valid) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Si la validación es exitosa, enviar notificación al ganador
    if (result.winnerInfo) {
      try {
        // Obtener información del sorteo y ganador para el email
        const raffle = await raffleService.getRaffleById(raffleId);
        
        // Enviar correo al ganador notificando que su código fue validado
        const emailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/send-winner-code-validated`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: result.winnerInfo.userEmail,
              name: result.winnerInfo.userName,
              raffleId,
              raffleTitle: raffle.product?.name || 'Sorteo',
              productName: raffle.product?.name || 'Premio',
              organizerName: raffle.shop?.name || 'Organizador',
            }),
          }
        );

        if (!emailResponse.ok) {
          console.warn('Error sending winner code validated email:', emailResponse.statusText);
        } else {
          console.log('✅ Winner code validated email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError);
        // No fallar la validación si hay error en el email
      }
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      winnerInfo: result.winnerInfo,
    });
  } catch (error: any) {
    console.error('Error validating winner code:', error);
    return NextResponse.json(
      { error: error.message || 'Error al validar el código del ganador' },
      { status: 500 }
    );
  }
}