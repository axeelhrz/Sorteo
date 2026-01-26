import { NextRequest, NextResponse } from 'next/server';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_sovfqju';
const EMAILJS_TEMPLATE_ID = 'template_mgmgrng';
const EMAILJS_PUBLIC_KEY = 'wp08DHZOgU6CgICb1';

/**
 * POST /api/emails/send-delivery-reminder
 * Envía correo de recordatorio al ganador si faltan 2 días para expirar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      raffleTitle,
      productName,
      daysRemaining,
    } = body;

    // Validar campos requeridos
    if (!email || !name || !raffleTitle || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Preparar parámetros para EmailJS
    const templateParams = {
      to_email: email,
      to_name: name,
      subject: `⏰ RECORDATORIO: Confirma la recepción de tu premio - ${raffleTitle}`,
      raffle_title: raffleTitle,
      product_name: productName,
      days_remaining: daysRemaining || 2,
      message: `¡RECORDATORIO IMPORTANTE! Te quedan ${daysRemaining || 2} días para confirmar la recepción de tu premio. 
                Si no confirmas en ese plazo, se dará por confirmada automáticamente. 
                No olvides confirmar tu recepción en nuestra plataforma.`,
      action_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user-panel/won-raffles`,
      action_text: 'Confirmar recepción ahora',
      urgency: 'high',
    };

    // Enviar correo usando EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Correo de recordatorio enviado:', response);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId: response.text,
    });
  } catch (error: any) {
    console.error('❌ Error al enviar correo de recordatorio:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo' },
      { status: 500 }
    );
  }
}