import { NextRequest, NextResponse } from 'next/server';
import { sendWinnerNotificationEmail } from '@/lib/emails/send-winner-notification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      raffleId,
      raffleTitle,
      productName,
      productDescription,
      productValue,
      ticketNumber,
      verificationCode,
      shopName,
      shopEmail,
      shopPhone,
      shopSocialMedia,
      winDate,
    } = body;

    if (!email || !name || !raffleId || !productName || !ticketNumber || !verificationCode) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const messageId = await sendWinnerNotificationEmail({
      email,
      name,
      raffleId,
      raffleTitle,
      productName,
      productDescription,
      productValue,
      ticketNumber,
      verificationCode,
      shopName,
      shopEmail,
      shopPhone,
      shopSocialMedia,
      winDate: winDate ?? new Date().toISOString(),
    });

    console.log('✅ Correo ganador enviado exitosamente');
    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo de notificación';
    console.error('Error sending winner notification email:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}