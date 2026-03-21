import { NextRequest, NextResponse } from 'next/server';
import { sendDeliveryReminderEmail } from '@/lib/emails/send-delivery-reminder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, raffleTitle, productName, daysRemaining } = body;

    if (!email || !name || !raffleTitle || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const messageId = await sendDeliveryReminderEmail({
      email,
      name,
      raffleTitle,
      productName,
      daysRemaining,
    });

    console.log('✅ Correo de recordatorio enviado a:', email);
    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error al enviar correo de recordatorio:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
