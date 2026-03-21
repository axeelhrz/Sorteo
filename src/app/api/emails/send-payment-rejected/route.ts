import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentRejectedEmail } from '@/lib/emails/send-payment-rejected';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, amount, ticketQuantity, paymentMethod, rejectionReason, paymentId } = body;

    if (!email || !name || amount == null || ticketQuantity == null || !paymentMethod || !rejectionReason || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await sendPaymentRejectedEmail({
      email,
      name,
      amount,
      ticketQuantity,
      paymentMethod,
      rejectionReason,
      paymentId,
    });

    console.log('✅ Correo pago rechazado enviado a:', email);
    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('Error sending payment rejected email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: message },
      { status: 500 }
    );
  }
}
