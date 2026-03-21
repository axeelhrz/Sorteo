import { NextRequest, NextResponse } from 'next/server';
import { sendOrganizerDeliveryAwaitingEmail } from '@/lib/emails/send-organizer-delivery-awaiting';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, organizerName, raffleId, productName } = body;

    if (!email || !organizerName || !raffleId || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await sendOrganizerDeliveryAwaitingEmail({
      email,
      organizerName,
      raffleId,
      productName,
    });

    console.log('✅ Correo organizador esperando confirmación enviado a:', email);
    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error sending organizer delivery awaiting confirmation:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
