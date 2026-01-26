import { NextRequest, NextResponse } from 'next/server';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_sovfqju';
const EMAILJS_TEMPLATE_ID = 'template_mgmgrng';
const EMAILJS_PUBLIC_KEY = 'wp08DHZOgU6CgICb1';

/**
 * POST /api/emails/send-delivery-confirmed
 * Envía correo al organizador cuando el ganador confirma la recepción
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      raffleTitle,
      productName,
      winnerName,
    } = body;

    // Validar campos requeridos
    if (!email || !name || !raffleTitle || !productName || !winnerName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Preparar parámetros para EmailJS
    const templateParams = {
      to_email: email,
      to_name: name,
      subject: `✅ Entrega confirmada - ${raffleTitle}`,
      raffle_title: raffleTitle,
      product_name: productName,
      winner_name: winnerName,
      message: `¡Excelente! ${winnerName} ha confirmado la recepción de su premio. 
                El proceso de entrega para el sorteo "${raffleTitle}" ha sido completado exitosamente.`,
      action_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/panel/sorteos`,
      action_text: 'Ver mis sorteos',
    };

    // Enviar correo usando EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Correo de entrega confirmada enviado:', response);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId: response.text,
    });
  } catch (error: any) {
    console.error('❌ Error al enviar correo de entrega confirmada:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo' },
      { status: 500 }
    );
  }
}