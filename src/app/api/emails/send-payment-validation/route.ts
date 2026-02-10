import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_PAYMENT_VALIDATION || process.env.EMAILJS_TEMPLATE_ORGANIZER_PAYMENT_DONE || 'template_mgmgrng';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, ticketQuantity, amount, paymentMethod } = body;

    if (!email || !name || ticketQuantity == null || amount == null || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const messageBody = `Hola ${name},\n\nTu participación se ha registrado y está siendo validada por nuestro equipo.\n\nDetalles de tu participación:\n• Cantidad de tickets: ${ticketQuantity}\n• Monto: S/ ${Number(amount).toFixed(2)}\n• Método de pago: ${paymentMethod}\n\nEl proceso de validación puede tomar hasta 24 horas. Te enviaremos un correo de confirmación una vez que tu participación sea aprobada.\n\n✓ Tu participación ha sido registrada correctamente.\n\nGracias por participar,\nEquipo TIKETEA`;

    await sendEmail({
      templateId: TEMPLATE_ID,
      templateParams: {
        to_email: email,
        to_name: name,
        subject: 'Participación en proceso de revisión - TIKETEA',
        message: messageBody,
        organizer_name: name,
        product_name: 'Participación registrada',
        amount_paid: `S/ ${Number(amount).toFixed(2)}`,
      },
    });

    console.log('✅ Correo de participación registrada enviado a:', email);
    return NextResponse.json({ 
      success: true,
      message: 'Correo enviado correctamente',
    });

  } catch (error: any) {
    console.error('Error sending payment validation email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}