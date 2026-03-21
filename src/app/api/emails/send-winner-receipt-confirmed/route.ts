import { NextRequest, NextResponse } from 'next/server';
import { sendWinnerReceiptConfirmedEmail } from '@/lib/emails/send-winner-receipt-confirmed';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, raffleTitle, productName } = body;

    if (!email || !name || !raffleTitle || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await sendWinnerReceiptConfirmedEmail({
      email,
      name,
      raffleTitle,
      productName,
    });

    console.log('✅ Correo premio recibido enviado a:', email);
    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error sending winner receipt confirmed:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
