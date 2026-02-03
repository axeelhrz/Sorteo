import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_WINNER_NOTIFICATION || 'template_winner_notification';

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

    const formattedDate = new Date(winDate).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const raffleUrl = `${appUrl}/sorteos/${raffleId}/winner`;

    const messageId = await sendEmail({
      templateId: TEMPLATE_ID,
      templateParams: {
        to_email: email,
        to_name: name,
        raffle_title: raffleTitle || productName,
        product_name: productName,
        product_description: productDescription || 'Premio del sorteo',
        product_value: `S/. ${Number(productValue).toFixed(2)}`,
        ticket_number: String(ticketNumber),
        verification_code: verificationCode,
        shop_name: shopName ?? '',
        shop_email: shopEmail || 'No proporcionado',
        shop_phone: shopPhone || 'No proporcionado',
        shop_social_media: typeof shopSocialMedia === 'string' ? shopSocialMedia : (shopSocialMedia ? JSON.stringify(shopSocialMedia) : 'No proporcionado'),
        win_date: formattedDate,
        raffle_url: raffleUrl,
      },
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