import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ORGANIZER_PAYMENT_DONE || 'template_mgmgrng';

/**
 * POST /api/emails/send-organizer-payment-done
 * Envía al organizador: se procedió con el pago del producto (evidencia subida por admin).
 * Usa EmailJS para el envío.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      organizerName,
      raffleId,
      productName,
      amountPaid,
      paymentEvidenceUrl,
    } = body;

    if (!email || !organizerName || !raffleId || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const dashboardUrl = `${appUrl}/dashboard/store`;
    const amountStr = amountPaid != null ? `S/. ${Number(amountPaid).toFixed(2)}` : '';
    await sendEmail({
      templateId: TEMPLATE_ID,
      templateParams: {
        to_email: email,
        to_name: organizerName,
        subject: `Pago realizado - ${productName}`,
        organizer_name: organizerName,
        product_name: productName,
        raffle_id: raffleId,
        amount_paid: amountStr,
        payment_evidence_url: paymentEvidenceUrl ?? '',
        app_url: appUrl,
        dashboard_url: dashboardUrl,
        action_url: dashboardUrl,
        action_text: 'Ir al panel del organizador',
        message: `Hola ${organizerName}, se ha procedido con el pago del producto de la oportunidad ${productName} (ID: ${raffleId}).${amountStr ? ` Monto pagado: ${amountStr}.` : ''} ${paymentEvidenceUrl ? 'Puedes ver la evidencia de pago en el enlace que te hemos enviado.' : ''}`,
      },
    });

    console.log('✅ Correo organizer payment done enviado a:', email);
    return NextResponse.json({
      success: true,
      message: 'Correo enviado correctamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error sending organizer payment done email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
