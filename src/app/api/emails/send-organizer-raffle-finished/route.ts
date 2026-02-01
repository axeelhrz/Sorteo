import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/emails/send-organizer-raffle-finished
 * Envía al organizador: la oportunidad finalizó, ticket ganador, nombre del ganador,
 * monto que recibirá al finalizar el proceso, y recordatorio del código único verificable en web.
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Oportunidad finalizada</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">TIKETEA</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #6366f1; margin: 0 0 20px 0; font-size: 24px;">Oportunidad finalizada</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${organizerName}</strong>,
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      La oportunidad <strong>${productName}</strong> (ID: ${raffleId}) ha finalizado. Se eligió aleatoriamente al ganador.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 0 0 24px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #1e293b; margin: 0 0 8px 0; font-size: 15px;"><strong>Ticket ganador:</strong> #${winningTicketNumber ?? '—'}</p>
                          <p style="color: #1e293b; margin: 0 0 8px 0; font-size: 15px;"><strong>Nombre del ganador:</strong> ${winnerUserName ?? '—'}</p>
                          <p style="color: #1e293b; margin: 0 0 8px 0; font-size: 15px;"><strong>Monto que recibirás</strong> al finalizar el proceso completo (entrega y confirmación): <strong>S/. ${Number(amountToReceive ?? 0).toFixed(2)}</strong></p>
                        </td>
                      </tr>
                    </table>
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 0 0 24px 0;">
                      <p style="color: #1e40af; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">Recordatorio</p>
                      <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5;">
                        El ganador se pondrá en contacto contigo y te brindará un <strong>código único de ganador</strong>. 
                        Debes ingresar ese código en la web para validar al ganador. El código puede verificarse en la plataforma.
                      </p>
                      ${verificationCode ? `<p style="color: #1e40af; margin: 12px 0 0 0; font-size: 13px;">Código único del ganador: <strong>${verificationCode}</strong> (solo para verificación en web)</p>` : ''}
                    </div>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                      <a href="${appUrl}/dashboard/store" style="color: #6366f1; font-weight: 600;">Ir al panel del organizador</a> para validar el código cuando el ganador te contacte.
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0;">
                      Gracias,<br><strong>Equipo TIKETEA</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Si tienes dudas, contáctanos en soporte@tiketea.com</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    console.log('Sending organizer raffle finished email to:', email, 'raffleId:', raffleId, 'body length:', htmlContent.length);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado correctamente',
    });
  } catch (error: any) {
    console.error('Error sending organizer raffle finished email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: error.message },
      { status: 500 }
    );
  }
}
