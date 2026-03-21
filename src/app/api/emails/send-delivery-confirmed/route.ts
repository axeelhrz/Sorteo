import { NextRequest, NextResponse } from 'next/server';
import { sendDeliveryConfirmedEmail } from '@/lib/emails/send-delivery-confirmed';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, raffleTitle, productName, winnerName } = body;

    if (!email || !name || !raffleTitle || !productName || !winnerName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const messageId = await sendDeliveryConfirmedEmail({
      email,
      name,
      raffleTitle,
      productName,
      winnerName,
    });

    console.log('✅ Correo de entrega confirmada enviado a:', email);
    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error al enviar correo de entrega confirmada:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
