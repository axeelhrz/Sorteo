import { NextRequest, NextResponse } from 'next/server';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_sovfqju';
const EMAILJS_TEMPLATE_ID = 'template_mgmgrng';
const EMAILJS_PUBLIC_KEY = 'wp08DHZOgU6CgICb1';

/**
 * POST /api/emails/send-winner-code-validated
 * Envía correo al ganador cuando su código es validado por el organizador
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      raffleId,
      raffleTitle,
      productName,
      organizerName,
    } = body;

    // Validar campos requeridos
    if (!email || !name || !raffleTitle || !productName || !organizerName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Preparar parámetros para EmailJS
    const templateParams = {
      to_email: email,
      to_name: name,
      subject: `✅ Tu código ha sido validado - ${raffleTitle}`,
      raffle_title: raffleTitle,
      product_name: productName,
      organizer_name: organizerName,
      message: `Tu código de ganador ha sido validado exitosamente por ${organizerName}. 
                El organizador está preparando la entrega de tu premio. 
                Pronto recibirás la evidencia de entrega en tu panel.`,
      action_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user-panel/won-raffles`,
      action_text: 'Ver mis sorteos ganados',
    };

    // Enviar correo usando EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Correo de código validado enviado:', response);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId: response.text,
    });
  } catch (error: any) {
    console.error('❌ Error al enviar correo de código validado:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo' },
      { status: 500 }
    );
  }
}