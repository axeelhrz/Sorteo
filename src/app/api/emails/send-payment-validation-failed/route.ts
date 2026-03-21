import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentValidationFailedEmail } from '@/lib/emails/send-payment-validation-failed';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, ticketQuantity, amount, paymentMethod, reason, paymentId } = body;

    if (!email || !name || ticketQuantity == null || amount == null || !paymentMethod || !reason || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await sendPaymentValidationFailedEmail({
      email,
      name,
      ticketQuantity,
      amount,
      paymentMethod,
      reason,
      paymentId,
    });

    console.log('✅ Correo validación fallida enviado a:', email);
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('Error sending payment validation failed email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: message },
      { status: 500 }
    );
  }
}
