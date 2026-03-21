import { NextRequest, NextResponse } from 'next/server';
import { sendWinnerCodeValidatedEmail } from '@/lib/emails/send-winner-code-validated';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, raffleTitle, productName, organizerName } = body;

    if (!email || !name || !raffleTitle || !productName || !organizerName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const messageId = await sendWinnerCodeValidatedEmail({
      email,
      name,
      raffleTitle,
      productName,
      organizerName,
    });

    console.log('✅ Correo de código validado enviado a:', email);
    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error al enviar correo de código validado:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
