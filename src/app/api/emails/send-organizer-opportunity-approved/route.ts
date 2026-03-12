import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ORGANIZER_OPPORTUNITY_APPROVED || 'template_mgmgrng';

/**
 * POST /api/emails/send-organizer-opportunity-approved
 * Envía al organizador un correo indicando que su oportunidad fue aprobada.
 * Usa EmailJS para el envío.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, organizerName, productName, raffleId } = body;

    if (!email || !organizerName || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, organizerName, productName' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const message =
      `Hola ${organizerName},\n\n` +
      `Tu oportunidad para el producto "${productName}" ha sido aprobada. ` +
      `Ya está activa y los usuarios pueden participar.\n\n` +
      `Puedes gestionarla desde tu panel del organizador.\n\n` +
      `Gracias por usar TIKETEA,\nEquipo TIKETEA`;

    await sendEmail({
      templateId: TEMPLATE_ID,
      templateParams: {
        to_email: email,
        to_name: organizerName,
        subject: `Oportunidad aprobada - ${productName}`,
        message,
        organizer_name: organizerName,
        product_name: productName,
        raffle_id: raffleId || '',
        action_url: `${appUrl}/dashboard/store`,
      },
    });

    console.log('✅ Correo opportunity approved enviado a:', email, 'product:', productName);
    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error sending organizer opportunity approved email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
