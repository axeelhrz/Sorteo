import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentValidationEmail } from '@/lib/emails/send-payment-validation';

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

    await sendPaymentValidationEmail({
      email,
      name,
      ticketQuantity,
      amount,
      paymentMethod,
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