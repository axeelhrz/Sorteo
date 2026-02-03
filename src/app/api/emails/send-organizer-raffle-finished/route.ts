import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailjs-server';

const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ORGANIZER_RAFFLE_FINISHED || 'template_mgmgrng';

/**
 * POST /api/emails/send-organizer-raffle-finished
 * Envía al organizador: la oportunidad finalizó, ticket ganador, nombre del ganador,
 * monto que recibirá al finalizar el proceso, y recordatorio del código único verificable en web.
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
      winningTicketNumber,
      winnerUserName,
      amountToReceive,
      verificationCode,
    } = body;

    if (!email || !organizerName || !raffleId || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const dashboardUrl = `${appUrl}/dashboard/store`;
    const amountStr = `S/. ${Number(amountToReceive ?? 0).toFixed(2)}`;
    await sendEmail({
      templateId: TEMPLATE_ID,
      templateParams: {
        to_email: email,
        to_name: organizerName,
        subject: `Oportunidad finalizada - ${productName}`,
        organizer_name: organizerName,
        product_name: productName,
        raffle_id: raffleId,
        winning_ticket_number: String(winningTicketNumber ?? '—'),
        winner_user_name: winnerUserName ?? '—',
        amount_to_receive: amountStr,
        verification_code: verificationCode ?? '',
        app_url: appUrl,
        dashboard_url: dashboardUrl,
        action_url: dashboardUrl,
        action_text: 'Ir al panel del organizador',
        message: `Hola ${organizerName}, la oportunidad ${productName} (ID: ${raffleId}) ha finalizado. Ticket ganador: #${winningTicketNumber ?? '—'}. Nombre del ganador: ${winnerUserName ?? '—'}. Monto que recibirás al finalizar el proceso: ${amountStr}. El ganador te contactará con un código único; valídalo en el panel del organizador.`,
      },
    });

    console.log('✅ Correo organizer raffle finished enviado a:', email);
    return NextResponse.json({
      success: true,
      message: 'Correo enviado correctamente',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error sending organizer raffle finished email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
